from django.urls import path
from .views import AdminQuizQuestionsView, AdminCbtQuestionDeleteView, QuizAttemptView

urlpatterns = [
    # CBT questions endpoints mapped to lesson ID
    path('admin/lesson-versions/<int:lesson_id>/cbt-questions', AdminQuizQuestionsView.as_view(), name='cbt_questions'),
    path('admin/cbt-questions/<int:question_id>', AdminCbtQuestionDeleteView.as_view(), name='delete_cbt_question'),
    path('lms/lessons/<int:lesson_id>/quiz/attempt', QuizAttemptView.as_view(), name='quiz_attempt'),
]
