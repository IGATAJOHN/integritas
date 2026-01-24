import { createBrowserRouter, Navigate } from 'react-router-dom';
import { NotFound, LandingPage, LoginPage, SignupPage, VerifyPage, ForgotPasswordPage } from '../pages';
import { adminRoutes } from '../modules/admin';
import { tutorRoutes } from '../modules/tutor';
import { learnerRoutes } from '../modules/learner';
import ProtectedRoute from '../components/ProtectedRoute';
import PublicRoute from '../components/PublicRoute';

const router = createBrowserRouter([
    {
        path: '/',
        element: <LandingPage />,
    },
    {
        path: '/login',
        element: (
            <PublicRoute>
                <LoginPage />
            </PublicRoute>
        ),
    },
    {
        path: '/signup',
        element: (
            <PublicRoute>
                <SignupPage />
            </PublicRoute>
        ),
    },
    {
        path: '/verify',
        element: <VerifyPage />,
    },
    {
        path: '/forgot-password',
        element: (
            <PublicRoute>
                <ForgotPasswordPage />
            </PublicRoute>
        ),
    },
    {
        ...adminRoutes,
        element: (
            <ProtectedRoute>
                {adminRoutes.element}
            </ProtectedRoute>
        ),
    },
    {
        ...tutorRoutes,
        element: (
            <ProtectedRoute>
                {tutorRoutes.element}
            </ProtectedRoute>
        ),
    },
    ...learnerRoutes.map(route => ({
        ...route,
        element: (
            <ProtectedRoute>
                {route.element}
            </ProtectedRoute>
        ),
    })),
    {
        path: '*',
        element: <NotFound />,
    },
]);

export default router;
