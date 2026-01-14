import { createBrowserRouter } from 'react-router-dom';

// Layouts
import { MainLayout } from '../layouts';
import AdminLayout from './layouts/AdminLayout';
import TutorLayout from './layouts/TutorLayout';
import LearnerLayout from './layouts/LearnerLayout';
import ModernLearnerLayout from './layouts/ModernLearnerLayout';

// Pages
import { Home, NotFound, LandingPage, LoginPage, VerifyPage, ForgotPasswordPage } from '../pages';

import { AdminDashboard, UserManagement, AdminSettings } from '../modules/admin';

import { TutorDashboard, MyCourses, Students } from '../modules/tutor';

import { LearnerDashboard, BrowseCourses, MyEnrollments, MyLearning, CourseLesson, CourseLessonV2, Checkout, MyProgress, Explore, CourseDetail, PaymentSuccess } from '../modules/learner';

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
        path: '/verify',
        element: <VerifyPage />,
    },
    {
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
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
    {
        path: '/explore',
        element: <ModernLearnerLayout />,
        children: [
            {
                index: true,
                element: <Explore />,
            },
            {
                path: 'my-learning',
                element: <MyLearning />,
            },
            {
                path: 'courses',
                element: <BrowseCourses />,
            },
            {
                path: 'enrollments',
                element: <MyEnrollments />,
            },
            {
                path: 'progress',
                element: <MyProgress />,
            },
        ],
    },
    {
        path: '/explore/course/:courseId',
        element: <CourseDetail />,
    },
    {
        path: '/explore/lesson/:courseId/:lessonId',
        element: <CourseLesson />,
    },
    {
        path: '/explore/lesson-v2/:courseId/:lessonId',
        element: <CourseLessonV2 />,
    },
    {
        path: '/checkout',
        element: <Checkout />,
    },
    {
        path: '/payment-success',
        element: <PaymentSuccess />,
    },
]);

export default router;
