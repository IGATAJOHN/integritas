from django.urls import path
from .views import (
    LoginView, RegisterView, MeView, LogoutView,
    ResendEmailVerificationView, EmailVerifyView
)

urlpatterns = [
    path('login', LoginView.as_view(), name='login'),
    path('register', RegisterView.as_view(), name='register'),
    path('me', MeView.as_view(), name='me'),
    path('logout', LogoutView.as_view(), name='logout'),
    
    # Email Verification
    path('email/verify/resend', ResendEmailVerificationView.as_view(), name='email_verify_resend'),
    path('email/verify/<str:user_id>/<str:token_hash>', EmailVerifyView.as_view(), name='email_verify'),
]
