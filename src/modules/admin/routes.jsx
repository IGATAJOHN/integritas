import { Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import {
    AdminDashboard,
    AdminSettings,
    StaffManagement,
    LearnerManagement,
    TutorManagement,
    ReviewerManagement,
    CourseManagement,
    EssentialCourseManagement,
    AdminLessonsByModule,
    CategoryManagement,
    KycReview,
    AdminCourseDetail,
    CertificatePriceChanges,
    OrganizationOverview,
    OrganizationInvitations,
    OrganizationLearningPaths,
    OrganizationAssignments,
    OrganizationReports,
} from './pages';

const adminRoutes = {
    path: '/admin',
    element: <AdminLayout />,
    children: [
        {
            index: true,
            element: <AdminDashboard />,
        },
        {
            path: 'users',
            children: [
                {
                    index: true,
                    element: <Navigate to="staff" replace />,
                },
                {
                    path: 'staff',
                    element: <StaffManagement />,
                },
                {
                    path: 'learners',
                    element: <LearnerManagement />,
                },
                {
                    path: 'tutors',
                    element: <TutorManagement />,
                },
                {
                    path: 'reviewers',
                    element: <ReviewerManagement />,
                },
            ],
        },
        {
            path: 'content',
            children: [
                {
                    index: true,
                    element: <Navigate to="essential-courses" replace />,
                },
                {
                    path: 'essential-courses',
                    element: <EssentialCourseManagement />,
                },
                {
                    path: 'courses',
                    element: <Navigate to="/admin/content/essential-courses" replace />,
                },
                {
                    path: 'legacy-courses',
                    element: <CourseManagement />,
                },
                {
                    path: 'courses/:courseId',
                    element: <AdminCourseDetail />,
                },
                {
                    path: 'lessons-by-admin',
                    element: <AdminLessonsByModule />,
                },
                {
                    path: 'lessons',
                    element: <Navigate to="/admin/content/lessons-by-admin" replace />,
                },
                {
                    path: 'categories',
                    element: <CategoryManagement />,
                },
                {
                    path: 'price-changes',
                    element: <CertificatePriceChanges />,
                },
            ],
        },
        {
            path: 'settings',
            element: <AdminSettings />,
        },
        {
            path: 'organization',
            children: [
                {
                    index: true,
                    element: <Navigate to="overview" replace />,
                },
                {
                    path: 'overview',
                    element: <OrganizationOverview />,
                },
                {
                    path: 'invitations',
                    element: <OrganizationInvitations />,
                },
                {
                    path: 'learning-paths',
                    element: <OrganizationLearningPaths />,
                },
                {
                    path: 'assignments',
                    element: <OrganizationAssignments />,
                },
                {
                    path: 'reports',
                    element: <OrganizationReports />,
                },
            ],
        },
        {
            path: 'kycreview',
            element: <KycReview />,
        },
    ],
};

export default adminRoutes;
