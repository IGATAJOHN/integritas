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
    CategoryManagement,
    KycReview,
    AdminCourseDetail,
    CertificatePriceChanges,
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
                    path: 'lessons',
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
            path: 'kycreview',
            element: <KycReview />,
        },
    ],
};

export default adminRoutes;


