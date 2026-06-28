from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from authentication.views import (
    MeView, AdminTutorsView, AdminTutorInvitesView, AdminTutorInviteRevokeView,
    AdminFoundationalTutorsView, AdminFoundationalTutorDetailView,
    AdminFoundationalTutorAvatarView, AdminFoundationalTutorResetPasswordView,
    AdminStaffView, AdminStaffDetailView, AdminStaffRolesView,
    AdminStaffPermissionsView, AdminStaffResetPasswordView, AdminStaffSuspendView,
    AdminStaffUnsuspendView, AdminStaffAvatarView, MyNotificationsView,
    MyNotificationsUnreadCountView, MyNotificationsReadView, MyNotificationsReadAllView,
    SupportUsersView, TutorProfileView, TutorKycSubmitView, TutorKycUpdateView,
    TutorEarningsView, AdminKycQueueView, AdminKycDetailView, AdminKycApproveView,
    AdminKycRejectView
)
from enrollments.views import (
    MyEnrollmentsView, MyTransactionsView, AdminEnrollmentsView,
    AdminTransactionsView, AdminTransactionDetailView, AdminTransactionManualRefundView,
    SupportTransactionFlagRefundView, AdminRefundRequestsListView,
    AdminRefundRequestApproveView, AdminRefundRequestRejectView
)
from courses.views import (
    CategoryListView, CategoryDetailView, LearnerCourseProjectView,
    AdminProjectSubmissionsView, AdminProjectSubmissionDetailView,
    AdminProjectSubmissionGradeView
)





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
    
    # Staff
    path('api/v1/admin/staff', AdminStaffView.as_view(), name='admin_staff'),
    path('api/v1/admin/staff/<int:user_id>', AdminStaffDetailView.as_view(), name='admin_staff_detail'),
    path('api/v1/admin/staff/<int:user_id>/roles', AdminStaffRolesView.as_view(), name='admin_staff_roles'),
    path('api/v1/admin/staff/<int:user_id>/permissions', AdminStaffPermissionsView.as_view(), name='admin_staff_permissions'),
    path('api/v1/admin/staff/<int:user_id>/reset-password', AdminStaffResetPasswordView.as_view(), name='admin_staff_reset_password'),
    path('api/v1/admin/staff/<int:user_id>/suspend', AdminStaffSuspendView.as_view(), name='admin_staff_suspend'),
    path('api/v1/admin/staff/<int:user_id>/unsuspend', AdminStaffUnsuspendView.as_view(), name='admin_staff_unsuspend'),
    path('api/v1/admin/staff/<int:user_id>/avatar', AdminStaffAvatarView.as_view(), name='admin_staff_avatar'),
    
    # Notifications
    path('api/v1/me/notifications', MyNotificationsView.as_view(), name='my_notifications'),
    path('api/v1/me/notifications/unread-count', MyNotificationsUnreadCountView.as_view(), name='my_notifications_unread_count'),
    path('api/v1/me/notifications/<int:notification_id>/read', MyNotificationsReadView.as_view(), name='my_notifications_read'),
    path('api/v1/me/notifications/read-all', MyNotificationsReadAllView.as_view(), name='my_notifications_read_all'),
    
    path('api/v1/enrolment/', include('enrollments.urls')),
    path('api/v1/support/users', SupportUsersView.as_view(), name='support_users'),
    path('api/v1/admin/enrolments', AdminEnrollmentsView.as_view(), name='admin_enrolments'),
    path('api/v1/admin/transactions', AdminTransactionsView.as_view(), name='admin_transactions'),
    path('api/v1/admin/transactions/<int:transaction_id>', AdminTransactionDetailView.as_view(), name='admin_transaction_detail'),
    path('api/v1/admin/transactions/<int:transaction_id>/manual-refund', AdminTransactionManualRefundView.as_view(), name='admin_transaction_manual_refund'),
    
    # Refund Requests
    path('api/v1/support/transactions/<int:transaction_id>/flag-refund', SupportTransactionFlagRefundView.as_view(), name='support_transaction_flag_refund'),
    path('api/v1/admin/refund-requests', AdminRefundRequestsListView.as_view(), name='admin_refund_requests'),
    path('api/v1/admin/refund-requests/<int:request_id>/approve', AdminRefundRequestApproveView.as_view(), name='admin_refund_request_approve'),
    path('api/v1/admin/refund-requests/<int:request_id>/reject', AdminRefundRequestRejectView.as_view(), name='admin_refund_request_reject'),
    
    path('api/v1/categories', CategoryListView.as_view(), name='categories'),
    path('api/v1/categories/<int:category_id>', CategoryDetailView.as_view(), name='category_detail'),
    
    # Project Submissions
    path('api/v1/learner/courses/<str:course_slug>/project', LearnerCourseProjectView.as_view(), name='learner_course_project'),
    path('api/v1/admin/project-submissions', AdminProjectSubmissionsView.as_view(), name='admin_project_submissions'),
    path('api/v1/admin/project-submissions/<int:submission_id>', AdminProjectSubmissionDetailView.as_view(), name='admin_project_submission_detail'),
    path('api/v1/admin/project-submissions/<int:submission_id>/grade', AdminProjectSubmissionGradeView.as_view(), name='admin_project_submission_grade'),
    
    # Tutor KYC / Profile / Earnings / Banking
    path('api/v1/me/expert/profile', TutorProfileView.as_view(), name='tutor_profile'),
    path('api/v1/me/expert/kyc', TutorKycSubmitView.as_view(), name='tutor_kyc_submit'),
    path('api/v1/me/expert/banking', TutorKycUpdateView.as_view(), name='tutor_kyc_update'),
    path('api/v1/me/expert/earnings', TutorEarningsView.as_view(), name='tutor_earnings'),
    
    # Admin KYC Queue
    path('api/v1/admin/kyc-queue', AdminKycQueueView.as_view(), name='admin_kyc_queue'),
    path('api/v1/admin/kyc-queue/<int:kyc_id>', AdminKycDetailView.as_view(), name='admin_kyc_detail'),
    path('api/v1/admin/kyc-queue/<int:kyc_id>/approve', AdminKycApproveView.as_view(), name='admin_kyc_approve'),
    path('api/v1/admin/kyc-queue/<int:kyc_id>/reject', AdminKycRejectView.as_view(), name='admin_kyc_reject'),
    
    path('api/v1/', include('quizzes.urls')), # quiz CBT endpoints registered under /api/v1 namespace
    path('api/v1/me/enrolments', MyEnrollmentsView.as_view(), name='my_enrolments'),
    path('api/v1/me/transactions', MyTransactionsView.as_view(), name='my_transactions'),





]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
