from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import (
    CourseViewSet, ModuleDetailView, CourseModulesView, CourseModulesReorderView,
    ModuleLessonsView, ModuleLessonsReorderView, LessonDetailView,
    LessonPublishView, LessonUnpublishView, LessonVideoUploadView
)

router = SimpleRouter(trailing_slash=False)
router.register('courses', CourseViewSet, basename='courses')

urlpatterns = [
    path('', include(router.urls)),
    
    # Modules
    path('courses/<int:course_id>/modules', CourseModulesView.as_view(), name='course_modules'),
    path('courses/<int:course_id>/modules/reorder', CourseModulesReorderView.as_view(), name='course_modules_reorder'),
    path('modules/<int:module_id>', ModuleDetailView.as_view(), name='module_detail'),
    
    # Lessons
    path('modules/<int:module_id>/lessons', ModuleLessonsView.as_view(), name='module_lessons'),
    path('modules/<int:module_id>/lessons/reorder', ModuleLessonsReorderView.as_view(), name='module_lessons_reorder'),
    path('lessons/<int:lesson_id>', LessonDetailView.as_view(), name='lesson_detail'),
    path('lessons/<int:lesson_id>/publish', LessonPublishView.as_view(), name='lesson_publish'),
    path('lessons/<int:lesson_id>/unpublish', LessonUnpublishView.as_view(), name='lesson_unpublish'),
    path('lessons/<int:lesson_id>/video', LessonVideoUploadView.as_view(), name='lesson_video_upload'),
]

