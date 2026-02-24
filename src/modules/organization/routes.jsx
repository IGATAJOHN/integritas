import { Navigate } from 'react-router-dom';
import OrganizationLayout from './layouts/OrganizationLayout';
import {
    OrganizationDashboard,
    CreateOrganization,
    OrganizationInvitations,
    OrganizationLearningPaths,
    OrganizationAssignments,
    OrganizationReports,
    OrganizationMyAssignments,
} from './pages';

const organizationRoutes = {
    path: '/org',
    element: <OrganizationLayout />,
    children: [
        {
            index: true,
            element: <OrganizationDashboard />,
        },
        {
            path: 'create',
            element: <CreateOrganization />,
        },
        {
            path: 'invitations',
            element: <OrganizationInvitations />,
        },
        {
            path: 'learning-paths',
            element: <OrganizationLearningPaths />,
        },
        {
            path: 'assignments',
            element: <OrganizationAssignments />,
        },
        {
            path: 'reports',
            element: <OrganizationReports />,
        },
        {
            path: 'my-assignments',
            element: <OrganizationMyAssignments />,
        },
        {
            path: '*',
            element: <Navigate to="/org" replace />,
        },
    ],
};

export default organizationRoutes;
