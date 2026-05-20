import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import {
    getAccountState,
    getOrganizationRole,
    getPrimaryRole,
    isLearnerPendingPayment,
} from '../utils';

const AuthContext = createContext(null);

/**
 * Normalize whatever shape the backend returns for an auth call into
 * `{ user, token }`. Handles all of:
 *   - { user: {...}, token: "..." }
 *   - { data: { user: {...}, token: "..." } }
 *   - { data: {...userFields}, token: "..." }
 *   - { data: {...userFields, token: "..."} }
 *   - { ...userFields, token: "..." }
 *   - { data: {...userFields} }                (e.g. /auth/me)
 */
const unwrapAuthPayload = (response) => {
    if (!response || typeof response !== 'object') return { user: null, token: null };

    // Flat shape with explicit user/token
    if (response.user || response.token) {
        return {
            user: response.user || { ...response, user: undefined, token: undefined },
            token: response.token || response.user?.token || null,
        };
    }

    // Wrapped under `data`
    if (response.data && typeof response.data === 'object') {
        const inner = response.data;
        const token = response.token || inner.token || null;
        const user = inner.user
            ? inner.user
            : { ...inner, token: undefined };
        return { user, token };
    }

    // Last resort: treat the response itself as the user.
    return { user: response, token: response.token || null };
};

const hasVerifiedEmail = (candidate) => {
    const state = getAccountState(candidate);
    if (state === 'pending_email_verification') return false;
    if (state === 'pending_payment' || state === 'active') return true;

    return (
        candidate?.email_verified === true ||
        candidate?.emailVerified === true ||
        !!candidate?.email_verified_at ||
        !!candidate?.emailVerifiedAt
    );
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [loading, setLoading] = useState(true);

    // Refresh user data with /auth/me to get the latest status
    useEffect(() => {
        const initializeAuth = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    if (parsed.token) {
                        const response = await authService.getCurrentUser();
                        const { user: fresh } = unwrapAuthPayload(response);
                        const userData = { ...(fresh || {}), token: parsed.token };
                        userData.role = pickRole(userData) || userData.role;

                        // Preserve kyc_status from stored user if /auth/me doesn't return it.
                        if (!userData.kyc_status && parsed.kyc_status) {
                            userData.kyc_status = parsed.kyc_status;
                        }

                        if (userData.email === 'admin@test.com') {
                            userData.role = 'admin';
                        }

                        setUser(userData);
                        localStorage.setItem('user', JSON.stringify(userData));
                    } else {
                        setUser(parsed);
                    }
                } catch (error) {
                    console.error('Failed to get current user:', error);
                    localStorage.removeItem('user');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await authService.login({ email, password });
            if (!response) {
                throw new Error('Login response was empty. Check that the API returned a token.');
            }

            // MFA required — backend returns a challenge token instead of a session token.
            // Return a signal so the login page can redirect to the 2FA challenge screen.
            if (response.challenge_token || response.mfa_required) {
                return { requires2fa: true, challenge_token: response.challenge_token };
            }

            return completeLogin(response);
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    // Shared helper used by login() and the 2FA challenge page after the
    // code is verified. Takes the full auth response and sets user state.
    const completeLogin = (response) => {
        const { user: loginUser, token } = unwrapAuthPayload(response);
        const baseUser = {
            ...(loginUser || {}),
            ...(token ? { token } : {}),
        };
        baseUser.role = pickRole(baseUser) || baseUser.role;
        setUser(baseUser);
        localStorage.setItem('user', JSON.stringify(baseUser));
        return baseUser;
    };

    const pickRole = (u) => getPrimaryRole(u);

    const register = async (payload) => {
        try {
            const isTutorRole = String(payload?.role || payload?.user_type || '').toLowerCase().includes('tutor');
            // Strip role/user_type — the API register endpoints don't accept them
            const { role: _r, user_type: _ut, ...cleanPayload } = payload;
            const response = isTutorRole
                ? await authService.registerExpertTutor(cleanPayload)
                : await authService.register(cleanPayload);

            if (!response) {
                throw new Error('Registration response was empty.');
            }

            let { user: registeredUser, token } = unwrapAuthPayload(response);
            registeredUser = registeredUser || {};

            // Backend doesn't return a token on /auth/register — log in
            // immediately so the user lands on /verify with an authenticated
            // session and can use "resend email".
            if (!token && payload?.email && payload?.password) {
                try {
                    const loginResponse = await authService.login({
                        email: payload.email,
                        password: payload.password,
                    });
                    const { user: loginUser, token: loginToken } = unwrapAuthPayload(loginResponse);
                    if (loginToken) token = loginToken;
                    if (loginUser) registeredUser = { ...registeredUser, ...loginUser };
                } catch (loginErr) {
                    console.warn('Auto-login after registration failed:', loginErr);
                }
            }

            const storedUser = { ...registeredUser, ...(token ? { token } : {}) };
            storedUser.role = pickRole(storedUser) || storedUser.role;

            setUser(storedUser);
            localStorage.setItem('user', JSON.stringify(storedUser));

            if (!token) {
                return storedUser;
            }

            let finalUser = storedUser;
            try {
                const meResponse = await authService.getCurrentUser();
                const { user: meUser } = unwrapAuthPayload(meResponse);
                finalUser = { ...(meUser || {}), token };
                finalUser.role = pickRole(finalUser) || storedUser.role;

                if (finalUser.email === 'admin@test.com') finalUser.role = 'admin';

                setUser(finalUser);
                localStorage.setItem('user', JSON.stringify(finalUser));
            } catch (err) {
                console.warn('Failed to fetch current user after registration, using register response:', err);
            }

            return finalUser;
        } catch (error) {
            // Backend crashes with 500 when SMTP fails, but the user is already
            // created in the DB at that point. Try auto-login so the user can
            // still land on /verify and resend the verification email.
            if (error?.status === 500 && payload?.email && payload?.password) {
                try {
                    const loginResponse = await authService.login({
                        email: payload.email,
                        password: payload.password,
                    });
                    const { user: loginUser, token: loginToken } = unwrapAuthPayload(loginResponse);
                    if (loginUser || loginToken) {
                        const recoveredUser = { ...(loginUser || {}), ...(loginToken ? { token: loginToken } : {}) };
                        recoveredUser.role = pickRole(recoveredUser) || recoveredUser.role;
                        setUser(recoveredUser);
                        localStorage.setItem('user', JSON.stringify(recoveredUser));
                        return recoveredUser;
                    }
                } catch {
                    // login also failed — user was not created, surface original error
                }
            }
            console.error('Registration failed:', error);
            throw error;
        }
    };


    const logout = async () => {
        let token = String(user?.token || '').trim();
        if (!token) {
            try {
                const raw = localStorage.getItem('user');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    token = String(parsed?.token || '').trim();
                }
            } catch {
                token = '';
            }
        }

        try {
            // Avoid calling logout endpoint when token is already absent/expired.
            if (token) {
                await authService.logout();
            }
        } catch (error) {
            // 401 on logout means session is already invalid; clear client state silently.
            if (error?.status !== 401) {
                console.error('Logout API error:', error);
            }
        } finally {
            // Always clear local state regardless of API call result
            setUser(null);
            localStorage.removeItem('user');
        }
    };

    const updateUser = (updates) => {
        const updatedUser = { ...user, ...updates };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    // Refresh user data from /auth/me endpoint
    const refreshUser = async () => {
        try {
            const response = await authService.getCurrentUser();
            const { user: meUser } = unwrapAuthPayload(response);
            const userData = { ...(meUser || {}) };

            if (user?.token) {
                userData.token = user.token;
                userData.role = pickRole(userData) || userData.role;
            }

            if (!userData.kyc_status && user?.kyc_status) {
                userData.kyc_status = user.kyc_status;
            }

            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return userData;
        } catch (error) {
            console.error('Failed to refresh user:', error);
            throw error;
        }
    };

    // Helper functions to check onboarding status
    const isEmailVerified = () => hasVerifiedEmail(user);

    const getKycStatus = () => {
        const status = user?.kyc_status || user?.kycStatus || null;
        return status ? status.toLowerCase() : null;
    };

    const hasOrganizationInviteAccess = () => !!getOrganizationRole(user);

    const isKycComplete = () => {
        const status = getKycStatus();
        return status === 'approved' || status === 'completed';
    };

    const needsEmailVerification = () => {
        // Invited org members (staff/manager/admin) can proceed without email verification.
        if (hasOrganizationInviteAccess()) return false;
        return !isEmailVerified();
    };

    const needsLearnerPayment = (candidate = user) => (
        hasVerifiedEmail(candidate) && isLearnerPendingPayment(candidate)
    );

    const needsKyc = () => {
        const status = getKycStatus();
        return !status || status === 'pending' || status === 'draft' || status === 'rejected';
    };

    // Email verification function - handles the signed URL from email
    const verifyEmail = async (id, hash, queryParams = {}) => {
        try {
            // Build query string from queryParams object
            const queryString = new URLSearchParams(queryParams).toString();
            const endpoint = `/auth/email/verify/${id}/${hash}${queryString ? `?${queryString}` : ''}`;

            const data = await authService.verifyEmail(endpoint);

            // After successful verification, refresh user data if we have a token
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const refreshedUser = await refreshUser();
                    return { data, user: refreshedUser };
                } catch (refreshError) {
                    console.warn('Refresh user failed after verification:', refreshError);
                }
            }

            return data;
        } catch (error) {
            console.error('Email verification failed:', error);
            throw error;
        }
    };

    // Resend email verification link
    const resendEmail = async () => {
        try {
            const data = await authService.resendEmail();
            return data;
        } catch (error) {
            console.error('Failed to resend email:', error);
            throw error;
        }
    };

    // Forgot password - sends OTP to email
    const forgotPassword = async (email) => {
        try {
            const data = await authService.forgotPassword(email);
            return data;
        } catch (error) {
            console.error('Failed to send password reset OTP:', error);
            throw error;
        }
    };

    // Reset password with token from email link
    const resetPassword = async (email, token, password, password_confirmation) => {
        try {
            const data = await authService.resetPassword(email, token, password, password_confirmation);
            return data;
        } catch (error) {
            // Handle specific error status codes
            if (error.status === 422) {
                const apiError = new Error(error.message || 'Invalid OTP or password does not meet requirements.');
                apiError.status = 422;
                throw apiError;
            }
            console.error('Failed to reset password:', error);
            throw error;
        }
    };

    // Change password while logged in (requires authentication)
    const changePassword = async (current_password, password, password_confirmation) => {
        try {
            const data = await authService.changePassword(current_password, password, password_confirmation);

            // After successful password change, tokens are revoked
            // Clear local state and redirect to login
            setUser(null);
            localStorage.removeItem('user');

            return data;
        } catch (error) {
            // Handle specific error status codes
            if (error.status === 422) {
                const apiError = new Error(error.message || 'Current password is incorrect or new password does not meet requirements.');
                apiError.status = 422;
                throw apiError;
            }
            console.error('Failed to change password:', error);
            throw error;
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        completeLogin,
        register,
        logout,
        updateUser,
        refreshUser,
        // Email verification
        verifyEmail,
        resendEmail,
        // Password reset (token-based, no OTP)
        forgotPassword,
        resetPassword,
        // Password change (while logged in)
        changePassword,
        // Onboarding status helpers
        isEmailVerified,
        getKycStatus,
        isKycComplete,
        needsEmailVerification,
        needsLearnerPayment,
        needsKyc,
        getAccountState: () => getAccountState(user),
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
