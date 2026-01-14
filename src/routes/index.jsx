import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../layouts';
import { Home, NotFound, LandingPage, LoginPage, VerifyPage, ForgotPasswordPage } from '../pages';
import { adminRoutes } from '../modules/admin';
import { tutorRoutes } from '../modules/tutor';
import { learnerRoutes } from '../modules/learner';

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
    adminRoutes,
    tutorRoutes,
    ...learnerRoutes,
]);

export default router;
