import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { NotFound, LandingPage, AboutUsPage, PartnersPage, ContactPage, LoginPage, SignupPage, VerifyPage, ForgotPasswordPage, InviteAcceptPage } from '../pages';
import { adminRoutes } from '../modules/admin';
import { tutorRoutes } from '../modules/tutor';
import { learnerRoutes } from '../modules/learner';
import ProtectedRoute from '../components/ProtectedRoute';
import PublicRoute from '../components/PublicRoute';
import OnboardingGuard from '../components/OnboardingGuard';
import ScrollToTop from '../components/ScrollToTop';

const RootLayout = () => (
    <>
        <ScrollToTop />
        <Outlet />
    </>
);

const PUBLIC_LEARNER_PATHS = [
    '/explore',
    '/explore/courses',
    '/explore/course/:courseId',
    '/explore/foundational',
    '/explore/experta',
    '/payment-success',
    '/payment/success',
];

const router = createBrowserRouter([
    {
        element: <RootLayout />,
        children: [
    {
        path: '/',
        element: <LandingPage />,
    },
    {
        path: '/about-us',
        element: <AboutUsPage />,
    },
    {
        path: '/partners',
        element: <PartnersPage />,
    },
    {
        path: '/contact',
        element: <ContactPage />,
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
    ...learnerRoutes.map(route => {
        const isPublic = PUBLIC_LEARNER_PATHS.includes(route.path);
        
        // If it's a layout route (no path) or not in the whitelist, protect it
        if (!route.path || !isPublic) {
            return {
                ...route,
                element: (
                    <ProtectedRoute>
                        {route.element}
                    </ProtectedRoute>
                ),
            };
        }
        
        // Return public route as is
        return route;
    }),
    {
        path: '*',
        element: <NotFound />,
    },
        ],
    },
]);

export default router;
