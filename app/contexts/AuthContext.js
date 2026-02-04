/**
 * Authentication Context
 * 
 * Provides global authentication state management using React Context
 * Handles token storage, automatic refresh, and user session management
 */

'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

/**
 * Custom hook to use auth context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

/**
 * Authentication Provider Component
 */
export const AuthProvider = ({ children }) => {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [refreshToken, setRefreshToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    /**
     * Initialize auth state from localStorage
     */
    useEffect(() => {
        const initAuth = () => {
            try {
                const storedAccessToken = localStorage.getItem('accessToken');
                const storedRefreshToken = localStorage.getItem('refreshToken');
                const storedUser = localStorage.getItem('user');

                if (storedAccessToken) {
                    setAccessToken(storedAccessToken);
                    setRefreshToken(storedRefreshToken);

                    if (storedUser) {
                        setUser(JSON.parse(storedUser));
                    }

                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initAuth();
    }, []);

    /**
     * Store tokens and user data
     */
    const storeAuthData = useCallback((authData) => {
        const { accessToken, username, userId } = authData;

        setAccessToken(accessToken);
        setIsAuthenticated(true);

        const userData = { username, userId };
        setUser(userData);

        // Store in localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));

        // Note: refreshToken might be in httpOnly cookie, not in response
        // If it's in the response, store it
        if (authData.refreshToken) {
            setRefreshToken(authData.refreshToken);
            localStorage.setItem('refreshToken', authData.refreshToken);
        }
    }, []);

    /**
     * Clear auth data
     */
    const clearAuthData = useCallback(() => {
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
        setIsAuthenticated(false);

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }, []);

    /**
     * Login function
     */
    const login = useCallback(async (credentials) => {
        try {
            const result = await authService.login(credentials);

            if (result.success) {
                storeAuthData(result.data);
                return { success: true, message: result.message };
            } else {
                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message || 'An unexpected error occurred during login' };
        }
    }, [storeAuthData]);

    /**
     * Register function
     */
    const register = useCallback(async (userData) => {
        try {
            const result = await authService.register(userData);
            return result;
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: error.message || 'An unexpected error occurred during registration' };
        }
    }, []);

    /**
     * Logout function
     */
    const logout = useCallback(async () => {
        try {
            // Call logout API to invalidate token on server
            if (accessToken) {
                await authService.logout(accessToken);
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Always clear local auth data
            clearAuthData();
            router.push('/');
        }
    }, [accessToken, clearAuthData, router]);

    /**
     * Refresh access token
     */
    const refreshAccessToken = useCallback(async () => {
        try {
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const result = await authService.refreshAccessToken(refreshToken);

            if (result.success) {
                const newAccessToken = result.data.accessToken;
                setAccessToken(newAccessToken);
                localStorage.setItem('accessToken', newAccessToken);
                return { success: true, accessToken: newAccessToken };
            } else {
                // Refresh failed, logout user
                clearAuthData();
                router.push('/');
                return { success: false };
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            clearAuthData();
            router.push('/');
            return { success: false };
        }
    }, [refreshToken, clearAuthData, router]);

    /**
     * Get current user ID from token
     */
    const getUserId = useCallback(() => {
        if (user?.userId) {
            return user.userId;
        }

        if (!accessToken) return null;

        try {
            // Decode JWT payload (base64)
            const payload = accessToken.split('.')[1];
            const decoded = JSON.parse(atob(payload));
            return decoded.userId || decoded.sub || decoded.user_id || null;
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }, [accessToken, user]);

    const value = {
        user,
        accessToken,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        refreshAccessToken,
        getUserId,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
