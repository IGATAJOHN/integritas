import ModernLearnerLayout from './layouts/ModernLearnerLayout';
import {
    Explore,
    MyLearning,
    BrowseCourses,
    MyEnrollments,
    MyProgress,
    CourseDetail,
    CourseLesson,
    CourseLessonV2,
    Checkout,
    PaymentSuccess,
} from './pages';

export const learnerRoutes = [
    {
        path: '/explore',
        element: <ModernLearnerLayout />,
        children: [
            {
                index: true,
                element: <Explore />,
            },
            {
                path: 'my-learning',
                element: <MyLearning />,
            },
            {
                path: 'courses',
                element: <BrowseCourses />,
            },
            {
                path: 'enrollments',
                element: <MyEnrollments />,
            },
            {
                path: 'progress',
                element: <MyProgress />,
            },
        ],
    },
    {
        path: '/explore/course/:courseId',
        element: <CourseDetail />,
    },
    {
        path: '/explore/lesson/:courseId/:lessonId',
        element: <CourseLesson />,
    },
    {
        path: '/explore/lesson-v2/:courseId/:lessonId',
        element: <CourseLessonV2 />,
    },
    {
        path: '/checkout',
        element: <Checkout />,
    },
    {
        path: '/payment-success',
        element: <PaymentSuccess />,
    },
];

export default learnerRoutes;
