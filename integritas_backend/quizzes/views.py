from rest_framework import status, views, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Quiz, Question, Option, Attempt
from courses.models import Lesson
from .serializers import QuizSerializer, QuestionSerializer, AttemptSerializer

class AdminQuizQuestionsView(views.APIView):
    """
    Handles GET /api/v1/admin/lesson-versions/{lesson_id}/cbt-questions
    Handles POST /api/v1/admin/lesson-versions/{lesson_id}/cbt-questions
    """
    # Simply using lesson_id directly instead of lesson_version_id
    def get(self, request, lesson_id):
        # Find or create quiz for the lesson
        lesson = get_object_or_404(Lesson, pk=lesson_id)
        quiz, _ = Quiz.objects.get_or_create(lesson=lesson)
        questions = quiz.questions.all()
        # Formulate mapping structure matching the frontend expectations
        # (prompt/options/points)
        data = []
        for q in questions:
            data.append({
                'id': q.id,
                'prompt': q.text,
                'points': q.points,
                'options': [{'id': o.id, 'body': o.text, 'is_correct': o.is_correct} for o in q.options.all()]
            })
        return Response({'data': data})

    def post(self, request, lesson_id):
        lesson = get_object_or_404(Lesson, pk=lesson_id)
        quiz, _ = Quiz.objects.get_or_create(lesson=lesson)
        
        prompt = request.data.get('prompt')
        points = request.data.get('points', 1)
        options_data = request.data.get('options', [])

        question = Question.objects.create(quiz=quiz, text=prompt, points=points)
        for opt in options_data:
            Option.objects.create(
                question=question, 
                text=opt.get('body', opt.get('text', '')), 
                is_correct=opt.get('is_correct', False)
            )

        return Response({
            'id': question.id,
            'prompt': question.text,
            'points': question.points,
            'options': [{'id': o.id, 'body': o.text, 'is_correct': o.is_correct} for o in question.options.all()]
        }, status=status.HTTP_201_CREATED)

class AdminCbtQuestionDeleteView(views.APIView):
    """
    Handles DELETE /api/v1/admin/cbt-questions/{question_id}
    """
    def delete(self, request, question_id):
        question = get_object_or_404(Question, pk=question_id)
        question.delete()
        return Response({'success': True}, status=status.HTTP_200_OK)

class QuizAttemptView(views.APIView):
    """
    Handles POST /api/v1/lms/lessons/{lesson_id}/quiz/attempt
    """
    def post(self, request, lesson_id):
        lesson = get_object_or_404(Lesson, pk=lesson_id)
        quiz = get_object_or_404(Quiz, lesson=lesson)
        
        answers = request.data.get('answers', {}) # format: {question_id: option_id}
        total_points = 0
        score_points = 0
        
        for question in quiz.questions.all():
            total_points += question.points
            selected_option_id = answers.get(str(question.id)) or answers.get(question.id)
            if selected_option_id:
                try:
                    option = Option.objects.get(pk=selected_option_id, question=question)
                    if option.is_correct:
                        score_points += question.points
                except Option.DoesNotExist:
                    pass

        score_percentage = int((score_points / total_points) * 100) if total_points > 0 else 100
        passed = score_percentage >= quiz.passing_score
        
        attempt = Attempt.objects.create(
            user=request.user,
            quiz=quiz,
            score=score_percentage,
            passed=passed
        )
        
        return Response({
            'id': attempt.id,
            'score': attempt.score,
            'passed': attempt.passed,
            'created_at': attempt.created_at.isoformat()
        }, status=status.HTTP_201_CREATED)


import random

class LearnerStartAttemptView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, lesson_slug):
        if str(lesson_slug).isdigit():
            lesson = get_object_or_404(Lesson, pk=lesson_slug)
        else:
            lesson = get_object_or_404(Lesson, slug=lesson_slug)

        quiz, _ = Quiz.objects.get_or_create(lesson=lesson)
        questions = list(quiz.questions.all())
        random.shuffle(questions)

        questions_payload = []
        questions_data = []

        for q in questions:
            options = list(q.options.all())
            random.shuffle(options)
            
            questions_payload.append({
                'id': q.id,
                'text': q.text,
                'options': [{'id': o.id, 'text': o.text} for o in options]
            })
            
            questions_data.append({
                'question_id': q.id,
                'option_ids': [o.id for o in options]
            })

        attempt = Attempt.objects.create(
            user=request.user,
            quiz=quiz,
            score=0,
            passed=False,
            questions_data=questions_data
        )

        return Response({
            'id': attempt.id,
            'questions': questions_payload,
            'attempts_remaining': 3
        })

class LearnerGetAttemptView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, attempt_id):
        attempt = get_object_or_404(Attempt, pk=attempt_id, user=request.user)
        questions_payload = []
        for item in attempt.questions_data:
            q_id = item.get('question_id')
            opt_ids = item.get('option_ids', [])
            try:
                q = Question.objects.get(pk=q_id)
                options = []
                for o_id in opt_ids:
                    try:
                        options.append(Option.objects.get(pk=o_id))
                    except Option.DoesNotExist:
                        pass
                questions_payload.append({
                    'id': q.id,
                    'text': q.text,
                    'options': [{'id': o.id, 'text': o.text} for o in options]
                })
            except Question.DoesNotExist:
                pass

        return Response({
            'id': attempt.id,
            'questions': questions_payload,
            'passed': attempt.passed,
            'score': attempt.score,
            'attempts_remaining': 3
        })

class LearnerSubmitAttemptView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, attempt_id):
        attempt = get_object_or_404(Attempt, pk=attempt_id, user=request.user)
        quiz = attempt.quiz
        answers_indices = request.data.get('answers', [])
        
        total_points = 0
        score_points = 0
        
        questions_data = attempt.questions_data
        for idx, item in enumerate(questions_data):
            q_id = item.get('question_id')
            opt_ids = item.get('option_ids', [])
            try:
                question = Question.objects.get(pk=q_id)
                total_points += question.points
                
                if idx < len(answers_indices):
                    selected_opt_idx = answers_indices[idx]
                    if 0 <= selected_opt_idx < len(opt_ids):
                        selected_option_id = opt_ids[selected_opt_idx]
                        option = Option.objects.filter(pk=selected_option_id, question=question).first()
                        if option and option.is_correct:
                            score_points += question.points
            except Question.DoesNotExist:
                pass

        score_percentage = int((score_points / total_points) * 100) if total_points > 0 else 100
        passed = score_percentage >= quiz.passing_score
        
        attempt.score = score_percentage
        attempt.passed = passed
        attempt.save()

        # Find next lesson
        current_lesson = quiz.lesson
        course = current_lesson.module.course
        all_lessons = list(Lesson.objects.filter(
            module__course=course,
            status='published'
        ).order_by('module__order', 'order', 'id'))
        
        next_lesson_slug = None
        try:
            idx = all_lessons.index(current_lesson)
            if idx + 1 < len(all_lessons):
                next_lesson_slug = all_lessons[idx + 1].slug
        except ValueError:
            pass

        return Response({
            'id': attempt.id,
            'passed': attempt.passed,
            'score': attempt.score,
            'pass_mark': quiz.passing_score,
            'attempts_remaining': 3,
            'next_lesson_slug': next_lesson_slug
        })
