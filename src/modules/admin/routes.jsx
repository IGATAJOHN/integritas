import AdminLayout from './layouts/AdminLayout';
import { AdminDashboard, UserManagement, AdminSettings } from './pages';

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
            element: <UserManagement />,
        },
        {
            path: 'settings',
            element: <AdminSettings />,
        },
    ],
};

export default adminRoutes;
