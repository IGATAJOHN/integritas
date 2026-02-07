import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

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
                    // If we have a token, call /auth/me to get fresh user data
                    if (parsed.token) {
                        const data = await authService.getCurrentUser();
                        const userData = data.user || data;

                        // Preserve token from storage
                        userData.token = parsed.token;
                        userData.role = pickRole(userData) || userData.role;

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
                userData.role = pickRole(userData) || userData.role;
            }

            // After login, fetch fresh user data with roles and onboarding status
            try {
                const currentUserData = await authService.getCurrentUser();
                const freshUserData = currentUserData.user || currentUserData;
                freshUserData.token = token;
                freshUserData.role = pickRole(freshUserData) || freshUserData.role;

                setUser(freshUserData);
                localStorage.setItem('user', JSON.stringify(freshUserData));
                return freshUserData;
            } catch (error) {
                // If /auth/me fails, use login response data
                console.warn('Failed to fetch current user after login, using login response:', error);

                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                return userData;
            }
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const pickRole = (u) => {
        const names = u?.roles?.map((r) => r.name) || [];
        if (u?.role) return u.role;
        if (names.includes("admin") || names.includes("administrator")) return "admin";
        if (names.includes("tutor")) return "tutor";
        if (names.includes("student") || names.includes("learner")) return "learner";
        return null;
    };

    const register = async (payload) => {
        try {
            const data = await authService.register(payload);

            const baseUser = data.user || data;
            const token = data.token;

            const storedUser = { ...baseUser, token };
            storedUser.role = pickRole(storedUser) || storedUser.role;

            setUser(storedUser);
            localStorage.setItem("user", JSON.stringify(storedUser));

            let finalUser = storedUser;
            try {
                const current = await authService.getCurrentUser();
                const fresh = current.user || current;
                finalUser = { ...fresh, token };
                finalUser.role = pickRole(finalUser) || storedUser.role;

                if (finalUser.email === "admin@test.com") finalUser.role = "admin";

                setUser(finalUser);
                localStorage.setItem("user", JSON.stringify(finalUser));
            } catch (err) {
                console.warn("Failed to fetch current user after registration, using register response:", err);
            }

            const verified =
                finalUser?.email_verified === true ||
                finalUser?.emailVerified === true ||
                !!finalUser?.email_verified_at ||
                !!finalUser?.emailVerifiedAt;

            if (!verified) {
                try {
                    await authService.resendEmail();
                } catch (emailError) {
                    console.warn("Auto-resend of verification email failed:", emailError);
                }
            }

            return finalUser;
        } catch (error) {
            console.error("Registration failed:", error);
            throw error;
        }
    };


    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
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
                userData.role = pickRole(userData) || userData.role;
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
        // Support multiple common field names from backend (boolean or timestamp)
        return (
            user?.email_verified === true ||
            user?.emailVerified === true ||
            !!user?.email_verified_at ||
            !!user?.emailVerifiedAt
        );
    };

    const getKycStatus = () => {
        const status = user?.kyc_status || user?.kycStatus || null;
        return status ? status.toLowerCase() : null;
    };

    const isKycComplete = () => {
        const status = getKycStatus();
        return status === 'approved' || status === 'completed';
    };

    const needsEmailVerification = () => {
        return !isEmailVerified();
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

            // After successful verification, refresh user data if we have a token
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    await refreshUser();
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
