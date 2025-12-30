/**
 * Invitation Service
 *
 * Handles all API interactions for invitations including:
 * - Creating invitations
 * - Fetching invitations
 * - Uploading images via signed URLs
 */

import {
  buildInvitationApiUrl,
  buildShareUrl,
  buildApiUrl,
  buildAiApiUrl,
  AI,
} from "../config/api";

import { getAccessToken, getUserId } from "../utils/auth";

/**
 * Get authorization headers

/**
 * Get authorization headers
 * @returns {Object} Headers object with authorization
 */
const getAuthHeaders = () => {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Handle API response
 * @param {Response} response - Fetch response object
 * @returns {Promise<Object>} Parsed response data
 */
const handleResponse = async (response) => {
  // Check if response has content
  const contentType = response.headers.get("content-type");
  const hasJson = contentType && contentType.includes("application/json");

  let data = {};

  // Only try to parse JSON if content-type indicates JSON
  if (hasJson) {
    try {
      data = await response.json();
    } catch (e) {
      // If JSON parsing fails, create error object
      data = { error: { details: "Invalid response from server" } };
    }
  }

  if (!response.ok) {
    // Special handling for 401 Unauthorized
    if (response.status === 401) {
      throw new Error(
        "Authentication required. Please log in or ensure the API supports guest access."
      );
    }

    throw new Error(
      data.error?.details || data.message || `API request failed with status ${response.status}`
    );
  }

  return data;
};

/**
 * Get signed URL for viewing/reading an image from GCS
 * @param {string} filename - Name of the file to view (or full path)
 * @returns {Promise<string>} Signed URL for viewing the image
 */
export const getViewUrl = async (filename) => {
  try {
    const url = buildInvitationApiUrl(
      `/api/v1/invitations/view-url?filename=${encodeURIComponent(filename)}`
    );
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const result = await handleResponse(response);
    return result.data?.viewUrl || result.viewUrl;
  } catch (error) {
    console.error("Error getting view URL:", error);
    throw error;
  }
};

/**
 * Get signed URL for image upload
 * @param {string} filename - Name of the file to upload
 * @returns {Promise<Object>} Object containing uploadUrl and publicUrl
 */
export const getUploadUrl = async (filename) => {
  try {
    const url = buildInvitationApiUrl(
      `/api/v1/invitations/upload-url?filename=${encodeURIComponent(filename)}`
    );
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const result = await handleResponse(response);
    return result.data; // Returns { uploadUrl, publicUrl }
  } catch (error) {
    console.error("Error getting upload URL:", error);
    throw error;
  }
};

/**
 * Upload image to GCS using signed URL
 * @param {string} uploadUrl - Signed URL from getUploadUrl
 * @param {File|Blob} file - File or Blob to upload
 * @returns {Promise<void>}
 */
export const uploadImageToGCS = async (uploadUrl, file) => {
  try {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      mode: "cors",
      headers: {
        "Content-Type": file.type || "image/png",
      },
      body: file,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image to GCS");
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

/**
 * Convert data URL to Blob
 * @param {string} dataUrl - Data URL from canvas or html-to-image
 * @returns {Blob} Blob object
 */
export const dataUrlToBlob = (dataUrl) => {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

/**
 * Upload invitation image and get public URL
 * @param {string} dataUrl - Data URL of the invitation image
 * @param {string} eventTitle - Title of the event (used for filename)
 * @returns {Promise<string>} Public URL of the uploaded image
 */
export const uploadInvitationImage = async (
  dataUrl,
  eventTitle = "invitation"
) => {
  try {
    // Generate filename
    const timestamp = Date.now();
    const sanitizedTitle = eventTitle.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const filename = `${sanitizedTitle}_${timestamp}.png`;

    // Get signed URL
    const { uploadUrl, publicUrl } = await getUploadUrl(filename);

    // Convert data URL to Blob
    const blob = dataUrlToBlob(dataUrl);

    // Upload to GCS
    await uploadImageToGCS(uploadUrl, blob);

    return publicUrl;
  } catch (error) {
    console.error("Error uploading invitation image:", error);
    throw error;
  }
};

/**
 * Generate invitation image using AI
 * @param {Object} invitationData - Full event details for image generation
 * @returns {Promise<string>} URL of the generated image
 */
export const generateInvitationImage = async (invitationData) => {
  try {
    const url = buildAiApiUrl(AI.GENERATE_IMAGE);
    // Assuming the API expects query parameters based on typical FastAPI/Swagger structure "generate_invitation_image_generate_invitation_image_post"
    // Usually accepts a JSON body or query params. I will try JSON body first as it is a POST.
    // If "prompt" is the key.
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add auth headers if needed, but maybe this AI service is open or uses same token?
        // I'll add auth headers just in case.
        ...getAuthHeaders(),
      },
      body: JSON.stringify(invitationData),
    });

    const result = await handleResponse(response);
    // Handle the specific response structure from the AI service
    if (result.gcs_urls && Array.isArray(result.gcs_urls) && result.gcs_urls.length > 0) {
      return result.gcs_urls[0];
    }

    // Fallbacks for other potential formats
    return result.url || result.image_url || result.imageUrl || result;
  } catch (error) {
    console.error("Error generating AI invitation image:", error);
    throw error;
  }
};

/**
 * Create a new invitation
 * @param {Object} invitationData - Invitation data
 * @param {string} invitationData.eventId - UUID of the event
 * @param {string} invitationData.templateId - Template identifier
 * @param {string} [invitationData.imageUrl] - Optional public URL of the invitation image
 * @returns {Promise<Object>} Created invitation response
 */
export const createInvitation = async (invitationData) => {
  try {
    const url = buildInvitationApiUrl("/api/v1/invitations");
    const response = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(invitationData),
    });

    const result = await handleResponse(response);
    return result.data; // Returns InvitationResponse
  } catch (error) {
    console.error("Error creating invitation:", error);
    throw error;
  }
};

/**
 * Get all invitations for the authenticated user
 * @param {string} [userId] - Optional userId to filter invitations
 * @returns {Promise<Array>} List of invitations
 */
export const getUserInvitations = async (userId) => {
  try {
    let url = buildInvitationApiUrl("/api/v1/invitations");
    if (userId) {
      url += `?userId=${encodeURIComponent(userId)}`;
    }
    console.log("Fetching invitations from:", url);
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const result = await handleResponse(response);
    console.log("API Response:", result);

    // Handle different response formats - backend returns { items: [...] }
    const invitations = result.items || result.data || result.invitations || [];
    console.log("Parsed invitations:", invitations);

    return Array.isArray(invitations) ? invitations : [];
  } catch (error) {
    console.error("Error fetching invitations:", error);
    throw error;
  }
};

/**
 * Delete an invitation by ID
 * @param {string} id - UUID of the invitation
 * @returns {Promise<void>}
 */
export const deleteInvitation = async (id) => {
  try {
    const url = buildInvitationApiUrl(`/api/v1/invitations/${id}`);
    const response = await fetch(url, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(
        data.error?.details || data.message || "Failed to delete invitation"
      );
    }
  } catch (error) {
    console.error("Error deleting invitation:", error);
    throw error;
  }
};

/**
 * Get invitation by ID
 * @param {string} id - UUID of the invitation
 * @returns {Promise<Object>} Invitation data
 */
export const getInvitation = async (id) => {
  try {
    const url = buildInvitationApiUrl(`/api/v1/invitations/${id}`);
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const result = await handleResponse(response);
    return result.data;
  } catch (error) {
    console.error("Error fetching invitation:", error);
    throw error;
  }
};

/**
 * Get shareable URL for invitation
 * @param {string} id - UUID of the invitation
 * @returns {Promise<Object>} Share URL data with shareUrl, invitationId, title, imageUrl
 */
export const getShareUrl = async (id) => {
  try {
    const url = buildInvitationApiUrl(`/api/v1/invitations/${id}/share`);
    const response = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const result = await handleResponse(response);
    const data = result.data;

    // Use centralized logic from api.js to set the correct share URL
    data.shareUrl = buildShareUrl(id);

    return data;
  } catch (error) {
    console.error("Error fetching share URL:", error);
    throw error;
  }
};

/**
 * Update an existing invitation
 * @param {string} id - UUID of the invitation
 * @param {Object} invitationData - Updated invitation data
 * @returns {Promise<Object>} Updated invitation response
 */
export const updateInvitation = async (id, invitationData) => {
  try {
    const url = buildInvitationApiUrl(`/api/v1/invitations/${id}`);
    const response = await fetch(url, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(invitationData),
    });

    const result = await handleResponse(response);
    return result.data; // Returns InvitationResponse
  } catch (error) {
    console.error("Error updating invitation:", error);
    throw error;
  }
};

/**
 * Format time string to HH:mm:ss format for backend
 * @param {string} time - Time string (e.g., "14:30" or "2:30 PM")
 * @returns {string} Formatted time string (HH:mm:ss)
 */
const formatTimeForBackend = (time) => {
  if (!time) return null;

  // If already in HH:mm:ss format, return as is
  if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
    return time;
  }

  // If in HH:mm format, add seconds
  if (/^\d{2}:\d{2}$/.test(time)) {
    return `${time}:00`;
  }

  // Try to parse other formats
  try {
    const date = new Date(`1970-01-01T${time}`);
    if (!isNaN(date.getTime())) {
      return date.toTimeString().slice(0, 8);
    }
  } catch (e) {
    // Fall through
  }

  return time;
};

/**
 * Format date string to YYYY-MM-DD format for backend
 * @param {string} date - Date string
 * @returns {string} Formatted date string (YYYY-MM-DD)
 */
const formatDateForBackend = (date) => {
  if (!date) return null;

  // If already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  // Try to parse and format
  try {
    const parsed = new Date(date);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0];
    }
  } catch (e) {
    // Fall through
  }

  return date;
};

/**
 * Save invitation with image upload
 * This is a convenience method that handles both image upload and invitation creation
 * Supports both authenticated users (with userId) and guest users (without userId)
 * @param {Object} eventData - Event data from the form
 * @param {string} imageDataUrl - Data URL of the invitation image
 * @param {boolean} isGuest - Whether this is a guest user (optional, defaults to false)
 * @returns {Promise<Object>} Created invitation response
 */
export const saveInvitationWithImage = async (eventData, imageDataUrl, isGuest = false) => {
  try {
    // Upload image first
    const imageUrl = await uploadInvitationImage(imageDataUrl, eventData.title);

    // Get userId from JWT token (optional for guests)
    const userId = getUserId();

    // For non-guest users, require authentication
    if (!isGuest && !userId) {
      throw new Error(
        "User not authenticated. Please log in to save invitations."
      );
    }

    // Create invitation with all required fields matching backend API schema
    const invitationData = {
      eventId: eventData.eventId || generateTempEventId(),
      templateId: eventData.templateId || eventData.category || "custom",
      imageUrl: imageUrl,
      title: eventData.title || null,
      eventType: eventData.eventType || null,
      date: formatDateForBackend(eventData.date),
      time: formatTimeForBackend(eventData.time),
      location: eventData.location || null,
      gmapUrl: eventData.gmapUrl || null,
      description: eventData.description || null,
    };

    // Only add userId if user is authenticated
    if (userId) {
      invitationData.userId = userId;
    }

    // Remove null/undefined values to avoid sending empty fields
    Object.keys(invitationData).forEach((key) => {
      if (invitationData[key] === null || invitationData[key] === undefined) {
        delete invitationData[key];
      }
    });

    const invitation = await createInvitation(invitationData);

    return {
      ...invitation,
      eventData, // Include original event data for local storage fallback
      isGuest: isGuest || !userId, // Mark as guest if no userId
    };
  } catch (error) {
    console.error("Error saving invitation with image:", error);
    throw error;
  }
};

/**
 * Generate temporary event ID (until events API is integrated)
 * @returns {string} Temporary UUID-like string
 */
const generateTempEventId = () => {
  // Simple UUID v4 generator
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Update invitation with image upload
 * This is a convenience method that handles both image upload and invitation update
 * Supports both authenticated users (with userId) and guest users (without userId)
 * @param {string} id - Invitation ID to update
 * @param {Object} eventData - Event data from the form
 * @param {string} imageDataUrl - Data URL of the invitation image
 * @param {boolean} isGuest - Whether this is a guest user (optional, defaults to false)
 * @returns {Promise<Object>} Updated invitation response
 */
export const updateInvitationWithImage = async (
  id,
  eventData,
  imageDataUrl,
  isGuest = false
) => {
  try {
    // Upload image first
    const imageUrl = await uploadInvitationImage(imageDataUrl, eventData.title);

    // Get userId from JWT token (optional for guests)
    const userId = getUserId();

    // For non-guest users, require authentication
    if (!isGuest && !userId) {
      throw new Error(
        "User not authenticated. Please log in to update invitations."
      );
    }

    // Update invitation with all required fields matching backend API schema
    const invitationData = {
      eventId: eventData.eventId || generateTempEventId(),
      templateId: eventData.templateId || eventData.category || "custom",
      imageUrl: imageUrl,
      title: eventData.title || null,
      eventType: eventData.eventType || null,
      date: formatDateForBackend(eventData.date),
      time: formatTimeForBackend(eventData.time),
      location: eventData.location || null,
      gmapUrl: eventData.gmapUrl || null,
      description: eventData.description || null,
    };

    // Only add userId if user is authenticated
    if (userId) {
      invitationData.userId = userId;
    }

    // Remove null/undefined values to avoid sending empty fields
    Object.keys(invitationData).forEach((key) => {
      if (invitationData[key] === null || invitationData[key] === undefined) {
        delete invitationData[key];
      }
    });

    const invitation = await updateInvitation(id, invitationData);

    return {
      ...invitation,
      eventData, // Include original event data for local storage fallback
      isGuest: isGuest || !userId, // Mark as guest if no userId
    };
  } catch (error) {
    console.error("Error updating invitation with image:", error);
    throw error;
  }
};

export default {
  getUploadUrl,
  uploadImageToGCS,
  uploadInvitationImage,
  createInvitation,
  updateInvitation,
  getInvitation,
  getShareUrl,
  getUserInvitations,
  deleteInvitation,
  saveInvitationWithImage,
  updateInvitationWithImage,
  generateInvitationImage,
};
