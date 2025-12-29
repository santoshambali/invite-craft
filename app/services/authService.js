/**
 * Authentication Service
 * 
 * Centralized service for all authentication-related API calls
 * Follows best practices for token management and error handling
 */

import { buildApiUrl, AUTH, USERS } from '../config/api';

/**
 * Login user with username and password
 * @param {Object} credentials - User credentials
 * @param {string} credentials.username - Username
 * @param {string} credentials.password - Password
 * @returns {Promise<Object>} Login response with tokens and user data
 */
export const login = async (credentials) => {
    try {
        const response = await fetch(buildApiUrl(AUTH.LOGIN), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
            credentials: 'include', // Include cookies for refresh token
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        if (data.status !== 'success') {
            throw new Error(data.message || 'Login unsuccessful');
        }

        return {
            success: true,
            data: data.data,
            message: data.message || 'Login successful',
        };
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            error: error.message || 'Network error. Please try again.',
        };
    }
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Registration response
 */
export const register = async (userData) => {
    try {
        const response = await fetch(buildApiUrl(USERS.REGISTER), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        if (data.status !== 'success') {
            throw new Error(data.message || 'Registration unsuccessful');
        }

        return {
            success: true,
            data: data.data,
            message: data.message || 'Registration successful',
        };
    } catch (error) {
        console.error('Registration error:', error);
        return {
            success: false,
            error: error.message || 'Network error. Please try again.',
        };
    }
};

/**
 * Logout user and invalidate token
 * @param {string} accessToken - Current access token
 * @returns {Promise<Object>} Logout response
 */
export const logout = async (accessToken) => {
    try {
        const response = await fetch(buildApiUrl(AUTH.LOGOUT), {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Include cookies
        });

        const data = await response.json();

        // Even if the API call fails, we should clear local tokens
        return {
            success: response.ok,
            message: data.message || 'Logged out successfully',
        };
    } catch (error) {
        console.error('Logout error:', error);
        // Return success anyway to clear local tokens
        return {
            success: true,
            message: 'Logged out locally',
        };
    }
};

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} New access token
 */
export const refreshAccessToken = async (refreshToken) => {
    try {
        const response = await fetch(buildApiUrl(AUTH.REFRESH), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Token refresh failed');
        }

        if (data.status !== 'success') {
            throw new Error(data.message || 'Token refresh unsuccessful');
        }

        return {
            success: true,
            data: data.data,
            message: data.message || 'Token refreshed',
        };
    } catch (error) {
        console.error('Token refresh error:', error);
        return {
            success: false,
            error: error.message || 'Failed to refresh token',
        };
    }
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
export const validatePassword = (password) => {
    if (!password) {
        return {
            isValid: false,
            message: 'Password is required',
        };
    }

    if (password.length < 8) {
        return {
            isValid: false,
            message: 'Password must be at least 8 characters long',
        };
    }

    if (password.length > 128) {
        return {
            isValid: false,
            message: 'Password is too long (maximum 128 characters)',
        };
    }

    // Check for complexity requirements
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\\/~`]/.test(password);

    const requirementsMet = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar].filter(Boolean).length;

    if (requirementsMet < 3) {
        return {
            isValid: false,
            message: 'Password must contain at least 3 of: uppercase letter, lowercase letter, number, special character',
        };
    }

    // Check for common weak passwords (data breach prevention)
    const commonPasswords = [
        'password', 'password123', '12345678', 'qwerty', 'abc123',
        'password1', '12345', '1234567', 'welcome', 'admin',
        'letmein', 'monkey', '1234567890', 'qwerty123', 'password1234',
        'iloveyou', '1q2w3e4r', 'admin123', 'welcome123', 'passw0rd'
    ];

    if (commonPasswords.includes(password.toLowerCase())) {
        return {
            isValid: false,
            message: 'This password is too common and has been found in data breaches. Please choose a stronger password',
        };
    }

    // Check for repeated characters (e.g., "aaa", "111")
    if (/(.)\1{2,}/.test(password)) {
        return {
            isValid: false,
            message: 'Password should not contain repeated characters (e.g., "aaa", "111")',
        };
    }

    // Check for sequential characters (e.g., "abc", "123")
    const hasSequential = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password);
    if (hasSequential) {
        return {
            isValid: false,
            message: 'Password should not contain sequential characters (e.g., "abc", "123")',
        };
    }

    return {
        isValid: true,
        message: 'Password is strong',
        strength: requirementsMet === 4 ? 'strong' : 'medium'
    };
};

/**
 * Validate username
 * @param {string} username - Username to validate
 * @returns {Object} Validation result
 */
export const validateUsername = (username) => {
    if (username.length < 3) {
        return {
            isValid: false,
            message: 'Username must be at least 3 characters long',
        };
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return {
            isValid: false,
            message: 'Username can only contain letters, numbers, and underscores',
        };
    }

    return {
        isValid: true,
        message: 'Username is valid',
    };
};

export default {
    login,
    register,
    logout,
    refreshAccessToken,
    validateEmail,
    validatePassword,
    validateUsername,
};
