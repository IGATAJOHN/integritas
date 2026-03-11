import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Container,
    Stack,
    Grid,
    useTheme,
    alpha,
    Divider
} from '@mui/material';
import {
    CheckCircleOutlined as CheckCircle,
    DownloadOutlined as Download,
    CreditCardOutlined as CreditCard
} from '@mui/icons-material';
import logo from '../../../assets/images/GGH_logo.png';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const theme = useTheme();

    // Mock order details
    const orderDetails = {
        id: 'ORD-2023-8492',
        date: 'Oct 24, 2023',
        paymentMethod: 'Visa **** 4242',
        total: 169.00,
        courses: [
            {
                id: 1,
                title: 'Ethics in Public Administration: Level 1',
                instructor: 'Dr. Alan Grant',
                duration: '4.5 Hours',
                price: 49.00,
                thumbnail: 'https://images.unsplash.com/photo-1557426272-fc759fdf7a8d?w=800&q=80'
            },
            {
                id: 2,
                title: 'Data-Driven Policy Making',
                instructor: 'Sarah Jenkins, MSc',
                duration: '6.2 Hours',
                price: 120.00,
                thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80'
            }
        ]
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: '#0B1120',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <Box sx={{
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                px: { xs: 2, md: 4 },
                py: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2
            }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                        component="img"
                        src={logo}
                        alt="Integritas Hub"
                        sx={{ width: 32, height: 32, objectFit: 'contain' }}
                    />
                    <Typography variant="subtitle1" sx={{
                        fontWeight: 700,
                        color: '#fff',
                        display: { xs: 'none', sm: 'block' }
                    }}>
                        Integritas Hub
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', md: 'flex' } }}>
                    {['Dashboard', 'Courses', 'Marketplace', 'Community'].map((item) => (
                        <Typography
                            key={item}
                            variant="body2"
                            sx={{
                                color: 'rgba(255,255,255,0.7)',
                                cursor: 'pointer',
                                '&:hover': { color: '#fff' }
                            }}
                        >
                            {item}
                        </Typography>
                    ))}
                </Stack>

                <Box sx={{ width: 32, height: 32, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
            </Box>

            {/* Content */}
            <Container maxWidth="md" sx={{ flex: 1, py: { xs: 4, md: 8 }, display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: { sm: '700px !important' } }}>

                {/* Success Icon */}
                <Box sx={{
                    width: 72,
                    height: 72,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3
                }}>
                    <CheckCircle sx={{ fontSize: 40, color: '#3B82F6' }} />
                </Box>

                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
                    Payment Successful!
                </Typography>

                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mb: 6, textAlign: 'center' }}>
                    Thank you for your purchase. A confirmation email has been sent to your inbox.<br />
                    <Box component="span" sx={{ color: '#fff' }}>user@example.com</Box>
                </Typography>

                {/* Order Details Card */}
                <Box sx={{
                    width: '100%',
                    bgcolor: 'rgba(255,255,255,0.05)',
                    borderRadius: 1,
                    border: '1px solid rgba(255,255,255,0.05)',
                    overflow: 'hidden',
                    mb: 4
                }}>
                    {/* Card Header */}
                    <Box sx={{
                        p: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        bgcolor: 'rgba(40, 46, 57, 1)',
                    }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            Order Details
                        </Typography>
                        <Button
                            startIcon={<Download sx={{ fontSize: 16 }} />}
                            sx={{
                                color: '#3B82F6',
                                textTransform: 'none',
                                fontSize: 13,
                                '&:hover': { bgcolor: alpha('#3B82F6', 0.1) },
                                bgcolor: alpha('#3B82F6', 0.1),
                                px: 2
                            }}
                        >
                            Invoice
                        </Button>
                    </Box>

                    {/* Order Meta */}
                    <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(40, 46, 57, 1)' }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={4}>
                            <Box>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 0.5, fontSize: 10, letterSpacing: 0.5 }}>
                                    TRANSACTION ID
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#fff' }}>
                                    {orderDetails.id}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 0.5, fontSize: 10, letterSpacing: 0.5 }}>
                                    DATE
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#fff' }}>
                                    {orderDetails.date}
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', display: 'block', mb: 0.5, fontSize: 10, letterSpacing: 0.5 }}>
                                    PAYMENT METHOD
                                </Typography>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <CreditCard sx={{ fontSize: 20, color: '#fff' }} />
                                    <Typography variant="body2" sx={{ color: '#fff' }}>
                                        {orderDetails.paymentMethod}
                                    </Typography>
                                </Stack>
                            </Box>
                        </Stack>
                    </Box>

                    {/* Purchased Items */}
                    <Box sx={{ p: 3, pb: 0 }}>
                        <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', mb: 2, fontWeight: 600, fontSize: 12, letterSpacing: 0.5, px: 2 }}>
                            PURCHASED COURSES
                        </Typography>

                        <Stack spacing={2}>
                            {orderDetails.courses.map((course) => (
                                <Box key={course.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#000', p: 2, borderRadius: 1 }}>
                                    <Box
                                        component="img"
                                        src={course.thumbnail}
                                        alt={course.title}
                                        sx={{ width: 64, height: 48, borderRadius: 1, objectFit: 'cover' }}
                                    />
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: '#fff' }}>
                                            {course.title}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                            {course.instructor} • {course.duration}
                                        </Typography>
                                    </Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#fff' }}>
                                        ${course.price.toFixed(2)}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                        <Divider sx={{ mt: 3, borderColor: 'rgba(255,255,255,0.05)' }} />
                    </Box>

                    {/* Total */}
                    <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            Total Paid
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#3B82F6', fontWeight: 700 }}>
                            ${orderDetails.total.toFixed(2)}
                        </Typography>
                    </Box>
                </Box>

                {/* Actions */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%', justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/explore/dashboard')}
                        startIcon={<CheckCircle sx={{ fontSize: 20 }} />}
                        sx={{
                            bgcolor: '#2563EB',
                            color: '#fff',
                            py: 1.5,
                            px: 4,
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 1.5,
                            '&:hover': { bgcolor: '#1D4ED8' }
                        }}
                    >
                        Start Learning Now
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/explore/courses')}
                        sx={{
                            color: '#fff',
                            borderColor: 'rgba(255,255,255,0.2)',
                            py: 1.5,
                            px: 4,
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 1.5,
                            '&:hover': {
                                borderColor: '#fff',
                                bgcolor: 'rgba(255,255,255,0.05)'
                            }
                        }}
                    >
                        Return to Marketplace
                    </Button>
                </Stack>

                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 4 }}>
                    Need help with your order? <Box component="span" sx={{ color: '#3B82F6', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>Contact Support</Box>
                </Typography>

            </Container>

            {/* Footer */}
            <Box sx={{
                borderTop: '1px solid rgba(255,255,255,0.1)',
                px: 6,
                py: 3,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
                    © 2024 Integritas Hub. All rights reserved.
                </Typography>
            </Box>
        </Box>
    );
};

export default PaymentSuccess;
