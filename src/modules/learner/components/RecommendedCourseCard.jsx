import React from 'react';
import { Card, Box, CardContent, Stack, Chip, Typography, Button } from '@mui/material';
import { AccessTime as TimeIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const RecommendedCourseCard = ({ course }) => {
    const navigate = useNavigate();

    return (
        <Card sx={{
            bgcolor: '#1e293b',
            color: '#fff',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
            height: '259px', // Fixed height as requested
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <Box
                component="img"
                src={course.image}
                sx={{ width: '100%', height: 140, objectFit: 'cover' }}
            />
            <CardContent sx={{ p: 2, pb: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Chip
                        label={course.category}
                        size="small"
                        sx={{
                            bgcolor: 'rgba(168, 85, 247, 0.1)',
                            color: '#A855F7',
                            fontWeight: 700,
                            height: 20,
                            fontSize: '0.65rem'
                        }}
                    />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TimeIcon sx={{ fontSize: 12 }} /> {course.duration}
                    </Typography>
                </Stack>
                <Typography variant="subtitle2" sx={{
                    fontWeight: 700,
                    mb: 2,
                    flexGrow: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {course.title}
                </Typography>
                <Button
                    fullWidth
                    variant="outlined"
                    size="small"
                    onClick={() => navigate('/checkout', {
                        state: {
                            courseId: course.id,
                            title: course.title,
                            price: course.price,
                            instructor: course.instructor,
                            level: course.level,
                            thumbnail: course.image,
                        }
                    })}
                    sx={{
                        borderColor: 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        textTransform: 'none',
                        mt: 'auto',
                        mb: 4,
                        '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.05)' }
                    }}
                >
                    Enroll Now
                </Button>
            </CardContent>
        </Card>
    );
};

export default RecommendedCourseCard;
