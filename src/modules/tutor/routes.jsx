import TutorLayout from './layouts/TutorLayout';
import { TutorDashboard, MyCourses, Students, CreateCourse, Kyc } from './pages';

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
            path: 'create-course',
            element: <CreateCourse />,
        },
        {
            path: 'students',
            element: <Students />,
        },
        {
            path: 'kyc',
            element: <Kyc />,
        },
    ],
};

export default tutorRoutes;

