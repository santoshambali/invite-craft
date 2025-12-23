/* app/utils/auth.js */

import { buildApiUrl, AUTH } from '../config/api';

export const setTokens = (accessToken, refreshToken) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        }
    }
};

export const getAccessToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('accessToken');
    }
    return null;
};

export const getRefreshToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('refreshToken');
    }
    return null;
};

export const clearTokens = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }
};

export const isAuthenticated = () => {
    return !!getAccessToken();
};

export const logout = async () => {
    // Optional: Call API to invalidate token
    const token = getAccessToken();
    if (token) {
        try {
            await fetch(buildApiUrl(AUTH.LOGOUT), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Logout API call failed', error);
        }
    }
    clearTokens();

    // Redirect to login
    if (typeof window !== 'undefined') {
        window.location.href = '/login';
    }
};
