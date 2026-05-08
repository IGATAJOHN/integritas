import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    IconButton,
    TextField,
    InputBase,
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
    Container,
    CircularProgress,
    Alert
} from '@mui/material';
import {
    LockOutlined as Lock,
    CreditCardOutlined as CreditCard,
    AccountBalanceOutlined as AccountBalance,
    PaymentOutlined as Payment,
    CheckCircleOutlined as CheckCircle,
    HelpOutline as Help,
    PersonOutlined as Person,
    ArrowBackOutlined as ArrowBack,
    SecurityOutlined as Security,
    CalendarTodayOutlined as CalendarToday,
    VpnKeyOutlined as VpnKey,
    LocationOnOutlined as LocationOn,
    LocalOfferOutlined as LocalOffer,
    SupportAgentOutlined as SupportAgent,
    EmailOutlined as Email
} from '@mui/icons-material';
import logo from '../../../assets/images/integritas_logo.jpg';
import { learnerEnrollmentService } from '../services';

/**
 * Checkout Component
 * 
 * Full-page checkout flow with payment method selection,
 * payment details form, and order summary.
 */
const Checkout = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [saveCard, setSaveCard] = useState(false);
    const [enrolling, setEnrolling] = useState(false);
    const [enrollError, setEnrollError] = useState(null);

    // Course data passed via route state from "Enroll Now" buttons
    const stateData = location.state || {};
    // Guard: instructor may arrive as a string or as the full {name,title,bio} object
    const instructorName = typeof stateData.instructor === 'string'
        ? stateData.instructor
        : stateData.instructor?.name || '—';
    const course = {
        courseId: stateData.courseId || null,
        courseSlug: stateData.courseSlug || stateData.slug || null,
        title: stateData.title || 'Course Enrollment',
        instructor: instructorName,
        level: stateData.level || '—',
        thumbnail: stateData.thumbnail || null,
        price: stateData.price || 0,
        tax: stateData.tax || 0,
        fee: stateData.fee || 0,
    };

    const total = course.price + course.tax + course.fee;

    const handleCompletePurchase = async () => {
        const slugOrId = course.courseSlug || course.courseId;
        if (!slugOrId) {
            setEnrollError('Course information is missing. Please go back and try again.');
            return;
        }
        setEnrolling(true);
        setEnrollError(null);
        try {
            const result = await learnerEnrollmentService.initiateEnrolment(slugOrId);
            const url = result?.authorization_url || result?.payment_url;
            if (url) {
                // Persist reference so the return page can verify it even if Paystack
                // doesn't pass it back via query string.
                if (result?.reference) {
                    sessionStorage.setItem('pending_enrolment_reference', result.reference);
                }
                window.location.href = url;
            } else {
                // Free / instant enrolment path
                navigate('/enrolment/return', { state: { enrolment: result, course } });
            }
        } catch (err) {
            const message = err?.message || 'Enrolment failed. Please try again.';
            setEnrollError(message);
        } finally {
            setEnrolling(false);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: '#0B1120', // Darker background to match image
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
                    <IconButton
                        onClick={() => course.courseId ? navigate(`/explore/course/${course.courseId}`) : navigate(-1)}
                        sx={{ color: 'rgba(255,255,255,0.6)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}
                        title="Back to course"
                    >
                        <ArrowBack fontSize="small" />
                    </IconButton>
                    <Box
                        component="img"
                        src={logo}
                        alt="Integritas"
                        sx={{ width: 32, height: 32, objectFit: 'contain' }}
                    />
                    <Typography variant="subtitle1" sx={{
                        fontWeight: 700,
                        color: '#fff',
                        display: { xs: 'none', sm: 'block' }
                    }}>
                        Integritas
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
            <Container maxWidth="lg" sx={{ flex: 1, py: 6, px: { xs: 2, md: 4 } }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 4, md: 6 }, justifyContent: 'space-between' }}>
                    {/* Left Column - Payment Details */}
                    <Box sx={{ flex: 1, maxWidth: { md: '60%' } }}>
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
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                            {[
                                { id: 'card', label: 'Card', icon: <CreditCard sx={{ fontSize: 28 }} /> },
                                { id: 'paypal', label: 'PayPal', icon: <AccountBalance sx={{ fontSize: 28 }} /> },
                                { id: 'bank', label: 'Bank Transfer', icon: <AccountBalance sx={{ fontSize: 28 }} /> }
                            ].map((method) => (
                                <Box
                                    key={method.id}
                                    onClick={() => setPaymentMethod(method.id)}
                                    sx={{
                                        flex: 1,
                                        border: `1px solid ${paymentMethod === method.id ? '#2563EB' : 'rgba(255,255,255,0.1)'}`,
                                        bgcolor: paymentMethod === method.id ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                                        borderRadius: 1,
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
                            ))}
                        </Stack>

                        {/* Payment Details Form */}
                        <Box sx={{
                            bgcolor: 'rgba(255,255,255,0.02)',
                            borderRadius: 1,
                            p: 4,
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    Payment Details
                                </Typography>
                                <Stack direction="row" spacing={1}>
                                    <Lock sx={{ color: '#fff' }} />
                                    <CreditCard sx={{ color: '#fff' }} />
                                </Stack>
                            </Box>

                            {paymentMethod === 'card' && (
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                                    {/* Row 1: Card Number - Full Width */}
                                    <Box sx={{ gridColumn: '1 / -1' }}>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1, display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                                            Card Number
                                        </Typography>
                                        <InputBase
                                            fullWidth
                                            placeholder="0000 0000 0000 0000"
                                            startAdornment={<InputAdornment position="start"><CreditCard sx={{ color: 'rgba(255,255,255,0.3)' }} /></InputAdornment>}
                                            endAdornment={<InputAdornment position="end"><Lock sx={{ color: '#10B981', fontSize: 18 }} /></InputAdornment>}
                                            sx={{
                                                bgcolor: 'rgba(255,255,255,0.03)',
                                                color: '#fff',
                                                borderRadius: 1,
                                                p: 1.5,
                                                '& .MuiInputBase-input': {
                                                    border: 'none',
                                                    outline: 'none',
                                                    boxShadow: 'none',
                                                    padding: 0
                                                }
                                            }}
                                        />
                                    </Box>

                                    {/* Row 2: Expiry Date + CVV - Side by Side */}
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1, display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                                            Expiry Date
                                        </Typography>
                                        <InputBase
                                            fullWidth
                                            placeholder="MM / YY"
                                            startAdornment={<InputAdornment position="start"><CalendarToday sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }} /></InputAdornment>}
                                            sx={{
                                                bgcolor: 'rgba(255,255,255,0.03)',
                                                color: '#fff',
                                                borderRadius: 1,
                                                p: 1.5,
                                                '& .MuiInputBase-input': {
                                                    border: 'none',
                                                    outline: 'none',
                                                    boxShadow: 'none',
                                                    padding: 0
                                                }
                                            }}
                                        />
                                    </Box>

                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1, display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                                            CVC / CVV
                                        </Typography>
                                        <InputBase
                                            fullWidth
                                            placeholder="123"
                                            startAdornment={<InputAdornment position="start"><Security sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }} /></InputAdornment>}
                                            endAdornment={<InputAdornment position="end"><Help sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 18 }} /></InputAdornment>}
                                            sx={{
                                                bgcolor: 'rgba(255,255,255,0.03)',
                                                color: '#fff',
                                                borderRadius: 1,
                                                p: 1.5,
                                                '& .MuiInputBase-input': {
                                                    border: 'none',
                                                    outline: 'none',
                                                    boxShadow: 'none',
                                                    padding: 0
                                                }
                                            }}
                                        />
                                    </Box>

                                    {/* Row 3: Name on Card - Full Width */}
                                    <Box sx={{ gridColumn: '1 / -1' }}>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1, display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                                            Name on Card
                                        </Typography>
                                        <InputBase
                                            fullWidth
                                            placeholder="e.g. Elena Rivas"
                                            startAdornment={<InputAdornment position="start"><Person sx={{ color: 'rgba(255,255,255,0.3)' }} /></InputAdornment>}
                                            sx={{
                                                bgcolor: 'rgba(255,255,255,0.03)',
                                                color: '#fff',
                                                borderRadius: 1,
                                                p: 1.5,
                                                '& .MuiInputBase-input': {
                                                    border: 'none',
                                                    outline: 'none',
                                                    boxShadow: 'none',
                                                    padding: 0
                                                }
                                            }}
                                        />
                                    </Box>

                                    {/* Row 4: Billing Zip / Postal Code - Full Width */}
                                    <Box sx={{ gridColumn: '1 / -1' }}>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1, display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                                            Billing Zip / Postal Code
                                        </Typography>
                                        <InputBase
                                            fullWidth
                                            placeholder="10001"
                                            startAdornment={<InputAdornment position="start"><LocationOn sx={{ color: 'rgba(255,255,255,0.3)' }} /></InputAdornment>}
                                            sx={{
                                                bgcolor: 'rgba(255,255,255,0.03)',
                                                color: '#fff',
                                                borderRadius: 1,
                                                p: 1.5,
                                                '& .MuiInputBase-input': {
                                                    border: 'none',
                                                    outline: 'none',
                                                    boxShadow: 'none',
                                                    padding: 0
                                                }
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{ gridColumn: '1 / -1' }}>
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
                                    </Box>
                                </Box>
                            )}

                            {paymentMethod === 'paypal' && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1, display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                                            PayPal Email
                                        </Typography>
                                        <InputBase
                                            fullWidth
                                            placeholder="username@example.com"
                                            startAdornment={<InputAdornment position="start"><Email sx={{ color: 'rgba(255,255,255,0.3)' }} /></InputAdornment>}
                                            sx={{
                                                bgcolor: 'rgba(255,255,255,0.03)',
                                                color: '#fff',
                                                borderRadius: 1,
                                                p: 1.5,
                                                '& .MuiInputBase-input': {
                                                    border: 'none',
                                                    outline: 'none',
                                                    boxShadow: 'none',
                                                    padding: 0
                                                }
                                            }}
                                        />
                                    </Box>
                                    <Box sx={{ p: 2, bgcolor: 'rgba(37, 99, 235, 0.1)', borderRadius: 1, border: '1px solid rgba(37, 99, 235, 0.3)' }}>
                                        <Typography variant="body2" sx={{ color: '#fff', textAlign: 'center' }}>
                                            You will be redirected to PayPal to complete your purchase securely.
                                        </Typography>
                                    </Box>
                                </Box>
                            )}

                            {paymentMethod === 'bank' && (
                                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
                                    <Box sx={{ gridColumn: '1 / -1' }}>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1, display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                                            Bank Name
                                        </Typography>
                                        <InputBase
                                            readOnly
                                            fullWidth
                                            value="First Bank of Nigeria"
                                            startAdornment={<InputAdornment position="start"><AccountBalance sx={{ color: 'rgba(255,255,255,0.3)' }} /></InputAdornment>}
                                            sx={{
                                                bgcolor: 'rgba(255,255,255,0.03)',
                                                color: '#fff',
                                                borderRadius: 1,
                                                p: 1.5,
                                                cursor: 'default',
                                                '& .MuiInputBase-input': {
                                                    border: 'none',
                                                    outline: 'none',
                                                    boxShadow: 'none',
                                                    padding: 0
                                                }
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{ gridColumn: '1 / -1' }}>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1, display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                                            Account Name
                                        </Typography>
                                        <InputBase
                                            readOnly
                                            fullWidth
                                            value="Integritas"
                                            startAdornment={<InputAdornment position="start"><Person sx={{ color: 'rgba(255,255,255,0.3)' }} /></InputAdornment>}
                                            sx={{
                                                bgcolor: 'rgba(255,255,255,0.03)',
                                                color: '#fff',
                                                borderRadius: 1,
                                                p: 1.5,
                                                cursor: 'default',
                                                '& .MuiInputBase-input': {
                                                    border: 'none',
                                                    outline: 'none',
                                                    boxShadow: 'none',
                                                    padding: 0
                                                }
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{ gridColumn: '1 / -1' }}>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1, display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                                            Account Number
                                        </Typography>
                                        <InputBase
                                            readOnly
                                            fullWidth
                                            value="2034567890"
                                            startAdornment={<InputAdornment position="start"><CreditCard sx={{ color: 'rgba(255,255,255,0.3)' }} /></InputAdornment>}
                                            endAdornment={<InputAdornment position="end"><CheckCircle sx={{ color: '#10B981', fontSize: 18 }} /></InputAdornment>}
                                            sx={{
                                                bgcolor: 'rgba(255,255,255,0.03)',
                                                color: '#fff',
                                                borderRadius: 1,
                                                p: 1.5,
                                                cursor: 'default',
                                                '& .MuiInputBase-input': {
                                                    border: 'none',
                                                    outline: 'none',
                                                    boxShadow: 'none',
                                                    padding: 0
                                                }
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{ gridColumn: '1 / -1' }}>
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mb: 1, display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                                            Payment Reference
                                        </Typography>
                                        <InputBase
                                            readOnly
                                            fullWidth
                                            value="Integritas-7832-XK9"
                                            startAdornment={<InputAdornment position="start"><LocalOffer sx={{ color: 'rgba(255,255,255,0.3)' }} /></InputAdornment>}
                                            sx={{
                                                bgcolor: 'rgba(255,255,255,0.03)',
                                                color: '#fff',
                                                borderRadius: 1,
                                                p: 1.5,
                                                cursor: 'default',
                                                '& .MuiInputBase-input': {
                                                    border: 'none',
                                                    outline: 'none',
                                                    boxShadow: 'none',
                                                    padding: 0
                                                }
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{ gridColumn: '1 / -1', p: 2, bgcolor: 'rgba(16, 185, 129, 0.1)', borderRadius: 1, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                        <Typography variant="body2" sx={{ color: '#fff', textAlign: 'center' }}>
                                            Please use the reference code above when making the transfer.
                                        </Typography>
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </Box>

                    {/* Right Column - Order Summary */}
                    <Box sx={{ width: { xs: '100%', md: '35%' } }}>
                        <Box sx={{ position: 'sticky', top: 24 }}>
                            <Box sx={{
                                bgcolor: 'rgba(255,255,255,0.02)',
                                borderRadius: 1,
                                p: 3,
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                    Order Summary
                                </Typography>
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
                                <Box sx={{
                                    display: 'flex',
                                    gap: 1,
                                    mb: 4,
                                    border: '1px dashed rgba(255,255,255,0.2)',
                                    borderRadius: 1,
                                    p: 0.5,
                                    bgcolor: 'rgba(255,255,255,0.05)'
                                }}>
                                    <InputBase
                                        fullWidth
                                        placeholder="Promo Code"
                                        sx={{
                                            color: '#fff',
                                            fontSize: '0.875rem',
                                            ml: 1,
                                            '& .MuiInputBase-input': {
                                                border: 'none',
                                                outline: 'none',
                                                boxShadow: 'none',
                                                padding: 0
                                            },
                                            '& input::placeholder': {
                                                color: 'rgba(255,255,255,0.5)',
                                                opacity: 1
                                            }
                                        }}
                                    />
                                    <Button
                                        variant="text"
                                        sx={{
                                            color: 'rgba(255,255,255,0.7)',
                                            textTransform: 'none',
                                            minWidth: 'auto',
                                            px: 2,
                                            '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.05)' }
                                        }}
                                    >
                                        Apply
                                    </Button>
                                </Box>

                                {/* Enroll error */}
                                {enrollError && (
                                    <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.8rem' }}>
                                        {enrollError}
                                    </Alert>
                                )}

                                {/* Complete Purchase Button */}
                                <Button
                                    fullWidth
                                    variant="contained"
                                    size="large"
                                    onClick={handleCompletePurchase}
                                    disabled={enrolling}
                                    startIcon={enrolling ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : <Lock />}
                                    sx={{
                                        bgcolor: '#2563EB',
                                        color: '#fff',
                                        py: 1.5,
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        mb: 2,
                                        boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.1), 0 2px 4px -1px rgba(37, 99, 235, 0.06)',
                                        '&:hover': { bgcolor: '#1d4ed8' },
                                        '&.Mui-disabled': { bgcolor: '#1d4ed8', opacity: 0.7 }
                                    }}
                                >
                                    {enrolling ? 'Processing...' : 'Complete Purchase'}
                                </Button>

                                {/* Security Badge */}
                                <Box sx={{ textAlign: 'center' }}>
                                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mb: 1 }}>
                                        <Security sx={{ fontSize: 14, color: '#10B981' }} />
                                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                                            256-bit SSL Secure Encryption
                                        </Typography>
                                    </Stack>
                                    <Box sx={{ bgcolor: '#fff', px: 0.75, py: 0.25, borderRadius: 1, display: 'inline-flex', alignItems: 'center', gap: 1.5 }}>
                                        <Typography variant="caption" sx={{ color: '#000', fontWeight: 800, fontSize: 10 }}>VISA</Typography>
                                        <Box sx={{ width: 1, height: 10, bgcolor: '#ccc' }} />
                                        <Stack direction="row" alignItems="center" spacing={0.5}>
                                            <Box sx={{ position: 'relative', width: 21, height: 14 }}>
                                                <Box sx={{ position: 'absolute', left: 0, width: 14, height: 14, bgcolor: '#EB001B', borderRadius: '50%' }} />
                                                <Box sx={{ position: 'absolute', right: 0, width: 14, height: 14, bgcolor: '#F79E1B', borderRadius: '50%', opacity: 0.8 }} />
                                            </Box>
                                            <Typography variant="caption" sx={{ color: '#000', fontWeight: 800, fontSize: 10 }}>Mastercard</Typography>
                                        </Stack>
                                    </Box>
                                </Box>
                            </Box>

                            {/* Help Box */}
                            <Box sx={{
                                mt: 3,
                                bgcolor: 'rgba(255,255,255,0.02)',
                                borderRadius: 1,
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
                    </Box>
                </Box>
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
                    © 2024 Integritas. All rights reserved.
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
