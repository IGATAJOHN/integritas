from django.urls import path
from .views import InitiateEnrollmentView, VerifyEnrollmentView

urlpatterns = [
    path('initiate', InitiateEnrollmentView.as_view(), name='initiate'),
    path('verify', VerifyEnrollmentView.as_view(), name='verify'),
]
