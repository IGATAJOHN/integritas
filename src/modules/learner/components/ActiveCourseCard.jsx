import React from 'react';
import { Card, Box, Typography, LinearProgress } from '@mui/material';

const ActiveCourseCard = ({ course }) => {
    return (
        <Card sx={{
            bgcolor: '#1e293b',
            p: 2, // 16px padding
            display: 'flex',
            gap: 2,
            color: '#fff',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)',
            minHeight: { xs: 'auto', md: '114px' }, // Responsive height
            height: '100%',
            alignItems: 'center'
        }}>
            <Box
                component="img"
                src={course.image}
                sx={{
                    width: 100,
                    height: 100,
                    borderRadius: 1,
                    objectFit: 'cover',
                    flexShrink: 0
                }}
            />
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.3 }}>
                    {course.title}
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', mb: 2, display: 'block' }}>
                    {course.type}
                </Typography>
                <LinearProgress
                    variant="determinate"
                    value={course.progress}
                    sx={{
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': {
                            bgcolor: '#3B82F6'
                        },
                        height: 6,
                        borderRadius: 3,
                        mb: 0.5
                    }}
                />
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', alignSelf: 'flex-end', fontSize: '0.7rem' }}>
                    {course.progress}% Complete
                </Typography>
            </Box>
        </Card>
    );
};

export default ActiveCourseCard;
