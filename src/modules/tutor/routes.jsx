import TutorLayout from './layouts/TutorLayout';
import {
    TutorDashboard,
    MyCourses,
    Students,
    CreateCourse,
    Kyc,
    CourseEditor,
    CourseDashboard,
    AddQuestion,
    AssignedLessons,
    LessonStatsPage,
    BankingDetails,
    Earnings,
} from './pages';

const tutorRoutes = {
    path: '/tutor',
    element: <TutorLayout />,
    children: [
        {
            index: true,
            element: <TutorDashboard />,
        },
        {
            path: 'lessons',
            element: <AssignedLessons />,
        },
        {
            path: 'lessons/:lessonId',
            element: <LessonStatsPage />,
        },
        {
            path: 'banking',
            element: <BankingDetails />,
        },
        {
            path: 'earnings',
            element: <Earnings />,
        },
        {
            path: 'students',
            element: <Students />,
        },
        {
            path: 'kyc',
            element: <Kyc />,
        },
        // Legacy authoring routes — kept for now but no longer linked from nav.
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
            path: 'courses/:courseId/modules/:moduleId/lessons/:lessonId/questions',
            element: <AddQuestion />,
        },
    ],
};

export default tutorRoutes;

