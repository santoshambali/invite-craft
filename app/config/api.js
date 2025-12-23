/**
 * API Configuration
 * 
 * This file centralizes all API endpoint configurations.
 * Base URL is read from environment variables for flexibility across environments.
 */

// Get base URL from environment variable or use default
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://192.168.29.200:8080';

// API Endpoints configuration
const API_ENDPOINTS = {
    // Authentication endpoints
    AUTH: {
        LOGIN: '/api/auth/login',
        LOGOUT: '/api/auth/logout',
        REFRESH: '/api/auth/refresh',
    },

    // User endpoints
    USERS: {
        REGISTER: '/api/users/register',
        PROFILE: '/api/users/profile',
        UPDATE: '/api/users/update',
    },

    // Invitation endpoints (add as needed)
    INVITATIONS: {
        CREATE: '/api/invitations',
        LIST: '/api/invitations',
        GET: (id) => `/api/invitations/${id}`,
        UPDATE: (id) => `/api/invitations/${id}`,
        DELETE: (id) => `/api/invitations/${id}`,
    },

    // Template endpoints (add as needed)
    TEMPLATES: {
        LIST: '/api/templates',
        GET: (id) => `/api/templates/${id}`,
    },
};

/**
 * Build full API URL
 * @param {string} endpoint - The endpoint path
 * @returns {string} Full API URL
 */
export const buildApiUrl = (endpoint) => {
    return `${API_BASE_URL}${endpoint}`;
};

/**
 * Get API configuration
 * @returns {object} API configuration object
 */
export const getApiConfig = () => {
    return {
        baseUrl: API_BASE_URL,
        endpoints: API_ENDPOINTS,
    };
};

// Export individual endpoint groups for convenience
export const { AUTH, USERS, INVITATIONS, TEMPLATES } = API_ENDPOINTS;

// Export base URL
export { API_BASE_URL };

// Default export
export default {
    baseUrl: API_BASE_URL,
    endpoints: API_ENDPOINTS,
    buildApiUrl,
};
