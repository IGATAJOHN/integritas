import React from 'react';
import {
    Box,
    Typography,
    IconButton,
    Stack,
    Card,
    CardMedia,
    CardContent,
    Avatar
} from '@mui/material';
import {
    BookmarkBorder as BookmarkIcon,
    CheckCircle as CheckCircleIcon,
    Star as StarIcon,
    AccessTime as ClockIcon,
    School as SchoolIcon,
    SignalCellularAlt as LevelIcon
} from '@mui/icons-material';

const CourseCard = ({ course, colors }) => {
    return (
        <Card sx={{
            bgcolor: colors.card,
            borderRadius: '12px',
            overflow: 'hidden',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-4px)' },
            boxShadow: 'none',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxSizing: 'border-box'
        }}>
            <Box sx={{ position: 'relative', height: 180 }}>
                <CardMedia
                    component="img"
                    image={course.image}
                    alt={course.title}
                    sx={{ height: '100%', objectFit: 'cover' }}
                />
                <Box sx={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(8px)',
                    color: colors.text,
                    px: 1.2,
                    py: 0.5,
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.8,
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    <LevelIcon sx={{
                        fontSize: 14,
                        color: course.level === 'Beginner' ? '#3B82F6' : course.level === 'Intermediate' ? '#10B981' : '#A855F7'
                    }} />
                    {course.level}
                </Box>
                <IconButton sx={{ position: 'absolute', top: 8, right: 8, color: colors.text }}>
                    <BookmarkIcon />
                </IconButton>
            </Box>
            <CardContent sx={{ p: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle1" sx={{
                    fontWeight: 700,
                    mb: 1,
                    lineHeight: 1.4,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    height: '2.8em', // Fixed height for title
                }}>
                    {course.title}
                </Typography>
                <Typography variant="body2" sx={{
                    color: colors.textSecondary,
                    mb: 3,
                    fontSize: '0.85rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    height: '3em', // Fixed height for description
                }}>
                    {course.description}
                </Typography>

                <Box sx={{ mt: 'auto' }}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        sx={{
                            width: '100%',
                            height: '44px',
                            mb: 2,
                            boxSizing: 'border-box'
                        }}
                    >
                        {course.type === 'institution' ? (
                            <Box sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                bgcolor: 'rgba(37, 99, 235, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(37, 99, 235, 0.2)'
                            }}>
                                <SchoolIcon sx={{ color: colors.primary, fontSize: 18 }} />
                            </Box>
                        ) : (
                            <Avatar
                                src={`https://i.pravatar.cc/150?u=${course.instructor}`}
                                sx={{ width: 36, height: 36 }}
                            />
                        )}
                        <Box>
                            <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', fontSize: '0.75rem', mb: 0 }}>
                                {course.type === 'institution' ? 'Institution' : 'Instructor'}
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: colors.text, fontSize: '0.9rem' }}>
                                    {course.instructor}
                                </Typography>
                                {course.type === 'individual' && (
                                    <CheckCircleIcon sx={{ color: colors.accent, fontSize: 14 }} />
                                )}
                            </Stack>
                        </Box>
                    </Stack>

                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        sx={{
                            width: '100%',
                            height: '37px',
                            py: '20px',
                            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                            boxSizing: 'border-box'
                        }}
                    >
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                            <StarIcon sx={{ color: colors.warning, fontSize: 16 }} />
                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{course.rating}</Typography>
                            <Typography variant="caption" sx={{ color: colors.textSecondary }}>({course.reviews})</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                            <ClockIcon sx={{ color: colors.textSecondary, fontSize: 16 }} />
                            <Typography variant="caption" sx={{ color: colors.textSecondary }}>{course.duration}</Typography>
                        </Stack>
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
};

export default CourseCard;
