import ModernLearnerLayout from './layouts/ModernLearnerLayout';
import { Navigate } from 'react-router-dom';
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
    LearnerDashboard,
    OrganizationOverview,
    OrganizationInvitations,
    OrganizationLearningPaths,
    OrganizationAssignments,
    OrganizationReports,
} from './pages';


export const learnerRoutes = [
    {
        path: '/explore',
        element: <Explore />,
    },
    {
        element: <ModernLearnerLayout />,
        children: [
            {
                path: '/explore/my-learning',
                element: <MyLearning />,
            },
            {
                path: '/explore/courses',
                element: <BrowseCourses />,
            },
            {
                path: '/explore/enrollments',
                element: <MyEnrollments />,
            },
            {
                path: '/explore/progress',
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
    {
        path: '/learner',
        element: <ModernLearnerLayout />,
        children: [
            {
                index: true,
                element: <LearnerDashboard />,
            },
            {
                path: 'organization',
                element: <Navigate to="overview" replace />,
            },
            {
                path: 'organization/overview',
                element: <OrganizationOverview />,
            },
            {
                path: 'organization/invite',
                element: <OrganizationInvitations />,
            },
            {
                path: 'organization/my-assignments',
                element: <OrganizationAssignments />,
            },
            {
                path: 'organization/invitations',
                element: <Navigate to="../invite" replace />,
            },
            {
                path: 'organization/learning-paths',
                element: <OrganizationLearningPaths />,
            },
            {
                path: 'organization/assignments',
                element: <OrganizationAssignments />,
            },
            {
                path: 'organization/reports',
                element: <OrganizationReports />,
            },
        ],
    },
];

export default learnerRoutes;
