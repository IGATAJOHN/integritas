import { createBrowserRouter } from 'react-router-dom';

// Layouts
import { MainLayout } from '../layouts';
import AdminLayout from './layouts/AdminLayout';
import TutorLayout from './layouts/TutorLayout';
import LearnerLayout from './layouts/LearnerLayout';

// Pages
import { Home, NotFound, LandingPage, LoginPage } from '../pages';

// Admin Module
import { AdminDashboard, UserManagement, AdminSettings } from '../modules/admin';

// Tutor Module
import { TutorDashboard, MyCourses, Students } from '../modules/tutor';

// Learner Module
import { LearnerDashboard, BrowseCourses, MyEnrollments } from '../modules/learner';

const router = createBrowserRouter([
    {
        path: '/',
        element: <LandingPage />,
    },
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/home',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <Home />,
            },
            {
                path: '*',
                element: <NotFound />,
            },
        ],
    },
    // Admin Routes
    {
        path: '/admin',
        element: <AdminLayout />,
        children: [
            {
                index: true,
                element: <AdminDashboard />,
            },
            {
                path: 'users',
                element: <UserManagement />,
            },
            {
                path: 'settings',
                element: <AdminSettings />,
            },
        ],
    },
    // Tutor Routes
    {
        path: '/tutor',
        element: <TutorLayout />,
        children: [
            {
                index: true,
                element: <TutorDashboard />,
            },
            {
                path: 'courses',
                element: <MyCourses />,
            },
            {
                path: 'students',
                element: <Students />,
            },
        ],
    },
    // Learner Routes
    {
        path: '/learner',
        element: <LearnerLayout />,
        children: [
            {
                index: true,
                element: <LearnerDashboard />,
            },
            {
                path: 'courses',
                element: <BrowseCourses />,
            },
            {
                path: 'enrollments',
                element: <MyEnrollments />,
            },
        ],
    },
]);

export default router;
