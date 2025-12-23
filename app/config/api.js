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

    // Invitation endpoints (v1 API)
    INVITATIONS: {
        CREATE: '/api/v1/invitations',
        GET: (id) => `/api/v1/invitations/${id}`,
        UPLOAD_URL: '/api/v1/invitations/upload-url',
    },

    // Template endpoints (add as needed - to be implemented)
    TEMPLATES: {
        LIST: '/api/templates',
        GET: (id) => `/api/templates/${id}`,
    },

    // Event endpoints (to be implemented)
    EVENTS: {
        CREATE: '/api/v1/events',
        LIST: '/api/v1/events',
        GET: (id) => `/api/v1/events/${id}`,
        UPDATE: (id) => `/api/v1/events/${id}`,
        DELETE: (id) => `/api/v1/events/${id}`,
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
export const { AUTH, USERS, INVITATIONS, TEMPLATES, EVENTS } = API_ENDPOINTS;

// Export base URL
export { API_BASE_URL };

// Default export
export default {
    baseUrl: API_BASE_URL,
    endpoints: API_ENDPOINTS,
    buildApiUrl,
};
