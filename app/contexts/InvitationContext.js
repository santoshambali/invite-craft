'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getUserInvitations } from '../services/invitationService';

const InvitationContext = createContext(null);

export const useInvitations = () => {
    const context = useContext(InvitationContext);
    if (!context) {
        throw new Error('useInvitations must be used within an InvitationProvider');
    }
    return context;
};

export const InvitationProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth();
    const [invitations, setInvitations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const refreshInvitations = useCallback(async () => {
        if (!isAuthenticated || !user?.userId) {
            setInvitations([]);
            return;
        }

        setIsLoading(true);
        try {
            setError(null);
            const data = await getUserInvitations(user.userId);
            setInvitations(data || []);
        } catch (err) {
            console.error('Failed to fetch invitations:', err);
            setError('Failed to load invitations');
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, user?.userId]);

    useEffect(() => {
        refreshInvitations();
    }, [refreshInvitations]);

    const value = {
        invitations,
        invitationCount: invitations.length,
        isLoading,
        error,
        refreshInvitations,
        setInvitations // Allow manual updates if needed
    };

    return (
        <InvitationContext.Provider value={value}>
            {children}
        </InvitationContext.Provider>
    );
};

export default InvitationContext;
