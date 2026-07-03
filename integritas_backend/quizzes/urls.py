from django.urls import path
from .views import (
    AdminQuizQuestionsView, AdminCbtQuestionDeleteView, QuizAttemptView,
    LearnerStartAttemptView, LearnerGetAttemptView, LearnerSubmitAttemptView
)

urlpatterns = [
    # CBT questions endpoints mapped to lesson ID
    path('admin/lesson-versions/<int:lesson_id>/cbt-questions', AdminQuizQuestionsView.as_view(), name='cbt_questions'),
    path('admin/cbt-questions/<int:question_id>', AdminCbtQuestionDeleteView.as_view(), name='delete_cbt_question'),
    path('lms/lessons/<int:lesson_id>/quiz/attempt', QuizAttemptView.as_view(), name='quiz_attempt'),
    
    # Learner CBT attempts
    path('learner/lessons/<str:lesson_slug>/cbt/attempts', LearnerStartAttemptView.as_view(), name='learner_start_attempt'),
    path('learner/cbt/attempts/<int:attempt_id>', LearnerGetAttemptView.as_view(), name='learner_get_attempt'),
    path('learner/cbt/attempts/<int:attempt_id>/submit', LearnerSubmitAttemptView.as_view(), name='learner_submit_attempt'),
]
