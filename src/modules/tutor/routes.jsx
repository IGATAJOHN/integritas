import TutorLayout from './layouts/TutorLayout';
import { TutorDashboard, MyCourses, Students } from './pages';

const tutorRoutes = {
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
};

export default tutorRoutes;
