import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Stack,
    Card,
    CardMedia,
    CardContent
} from '@mui/material';
import {
    Star as StarIcon,
    AccessTime as ClockIcon,
    School as SchoolIcon,
    SignalCellularAlt as LevelIcon
} from '@mui/icons-material';

const CourseCard = ({ course, colors }) => {
    const navigate = useNavigate();
    const fallbackImage = useMemo(
        () => 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><rect width="100%" height="100%" fill="%23111827"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239CA3AF" font-size="28">Course Image</text></svg>',
        []
    );

    const safeCoursePathId = String(course?.id || '').trim();
    const safeLevel = String(course?.level || 'Unspecified');
    const safeTitle = String(course?.title || 'Untitled Course');
    const safeDescription = String(course?.description || 'No description available.');
    const safeInstructor = String(course?.instructor || 'Integritas Hub');
    const safeRating = Number(course?.rating || 0).toFixed(1);
    const safeReviews = Number(course?.reviews || 0);
    const safeDuration = String(course?.duration || 'TBD');
    const safeImage = String(course?.image || '').trim() || fallbackImage;

    const getLevelColor = (level) => {
        switch (level) {
            case 'Beginner': return '#3B82F6';
            case 'Intermediate': return '#10B981';
            case 'Advanced': return '#F59E0B';
            default: return '#3B82F6';
        }
    };

    return (
        <Card
            onClick={() => safeCoursePathId && navigate(`/explore/course/${safeCoursePathId}`)}
            sx={{
                bgcolor: colors.card,
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)'
                },
                boxShadow: 'none',
                width: '100%',
                height: '100%',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxSizing: 'border-box'
            }}>
            {/* Image Container with Level Badge */}
            <Box sx={{
                position: 'relative',
                height: 200,
                background: 'linear-gradient(135deg, rgba(20, 30, 48, 1) 0%, rgba(36, 59, 85, 0.8) 100%)'
            }}>
                <CardMedia
                    component="img"
                    image={safeImage}
                    alt={safeTitle}
                    onError={(event) => {
                        event.currentTarget.src = fallbackImage;
                    }}
                    sx={{
                        height: '100%',
                        width: '100%',
                        objectFit: 'cover',
                        opacity: 0.9
                    }}
                />
                {/* Level Badge */}
                <Box sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(8px)',
                    color: colors.text,
                    px: 1.5,
                    py: 0.6,
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.8,
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <LevelIcon sx={{
                        fontSize: 14,
                        color: getLevelColor(safeLevel)
                    }} />
                    {safeLevel}
                </Box>
            </Box>

            {/* Card Content */}
            <CardContent sx={{
                p: 3,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 2
            }}>
                {/* Title */}
                <Typography variant="h6" sx={{
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    lineHeight: 1.3,
                    color: colors.text,
                    minHeight: '2.6em',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {safeTitle}
                </Typography>

                {/* Description */}
                <Typography variant="body2" sx={{
                    color: colors.textSecondary,
                    fontSize: '0.875rem',
                    lineHeight: 1.5,
                    minHeight: '3em',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {safeDescription}
                </Typography>

                {/* Instructor/Institution */}
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 'auto' }}>
                    <Box sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        bgcolor: 'rgba(37, 99, 235, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(37, 99, 235, 0.3)'
                    }}>
                        <SchoolIcon sx={{ color: colors.primary, fontSize: 18 }} />
                    </Box>
                    <Box>
                        <Typography variant="caption" sx={{
                            color: colors.textSecondary,
                            display: 'block',
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                        }}>
                            {course?.type === 'institution' ? 'Institution' : 'Instructor'}
                        </Typography>
                        <Typography variant="body2" sx={{
                            fontWeight: 600,
                            color: colors.text,
                            fontSize: '0.9rem'
                        }}>
                            {safeInstructor}
                        </Typography>
                    </Box>
                </Stack>

                {/* Rating and Duration */}
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                        mt: 'auto',
                        pt: 2,
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <StarIcon sx={{ color: colors.warning, fontSize: 18 }} />
                        <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text }}>
                            {safeRating}
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                            ({safeReviews})
                        </Typography>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <ClockIcon sx={{ color: colors.textSecondary, fontSize: 18 }} />
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                            {safeDuration}
                        </Typography>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default CourseCard;
