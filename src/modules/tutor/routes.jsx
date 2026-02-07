import TutorLayout from './layouts/TutorLayout';
import { TutorDashboard, MyCourses, Students, CreateCourse, Kyc, CourseEditor, CourseDashboard, AddQuestion } from './pages';

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
            path: 'courses/:courseId',
            element: <CourseDashboard />,
        },
        {
            path: 'courses/:courseId/modules/:moduleId/lessons/:lessonId',
            element: <CourseEditor />,
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
        {
            path: 'courses/:courseId/modules/:moduleId/lessons/:lessonId/questions',
            element: <AddQuestion />,
        },
    ],
};

export default tutorRoutes;

