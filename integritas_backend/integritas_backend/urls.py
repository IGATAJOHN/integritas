from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from authentication.views import (
    MeView, AdminTutorsView, AdminTutorInvitesView, AdminTutorInviteRevokeView,
    AdminFoundationalTutorsView, AdminFoundationalTutorDetailView,
    AdminFoundationalTutorAvatarView, AdminFoundationalTutorResetPasswordView
)
from enrollments.views import MyEnrollmentsView, MyTransactionsView


urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints under v1 namespace
    path('api/v1/auth/', include('authentication.urls')),
    path('api/v1/lms/', include('courses.urls')),
    path('api/v1/catalogue/', include('courses.urls')), # route catalogue endpoint calls too
    path('api/v1/admin/', include('courses.urls')), # route admin courses calls too
    path('api/v1/admin/tutors', AdminTutorsView.as_view(), name='admin_tutors'),
    path('api/v1/admin/foundational-tutors', AdminFoundationalTutorsView.as_view(), name='admin_foundational_tutors'),
    path('api/v1/admin/foundational-tutors/invites', AdminTutorInvitesView.as_view(), name='admin_tutor_invites'),
    path('api/v1/admin/foundational-tutors/invites/<str:invite_id>', AdminTutorInviteRevokeView.as_view(), name='admin_tutor_invite_revoke'),
    path('api/v1/admin/foundational-tutors/<int:user_id>', AdminFoundationalTutorDetailView.as_view(), name='admin_foundational_tutor_detail'),
    path('api/v1/admin/foundational-tutors/<int:user_id>/avatar', AdminFoundationalTutorAvatarView.as_view(), name='admin_foundational_tutor_avatar'),
    path('api/v1/admin/foundational-tutors/<int:user_id>/reset-password', AdminFoundationalTutorResetPasswordView.as_view(), name='admin_foundational_tutor_reset_password'),
    path('api/v1/enrolment/', include('enrollments.urls')),
    path('api/v1/', include('quizzes.urls')), # quiz CBT endpoints registered under /api/v1 namespace
    path('api/v1/me/enrolments', MyEnrollmentsView.as_view(), name='my_enrolments'),
    path('api/v1/me/transactions', MyTransactionsView.as_view(), name='my_transactions'),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
