from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import CourseViewSet

router = SimpleRouter(trailing_slash=False)
router.register('courses', CourseViewSet, basename='courses')

urlpatterns = [
    path('', include(router.urls)),
]
