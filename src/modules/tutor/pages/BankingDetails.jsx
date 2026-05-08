import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Stack,
    CircularProgress,
    Alert,
    Paper,
    TextField,
    Button,
} from '@mui/material';
import { AccountBalanceOutlined, SaveOutlined } from '@mui/icons-material';
import { kycService } from '../services';

const BankingDetails = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [form, setForm] = useState({ bank_name: '', account_name: '', account_number: '' });

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                setLoading(true);
                setError('');
                const profile = await kycService.getProfile();
                if (cancelled) return;
                const banking = profile?.data?.banking || profile?.banking || {};
                setForm({
                    bank_name: banking.bank_name || '',
                    account_name: banking.account_name || '',
                    account_number: banking.account_number || '',
                });
            } catch (err) {
                if (cancelled) return;
                setError(err?.message || 'Failed to load banking details.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!form.bank_name.trim() || !form.account_name.trim() || !form.account_number.trim()) {
            setError('All banking fields are required.');
            return;
        }
        try {
            setSaving(true);
            await kycService.updateBanking({
                bank_name: form.bank_name.trim(),
                account_name: form.account_name.trim(),
                account_number: form.account_number.trim(),
            });
            setSuccess('Banking details updated.');
        } catch (err) {
            setError(err?.message || 'Failed to update banking details.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 600, mx: 'auto' }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                <AccountBalanceOutlined color="primary" />
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    Banking Details
                </Typography>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            {loading ? (
                <Stack alignItems="center" sx={{ py: 8 }}>
                    <CircularProgress />
                </Stack>
            ) : (
                <Paper component="form" onSubmit={handleSave} variant="outlined" sx={{ p: 3 }}>
                    <Typography color="text.secondary" sx={{ mb: 3, fontSize: '0.9rem' }}>
                        Earnings will be paid out to the account below. Make sure the account name matches the name on your government ID.
                    </Typography>
                    <Stack spacing={2}>
                        <TextField
                            label="Bank Name"
                            value={form.bank_name}
                            onChange={(e) => setForm((prev) => ({ ...prev, bank_name: e.target.value }))}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Account Name"
                            value={form.account_name}
                            onChange={(e) => setForm((prev) => ({ ...prev, account_name: e.target.value }))}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Account Number"
                            value={form.account_number}
                            onChange={(e) => setForm((prev) => ({ ...prev, account_number: e.target.value }))}
                            fullWidth
                            required
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={<SaveOutlined />}
                            disabled={saving}
                            sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
                        >
                            {saving ? 'Saving…' : 'Save Banking Details'}
                        </Button>
                    </Stack>
                </Paper>
            )}
        </Box>
    );
};

export default BankingDetails;
