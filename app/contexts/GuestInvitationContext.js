'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
    getGuestInvitations,
    saveGuestInvitation,
    updateGuestInvitation,
    deleteGuestInvitation,
    getGuestInvitation
} from '../utils/guestStorage';
import {
    saveInvitationWithImage,
    updateInvitationWithImage,
    deleteInvitation as deleteInvitationAPI
} from '../services/invitationService';

const GuestInvitationContext = createContext(null);

export const useGuestInvitations = () => {
    const context = useContext(GuestInvitationContext);
    if (!context) {
        throw new Error('useGuestInvitations must be used within a GuestInvitationProvider');
    }
    return context;
};

export const GuestInvitationProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [guestInvitations, setGuestInvitations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Load guest invitations from localStorage
    const refreshGuestInvitations = useCallback(() => {
        if (isAuthenticated) {
            // Clear guest invitations when user is authenticated
            setGuestInvitations([]);
            return;
        }

        setIsLoading(true);
        try {
            const invitations = getGuestInvitations();
            setGuestInvitations(invitations);
        } catch (error) {
            console.error('Error loading guest invitations:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        refreshGuestInvitations();
    }, [refreshGuestInvitations]);

    /**
     * Create a new guest invitation via API and save reference locally
     * @param {Object} eventData - Event details
     * @param {string} imageDataUrl - Image data URL
     */
    const createGuestInvitation = useCallback(async (eventData, imageDataUrl) => {
        try {
            setIsLoading(true);

            // Save to API without userId (guest mode)
            const apiResponse = await saveInvitationWithImage(eventData, imageDataUrl, true);

            // Save reference to localStorage
            const saved = saveGuestInvitation(apiResponse);

            if (saved) {
                setGuestInvitations(prev => [...prev, saved]);
            }

            return saved;
        } catch (error) {
            console.error('Error creating guest invitation:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Update an existing guest invitation via API and update local reference
     * @param {string} id - Invitation ID
     * @param {Object} eventData - Updated event details
     * @param {string} imageDataUrl - Updated image data URL
     */
    const updateGuestInvitationById = useCallback(async (id, eventData, imageDataUrl) => {
        try {
            setIsLoading(true);

            // Update via API without userId (guest mode)
            const apiResponse = await updateInvitationWithImage(id, eventData, imageDataUrl, true);

            // Update local reference
            const updated = updateGuestInvitation(id, apiResponse);

            if (updated) {
                setGuestInvitations(prev =>
                    prev.map(inv => inv.id === id ? updated : inv)
                );
            }

            return updated;
        } catch (error) {
            console.error('Error updating guest invitation:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    /**
     * Delete a guest invitation from API and remove local reference
     * @param {string} id - Invitation ID
     */
    const deleteGuestInvitationById = useCallback(async (id) => {
        try {
            setIsLoading(true);

            // Delete from API
            await deleteInvitationAPI(id);

            // Remove local reference
            const success = deleteGuestInvitation(id);

            if (success) {
                setGuestInvitations(prev => prev.filter(inv => inv.id !== id));
            }

            return success;
        } catch (error) {
            console.error('Error deleting guest invitation:', error);
            // Still remove locally even if API call fails
            const success = deleteGuestInvitation(id);
            if (success) {
                setGuestInvitations(prev => prev.filter(inv => inv.id !== id));
            }
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getGuestInvitationById = useCallback((id) => {
        return getGuestInvitation(id);
    }, []);

    const value = {
        guestInvitations,
        guestInvitationCount: guestInvitations.length,
        isLoading,
        refreshGuestInvitations,
        createGuestInvitation,
        updateGuestInvitation: updateGuestInvitationById,
        deleteGuestInvitation: deleteGuestInvitationById,
        getGuestInvitation: getGuestInvitationById,
        setGuestInvitations
    };

    return (
        <GuestInvitationContext.Provider value={value}>
            {children}
        </GuestInvitationContext.Provider>
    );
};

export default GuestInvitationContext;
