import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Grid,
    Typography,
    Button,
    IconButton,
    TextField,
    InputAdornment,
    Stack,
    Divider,
    Checkbox,
    FormControlLabel,
    Card,
    CardContent,
    Avatar,
    useTheme,
    alpha,
    Container
} from '@mui/material';
import {
    Lock,
    CreditCard,
    AccountBalance,
    Payment,
    CheckCircle,
    Help,
    Person,
    ArrowBack,
    Security,
    CalendarToday,
    VpnKey,
    LocationOn,
    LocalOffer,
    SupportAgent
} from '@mui/icons-material';
import logo from '../../../assets/images/GGH_logo.png';

/**
 * Checkout Component
 * 
 * Full-page checkout flow with payment method selection,
 * payment details form, and order summary.
 */
const Checkout = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [saveCard, setSaveCard] = useState(false);

    // Mock course data
    const course = {
        title: 'Advanced Public Policy Analysis',
        instructor: 'Dr. Elena Rivas',
        level: 'Expert',
        thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
        price: 450.00,
        tax: 45.00,
        fee: 0.00
    };

    const total = course.price + course.tax + course.fee;

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: '#0B1120', // Darker background to match image
            color: '#fff',
            display: 'flex',
            flexDirection: 'column'
        }}>


            // ... (existing imports)

            {/* Header */}
            <Box sx={{
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                px: 4,
                py: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                        component="img"
                        src={logo}
                        alt="Good Governance Hub"
                        sx={{ width: 32, height: 32, objectFit: 'contain' }}
                    />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff' }}>
                        Good Governance Hub
                    </Typography>
                </Stack>

                <Box sx={{
                    bgcolor: 'rgba(16, 185, 129, 0.1)',
                    color: '#10B981',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                }}>
                    <Lock sx={{ fontSize: 14 }} />
                    <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 0.5 }}>
                        SECURE CHECKOUT
                    </Typography>
                </Box>
            </Box>

            {/* Main Content */}
            <Container maxWidth="xl" sx={{ flex: 1, py: 6, px: { xs: 2, md: 6 } }}>
                <Grid container spacing={4}>
                    {/* Left Column - Payment Details */}
                    <Grid item xs={12} lg={7}>
                        {/* Breadcrumb & Title */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                                Checkout
                            </Typography>
                            <Stack direction="row" alignItems="center" spacing={1} sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                                <Typography sx={{ color: 'rgba(255,255,255,0.5)' }}>Cart</Typography>
                                <Typography>{'>'}</Typography>
                                <Typography sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>Payment</Typography>
                                <Typography>{'>'}</Typography>
                                <Typography sx={{ color: 'rgba(255,255,255,0.5)' }}>Confirmation</Typography>
                            </Stack>
                        </Box>

                        {/* Progress Bar */}
                        <Box sx={{ mb: 6 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                    Step 2 of 3
                                </Typography>
                            </Box>
                            <Box sx={{ height: 4, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                                <Box sx={{ width: '66%', height: '100%', bgcolor: theme.palette.primary.main }} />
                            </Box>
                        </Box>

                        {/* Payment Method Selection */}
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                            Payment Method
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 4 }}>
                            {[
                                { id: 'card', label: 'Card', icon: <CreditCard sx={{ fontSize: 28 }} /> },
                                { id: 'paypal', label: 'PayPal', icon: <AccountBalance sx={{ fontSize: 28 }} /> },
                                { id: 'bank', label: 'Bank Transfer', icon: <AccountBalance sx={{ fontSize: 28 }} /> }
                            ].map((method) => (
                                <Grid item xs={12} sm={4} key={method.id}>
                                    <Box
                                        onClick={() => setPaymentMethod(method.id)}
                                        sx={{
                                            border: `1px solid ${paymentMethod === method.id ? '#2563EB' : 'rgba(255,255,255,0.1)'}`,
                                            bgcolor: paymentMethod === method.id ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                                            borderRadius: 2,
                                            py: 2.5,
                                            px: 2,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            gap: 1,
                                            position: 'relative',
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                bgcolor: 'rgba(255,255,255,0.05)',
                                                borderColor: paymentMethod === method.id ? '#2563EB' : 'rgba(255,255,255,0.2)'
                                            }
                                        }}
                                    >
                                        {paymentMethod === method.id && (
                                            <CheckCircle sx={{ position: 'absolute', top: 8, right: 8, color: '#2563EB', fontSize: 16 }} />
                                        )}
                                        <Box sx={{ color: paymentMethod === method.id ? '#2563EB' : 'rgba(255,255,255,0.5)' }}>
                                            {method.icon}
                                        </Box>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: paymentMethod === method.id ? '#fff' : 'rgba(255,255,255,0.7)' }}>
                                            {method.label}
                                        </Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Payment Details Form */}
                        <Box sx={{
                            bgcolor: 'rgba(255,255,255,0.02)',
                            borderRadius: 3,
                            p: 4,
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Payment Details
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    <Lock sx={{ color: 'rgba(255,255,255,0.3)' }} />
                                    <CreditCard sx={{ color: 'rgba(255,255,255,0.3)' }} />
                                </Stack>
                            </Box>

                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1, display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                                        Card Number
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="0000 0000 0000 0000"
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><CreditCard sx={{ color: 'rgba(255,255,255,0.3)' }} /></InputAdornment>,
                                            endAdornment: <InputAdornment position="end"><Lock sx={{ color: '#10B981', fontSize: 18 }} /></InputAdornment>,
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: 'rgba(255,255,255,0.03)',
                                                color: '#fff',
                                                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                                '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                                            }
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1, display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                                        Expiry Date
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="MM / YY"
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><CalendarToday sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }} /></InputAdornment>,
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: 'rgba(255,255,255,0.03)',
                                                color: '#fff',
                                                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                                '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                                            }
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1, display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                                        CVC / CVV
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="123"
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><Security sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }} /></InputAdornment>,
                                            endAdornment: <InputAdornment position="end"><Help sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }} /></InputAdornment>,
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: 'rgba(255,255,255,0.03)',
                                                color: '#fff',
                                                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                                '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                                            }
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1, display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                                        Name on Card
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="e.g. Elena Rivas"
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><Person sx={{ color: 'rgba(255,255,255,0.3)' }} /></InputAdornment>,
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: 'rgba(255,255,255,0.03)',
                                                color: '#fff',
                                                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                                '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                                            }
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1, display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                                        Billing Zip / Postal Code
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="10001"
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><LocationOn sx={{ color: 'rgba(255,255,255,0.3)' }} /></InputAdornment>,
                                        }}
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: 'rgba(255,255,255,0.03)',
                                                color: '#fff',
                                                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                                                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                                '&.Mui-focused fieldset': { borderColor: '#2563EB' },
                                            }
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={saveCard}
                                                onChange={(e) => setSaveCard(e.target.checked)}
                                                sx={{
                                                    color: 'rgba(255,255,255,0.3)',
                                                    '&.Mui-checked': { color: theme.palette.primary.main }
                                                }}
                                            />
                                        }
                                        label={
                                            <Box>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#fff' }}>
                                                    Save payment details
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                                                    Securely save this card for future governance course enrollments.
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>

                    {/* Right Column - Order Summary */}
                    <Grid item xs={12} lg={5}>
                        <Box sx={{ position: 'sticky', top: 24 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                Order Summary
                            </Typography>

                            <Box sx={{
                                bgcolor: 'rgba(255,255,255,0.02)',
                                borderRadius: 3,
                                p: 3,
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                {/* Course Item */}
                                <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                                    <Box
                                        sx={{
                                            width: 80,
                                            height: 60,
                                            borderRadius: 1,
                                            backgroundImage: `url(${course.thumbnail})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center'
                                        }}
                                    />
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#fff', lineHeight: 1.3, mb: 0.5 }}>
                                            {course.title}
                                        </Typography>
                                        <Typography variant="caption" sx={{ display: 'block', color: 'rgba(255,255,255,0.5)' }}>
                                            Instr: {course.instructor}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: theme.palette.primary.main }}>
                                            Level: {course.level}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />

                                {/* Price Breakdown */}
                                <Stack spacing={1.5} sx={{ mb: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>Subtotal</Typography>
                                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>${course.price.toFixed(2)}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>Tax (VAT 10%)</Typography>
                                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>${course.tax.toFixed(2)}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>Processing Fee</Typography>
                                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600 }}>${course.fee.toFixed(2)}</Typography>
                                    </Box>
                                </Stack>

                                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />

                                {/* Total */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#fff' }}>Total Amount</Typography>
                                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#fff' }}>${total.toFixed(2)}</Typography>
                                </Box>

                                {/* Promo Code */}
                                <Box sx={{ display: 'flex', gap: 1, mb: 4 }}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        placeholder="Promo Code"
                                        sx={{
                                            '& .MuiOutlinedInput-root': {
                                                bgcolor: 'rgba(255,255,255,0.05)',
                                                color: '#fff',
                                                '& fieldset': { borderColor: 'rgba(255,255,255,0.1)', borderStyle: 'dashed' },
                                                '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                                            }
                                        }}
                                    />
                                    <Button
                                        variant="outlined"
                                        sx={{
                                            borderColor: 'rgba(255,255,255,0.2)',
                                            color: 'rgba(255,255,255,0.7)',
                                            textTransform: 'none',
                                            '&:hover': { borderColor: '#fff', color: '#fff' }
                                        }}
                                    >
                                        Apply
                                    </Button>
                                </Box>

                                {/* Complete Purchase Button */}
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    startIcon={<Lock />}
                                    sx={{
                                        bgcolor: '#2563EB',
                                        color: '#fff',
                                        py: 1.5,
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        mb: 2,
                                        boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.1), 0 2px 4px -1px rgba(37, 99, 235, 0.06)',
                                        '&:hover': { bgcolor: '#1d4ed8' }
                                    }}
                                >
                                    Complete Purchase
                                </Button>

                                {/* Security Badge */}
                                <Box sx={{ textAlign: 'center' }}>
                                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
                                        <Security sx={{ fontSize: 14, color: '#10B981' }} />
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                            256-bit SSL Secure Encryption
                                        </Typography>
                                    </Stack>
                                    <Stack direction="row" justifyContent="center" spacing={1}>
                                        <Box sx={{ bgcolor: '#fff', px: 0.5, borderRadius: 0.5, height: 20, display: 'flex', alignItems: 'center' }}>
                                            <Typography variant="caption" sx={{ color: '#000', fontWeight: 800, fontSize: 10 }}>VISA</Typography>
                                        </Box>
                                        <Box sx={{ bgcolor: '#fff', px: 0.5, borderRadius: 0.5, height: 20, display: 'flex', alignItems: 'center' }}>
                                            <Typography variant="caption" sx={{ color: '#000', fontWeight: 800, fontSize: 10 }}>Mastercard</Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                            </Box>

                            {/* Help Box */}
                            <Box sx={{
                                mt: 3,
                                bgcolor: 'rgba(255,255,255,0.02)',
                                borderRadius: 3,
                                p: 2.5,
                                border: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                gap: 2
                            }}>
                                <Avatar sx={{ bgcolor: 'rgba(37, 99, 235, 0.1)', color: '#2563EB' }}>
                                    <SupportAgent />
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#fff', mb: 0.5 }}>
                                        Need help?
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.4, display: 'block' }}>
                                        Contact our learner support team at <span style={{ color: '#2563EB', cursor: 'pointer' }}>support@govhub.com</span> for any payment issues.
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Container>

            {/* Footer */}
            <Box sx={{
                borderTop: '1px solid rgba(255,255,255,0.1)',
                px: 6,
                py: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                    © 2024 Good Governance Hub. All rights reserved.
                </Typography>

                <Stack direction="row" spacing={4}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', cursor: 'pointer', '&:hover': { color: '#fff' } }}>
                        Privacy Policy
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', cursor: 'pointer', '&:hover': { color: '#fff' } }}>
                        Terms of Service
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', cursor: 'pointer', '&:hover': { color: '#fff' } }}>
                        Refund Policy
                    </Typography>
                </Stack>
            </Box>
        </Box>
    );
};

export default Checkout;
