import { createBrowserRouter } from 'react-router-dom';

// Layouts
import { MainLayout } from '../layouts';
import AdminLayout from './layouts/AdminLayout';
import TutorLayout from './layouts/TutorLayout';
import LearnerLayout from './layouts/LearnerLayout';
import ModernLearnerLayout from './layouts/ModernLearnerLayout';

// Pages
import { Home, NotFound, LandingPage, LoginPage, VerifyPage, ForgotPasswordPage } from '../pages';

// Admin Module
import { AdminDashboard, UserManagement, AdminSettings } from '../modules/admin';

// Tutor Module
import { TutorDashboard, MyCourses, Students } from '../modules/tutor';

// Learner Module
import { LearnerDashboard, BrowseCourses, MyEnrollments, MyLearning, CourseLesson, CourseLessonV2, Checkout, MyProgress, Explore, CourseDetail } from '../modules/learner';

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
    // Explore Routes (formerly Learner)
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
    // Course Detail - Full Page (outside layout)
    {
        path: '/explore/course/:courseId',
        element: <CourseDetail />,
    },
    // Course Lesson - Full Page (outside layout)
    {
        path: '/explore/lesson/:courseId/:lessonId',
        element: <CourseLesson />,
    },
    // Course Lesson V2 - Full Page with Left Sidebar
    {
        path: '/explore/lesson-v2/:courseId/:lessonId',
        element: <CourseLessonV2 />,
    },
    // Checkout Page
    {
        path: '/checkout',
        element: <Checkout />,
    },
]);

export default router;
