/**
 * Invitation Service
 * 
 * Handles all API interactions for invitations including:
 * - Creating invitations
 * - Fetching invitations
 * - Uploading images via signed URLs
 */

import { buildApiUrl } from '../config/api';
import { getAccessToken } from '../utils/auth';

/**
 * Get authorization headers
 * @returns {Object} Headers object with authorization
 */
const getAuthHeaders = () => {
    const token = getAccessToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

/**
 * Handle API response
 * @param {Response} response - Fetch response object
 * @returns {Promise<Object>} Parsed response data
 */
const handleResponse = async (response) => {
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.details || data.message || 'API request failed');
    }

    return data;
};

/**
 * Get signed URL for image upload
 * @param {string} filename - Name of the file to upload
 * @returns {Promise<Object>} Object containing uploadUrl and publicUrl
 */
export const getUploadUrl = async (filename) => {
    try {
        const url = buildApiUrl(`/api/v1/invitations/upload-url?filename=${encodeURIComponent(filename)}`);
        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const result = await handleResponse(response);
        return result.data; // Returns { uploadUrl, publicUrl }
    } catch (error) {
        console.error('Error getting upload URL:', error);
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
            method: 'PUT',
            headers: {
                'Content-Type': file.type || 'image/png'
            },
            body: file
        });

        if (!response.ok) {
            throw new Error('Failed to upload image to GCS');
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};

/**
 * Convert data URL to Blob
 * @param {string} dataUrl - Data URL from canvas or html-to-image
 * @returns {Blob} Blob object
 */
export const dataUrlToBlob = (dataUrl) => {
    const arr = dataUrl.split(',');
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
export const uploadInvitationImage = async (dataUrl, eventTitle = 'invitation') => {
    try {
        // Generate filename
        const timestamp = Date.now();
        const sanitizedTitle = eventTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const filename = `${sanitizedTitle}_${timestamp}.png`;

        // Get signed URL
        const { uploadUrl, publicUrl } = await getUploadUrl(filename);

        // Convert data URL to Blob
        const blob = dataUrlToBlob(dataUrl);

        // Upload to GCS
        await uploadImageToGCS(uploadUrl, blob);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading invitation image:', error);
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
        const url = buildApiUrl('/api/v1/invitations');
        const response = await fetch(url, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(invitationData)
        });

        const result = await handleResponse(response);
        return result.data; // Returns InvitationResponse
    } catch (error) {
        console.error('Error creating invitation:', error);
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
        const url = buildApiUrl(`/api/v1/invitations/${id}`);
        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        const result = await handleResponse(response);
        return result.data;
    } catch (error) {
        console.error('Error fetching invitation:', error);
        throw error;
    }
};

/**
 * Save invitation with image upload
 * This is a convenience method that handles both image upload and invitation creation
 * @param {Object} eventData - Event data from the form
 * @param {string} imageDataUrl - Data URL of the invitation image
 * @returns {Promise<Object>} Created invitation response
 */
export const saveInvitationWithImage = async (eventData, imageDataUrl) => {
    try {
        // Upload image first
        const imageUrl = await uploadInvitationImage(imageDataUrl, eventData.title);

        // Create invitation with the image URL
        const invitationData = {
            eventId: eventData.eventId || generateTempEventId(),
            templateId: eventData.templateId || eventData.category || 'custom',
            imageUrl: imageUrl
        };

        const invitation = await createInvitation(invitationData);

        return {
            ...invitation,
            eventData // Include original event data for local storage fallback
        };
    } catch (error) {
        console.error('Error saving invitation with image:', error);
        throw error;
    }
};

/**
 * Generate temporary event ID (until events API is integrated)
 * @returns {string} Temporary UUID-like string
 */
const generateTempEventId = () => {
    // Simple UUID v4 generator
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export default {
    getUploadUrl,
    uploadImageToGCS,
    uploadInvitationImage,
    createInvitation,
    getInvitation,
    saveInvitationWithImage
};
