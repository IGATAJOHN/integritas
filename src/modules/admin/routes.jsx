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
    AdminLessonsByModule,
    CategoryManagement,
    KycReview,
    AdminCourseDetail,
    AdminCbtQuestionsPage,
    ProjectReview,
    ProjectGradePage,
    AdminTransactions,
    AuditLogPage,
    FoundationalProgram,
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
                    element: <Navigate to="courses" replace />,
                },
                {
                    path: 'courses',
                    element: <CourseManagement />,
                },
                {
                    path: 'courses/:courseId',
                    element: <AdminCourseDetail />,
                },
                {
                    path: 'courses/:courseId/lessons/:lessonId/quiz',
                    element: <AdminCbtQuestionsPage />,
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
            ],
        },
        {
            path: 'settings',
            element: <AdminSettings />,
        },
        {
            path: 'foundational',
            element: <FoundationalProgram />,
        },
        {
            path: 'kycreview',
            element: <KycReview />,
        },
        {
            path: 'project-submissions',
            element: <ProjectReview />,
        },
        {
            path: 'project-submissions/:id',
            element: <ProjectGradePage />,
        },
        {
            path: 'foundational-tutors',
            element: <Navigate to="/admin/foundational" replace />,
        },
        {
            path: 'transactions',
            element: <AdminTransactions />,
        },
        {
            path: 'audit-logs',
            element: <AuditLogPage />,
        },
    ],
};

export default adminRoutes;
