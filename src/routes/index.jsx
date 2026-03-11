import { createBrowserRouter, Navigate } from 'react-router-dom';
import { NotFound, LandingPage, LoginPage, SignupPage, VerifyPage, ForgotPasswordPage, InviteAcceptPage } from '../pages';
import { adminRoutes } from '../modules/admin';
import { tutorRoutes } from '../modules/tutor';
import { learnerRoutes } from '../modules/learner';
import ProtectedRoute from '../components/ProtectedRoute';
import PublicRoute from '../components/PublicRoute';
import OnboardingGuard from '../components/OnboardingGuard';

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
        path: '/verify/:id/:hash',
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
        path: '/org-invitations/accept',
        element: <InviteAcceptPage />,
    },
    {
        path: '/accept-invite',
        element: <InviteAcceptPage />,
    },
    {
        path: '/org-invitations/public/accept',
        element: <InviteAcceptPage />,
    },
    {
        ...adminRoutes,
        element: (
            <ProtectedRoute>
                {adminRoutes.element}
            </ProtectedRoute>
        ),
    },
    // adminRoutes,
    {
        ...tutorRoutes,
        element: (
            <ProtectedRoute>
                <OnboardingGuard>
                    {tutorRoutes.element}
                </OnboardingGuard>
            </ProtectedRoute>
        ),
    },
    {
        path: '/org/*',
        element: (
            <ProtectedRoute>
                <Navigate to="/learner/organization/overview" replace />
            </ProtectedRoute>
        ),
    },
    //  tutorRoutes,
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
