/* app/utils/guestStorage.js */

/**
 * Guest Storage Utility
 * Manages invitations for non-authenticated users using localStorage
 * Guest invitations are saved to the API (without userId) and referenced locally
 */

const GUEST_INVITATIONS_KEY = 'guest_invitations';

/**
 * Get all guest invitations from localStorage
 */
export const getGuestInvitations = () => {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(GUEST_INVITATIONS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Error reading guest invitations:', error);
        return [];
    }
};

/**
 * Save a guest invitation reference to localStorage
 * The actual invitation is saved via API, this just stores the reference
 * @param {Object} invitation - Invitation object from API response
 */
export const saveGuestInvitation = (invitation) => {
    if (typeof window === 'undefined') return null;

    try {
        const invitations = getGuestInvitations();
        const newInvitation = {
            ...invitation,
            isGuest: true,
            savedAt: new Date().toISOString()
        };

        invitations.push(newInvitation);
        localStorage.setItem(GUEST_INVITATIONS_KEY, JSON.stringify(invitations));

        return newInvitation;
    } catch (error) {
        console.error('Error saving guest invitation:', error);
        return null;
    }
};

/**
 * Update a guest invitation in localStorage
 * @param {string} id - Invitation ID from API
 * @param {Object} updates - Updated invitation data
 */
export const updateGuestInvitation = (id, updates) => {
    if (typeof window === 'undefined') return null;

    try {
        const invitations = getGuestInvitations();
        const index = invitations.findIndex(inv => inv.id === id);

        if (index === -1) return null;

        invitations[index] = {
            ...invitations[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem(GUEST_INVITATIONS_KEY, JSON.stringify(invitations));
        return invitations[index];
    } catch (error) {
        console.error('Error updating guest invitation:', error);
        return null;
    }
};

/**
 * Delete a guest invitation from localStorage
 * Note: This only removes the local reference, not the API data
 * @param {string} id - Invitation ID
 */
export const deleteGuestInvitation = (id) => {
    if (typeof window === 'undefined') return false;

    try {
        const invitations = getGuestInvitations();
        const filtered = invitations.filter(inv => inv.id !== id);
        localStorage.setItem(GUEST_INVITATIONS_KEY, JSON.stringify(filtered));
        return true;
    } catch (error) {
        console.error('Error deleting guest invitation:', error);
        return false;
    }
};

/**
 * Get a single guest invitation by ID
 * @param {string} id - Invitation ID
 */
export const getGuestInvitation = (id) => {
    if (typeof window === 'undefined') return null;

    try {
        const invitations = getGuestInvitations();
        return invitations.find(inv => inv.id === id) || null;
    } catch (error) {
        console.error('Error getting guest invitation:', error);
        return null;
    }
};

/**
 * Clear all guest invitations from localStorage
 */
export const clearGuestInvitations = () => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem(GUEST_INVITATIONS_KEY);
    } catch (error) {
        console.error('Error clearing guest invitations:', error);
    }
};

/**
 * Check if an invitation ID belongs to a guest
 * @param {string} id - Invitation ID
 */
export const isGuestInvitation = (id) => {
    const invitation = getGuestInvitation(id);
    return invitation !== null;
};

export default {
    getGuestInvitations,
    saveGuestInvitation,
    updateGuestInvitation,
    deleteGuestInvitation,
    getGuestInvitation,
    clearGuestInvitations,
    isGuestInvitation
};
