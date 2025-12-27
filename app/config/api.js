/**
 * API Configuration
 *
 * This file centralizes all API endpoint configurations.
 * Base URL is read from environment variables for flexibility across environments.
 */

// Base URLs for different services
// Allow overriding via environment variables (e.g. from Docker Compose)
// For runtime configuration in Docker, check window.__ENV__ first (server-side injected)
const getEnvVar = (key, defaultValue) => {
  // Client-side: check window.__ENV__ for runtime config
  if (typeof window !== "undefined" && window.__ENV__) {
    return window.__ENV__[key] || defaultValue;
  }
  // Server-side or build-time: use process.env
  return process.env[key] || defaultValue;
};

const API_BASE_URL = getEnvVar(
  "NEXT_PUBLIC_API_BASE_URL",
  "http://localhost:8080"
);

const INVITATION_API_BASE_URL =
  getEnvVar("NEXT_PUBLIC_INVITATION_API_BASE_URL", null) ||
  getEnvVar("NEXT_PUBLIC_API_BASE_URL", "http://localhost:8080");

const APP_BASE_URL = getEnvVar(
  "NEXT_PUBLIC_APP_URL",
  "http://localhost:3000"
);

// API Endpoints configuration
const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    REFRESH: "/api/auth/refresh",
  },

  // User endpoints
  USERS: {
    REGISTER: "/api/users/register",
    PROFILE: "/api/users/profile",
    UPDATE: "/api/users/update",
  },

  // Invitation endpoints (v1 API)
  INVITATIONS: {
    LIST: "/api/v1/invitations",
    CREATE: "/api/v1/invitations",
    GET: (id) => `/api/v1/invitations/${id}`,
    UPDATE: (id) => `/api/v1/invitations/${id}`,
    DELETE: (id) => `/api/v1/invitations/${id}`,
    UPLOAD_URL: "/api/v1/invitations/upload-url",
  },

  // Template endpoints (add as needed - to be implemented)
  TEMPLATES: {
    LIST: "/api/templates",
    GET: (id) => `/api/templates/${id}`,
  },

  // Event endpoints (to be implemented)
  EVENTS: {
    CREATE: "/api/v1/events",
    LIST: (userId) =>
      userId ? `/api/v1/events?userId=${userId}` : "/api/v1/events",
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
 * Build full API URL for invitation service (uses localhost)
 * @param {string} endpoint - The endpoint path
 * @returns {string} Full API URL
 */
export const buildInvitationApiUrl = (endpoint) => {
  return `${INVITATION_API_BASE_URL}${endpoint}`;
};



/**
 * Build share URL for frontend (uses APP_URL/NEXT_PUBLIC_APP_URL)
 * @param {string} id - Invitation ID
 * @returns {string} Full Share URL
 */
export const buildShareUrl = (id) => {
  // Use APP_BASE_URL to ensure share links point to the frontend application
  const baseUrl = APP_BASE_URL.endsWith("/")
    ? APP_BASE_URL.slice(0, -1)
    : APP_BASE_URL;
  return `${baseUrl}/share/${id}`;
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

// Export base URLs
export { API_BASE_URL, INVITATION_API_BASE_URL, APP_BASE_URL };

// Default export
export default {
  baseUrl: API_BASE_URL,
  invitationBaseUrl: INVITATION_API_BASE_URL,
  appBaseUrl: APP_BASE_URL,
  endpoints: API_ENDPOINTS,
  buildApiUrl,
  buildInvitationApiUrl,
  buildShareUrl,
};
