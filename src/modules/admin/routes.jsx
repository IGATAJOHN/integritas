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
                    path: 'lessons',
                    element: <CategoryManagement />,
                },
            ],
        },
        {
            path: 'settings',
            element: <AdminSettings />,
        },
    ],
};

export default adminRoutes;


