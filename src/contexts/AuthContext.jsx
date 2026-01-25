import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initialize auth by calling /auth/me to get fresh user data with roles and onboarding status
    useEffect(() => {
        const initializeAuth = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    // If we have a token, call /auth/me to get fresh user data
                    if (parsed.token) {
                        const data = await authService.getCurrentUser();
                        const userData = data.user || data;

                        // Preserve token from storage
                        userData.token = parsed.token;

                        // Temporary bypass for testing: Force admin role for specific email
                        if (userData.email === 'admin@test.com') {
                            userData.role = 'admin';
                        }

                        setUser(userData);
                        localStorage.setItem('user', JSON.stringify(userData));
                    } else {
                        // No token, just use stored user
                        setUser(parsed);
                    }
                } catch (error) {
                    // Token invalid or expired, clear storage
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
            const data = await authService.login({ email, password });
            const userData = data.user || data;
            const token = data.token;

            if (token) {
                userData.token = token;
            }

            // After login, fetch fresh user data with roles and onboarding status
            try {
                const currentUserData = await authService.getCurrentUser();
                const freshUserData = currentUserData.user || currentUserData;
                freshUserData.token = token;
                // Temporary bypass for testing: Force admin role for specific email
                if (freshUserData.email === 'admin@test.com') {
                    freshUserData.role = 'admin';
                }

                setUser(freshUserData);
                localStorage.setItem('user', JSON.stringify(freshUserData));
                return freshUserData;
            } catch (error) {
                // If /auth/me fails, use login response data
                console.warn('Failed to fetch current user after login, using login response:', error);

                // Temporary bypass for testing: Force admin role for specific email
                if (userData.email === 'admin@test.com') {
                    userData.role = 'admin';
                }

                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return userData;
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const data = await authService.register(userData);
            const user = data.user || data;
            if (data.token) {
                user.token = data.token;
            }

            // After registration, fetch fresh user data with roles and onboarding status
            try {
                const currentUserData = await authService.getCurrentUser();
                const freshUserData = currentUserData.user || currentUserData;
                freshUserData.token = user.token;
                // Temporary bypass for testing: Force admin role for specific email
                if (freshUserData.email === 'admin@test.com') {
                    freshUserData.role = 'admin';
                }

                setUser(freshUserData);
                localStorage.setItem('user', JSON.stringify(freshUserData));
                return freshUserData;
            } catch (error) {
                // If /auth/me fails, use registration response data
                console.warn('Failed to fetch current user after registration, using registration response:', error);

                // Temporary bypass for testing: Force admin role for specific email
                if (user.email === 'admin@test.com') {
                    user.role = 'admin';
                }

                setUser(user);
                localStorage.setItem('user', JSON.stringify(user));
                return user;
            }
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            // Call logout API to invalidate token on server
            await authService.logout();
        } catch (error) {
            // Even if API call fails, clear local state
            console.error('Logout API error:', error);
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
            const data = await authService.getCurrentUser();
            const userData = data.user || data;

            // Preserve token
            if (user?.token) {
                userData.token = user.token;
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
    const isEmailVerified = () => {
        return user?.email_verified === true || user?.emailVerified === true;
    };

    const getKycStatus = () => {
        return user?.kyc_status || user?.kycStatus || null;
    };

    const isKycComplete = () => {
        const status = getKycStatus();
        return status === 'approved' || status === 'completed';
    };

    const needsEmailVerification = () => {
        // Commented out to bypass email verification flow as requested
        // return !isEmailVerified();
        return false;
    };

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

            // After successful verification, refresh user data to update email_verified status
            await refreshUser();

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

    // Verify password reset OTP
    const verifyPasswordOtp = async (email, otp) => {
        try {
            const data = await authService.verifyPasswordOtp(email, otp);
            return data;
        } catch (error) {
            // Handle specific error status codes
            if (error.status === 422) {
                const apiError = new Error('Invalid or expired OTP. Please request a new one.');
                apiError.status = 422;
                throw apiError;
            } else if (error.status === 429) {
                const apiError = new Error('Too many failed attempts. Your account has been temporarily locked. Please try again later.');
                apiError.status = 429;
                throw apiError;
            }
            console.error('Failed to verify password reset OTP:', error);
            throw error;
        }
    };

    // Reset password with OTP
    const resetPassword = async (email, otp, password, password_confirmation) => {
        try {
            const data = await authService.resetPassword(email, otp, password, password_confirmation);
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
        register,
        logout,
        updateUser,
        refreshUser,
        // Email verification
        verifyEmail,
        resendEmail,
        // Password reset
        forgotPassword,
        verifyPasswordOtp,
        resetPassword,
        // Password change (while logged in)
        changePassword,
        // Onboarding status helpers
        isEmailVerified,
        getKycStatus,
        isKycComplete,
        needsEmailVerification,
        needsKyc,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
