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
    const [totalInvitationCount, setTotalInvitationCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState(null);

    const refreshInvitations = useCallback(async () => {
        if (!isAuthenticated || !user?.userId) {
            setInvitations([]);
            setTotalInvitationCount(0);
            setCurrentPage(0);
            setHasMore(false);
            return;
        }

        setIsLoading(true);
        try {
            setError(null);
            const result = await getUserInvitations(user.userId, 0); // Start from page 0

            // Handle new response format with pagination metadata
            if (result && typeof result === 'object' && 'invitations' in result) {
                setInvitations(result.invitations || []);
                setTotalInvitationCount(result.totalItems || 0);
                setCurrentPage(result.currentPage || 0);
                setHasMore(result.hasMore || false);
            } else {
                // Fallback for backward compatibility
                setInvitations(result || []);
                setTotalInvitationCount(result?.length || 0);
                setCurrentPage(0);
                setHasMore(false);
            }
        } catch (err) {
            console.error('Failed to fetch invitations:', err);
            setError('Failed to load invitations');
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, user?.userId]);

    const loadMoreInvitations = useCallback(async () => {
        if (!isAuthenticated || !user?.userId || !hasMore || isLoadingMore) {
            return;
        }

        setIsLoadingMore(true);
        try {
            setError(null);
            const nextPage = currentPage + 1; // Increment from current 0-indexed page
            const result = await getUserInvitations(user.userId, nextPage);

            // Handle new response format with pagination metadata
            if (result && typeof result === 'object' && 'invitations' in result) {
                setInvitations(prev => [...prev, ...(result.invitations || [])]);
                setCurrentPage(result.currentPage || nextPage);
                setHasMore(result.hasMore || false);
            }
        } catch (err) {
            console.error('Failed to load more invitations:', err);
            setError('Failed to load more invitations');
        } finally {
            setIsLoadingMore(false);
        }
    }, [isAuthenticated, user?.userId, currentPage, hasMore, isLoadingMore]);

    useEffect(() => {
        refreshInvitations();
    }, [refreshInvitations]);

    const value = {
        invitations,
        invitationCount: invitations.length,
        totalInvitationCount, // Total count from API (may differ from invitations.length if paginated)
        currentPage,
        hasMore,
        isLoading,
        isLoadingMore,
        error,
        refreshInvitations,
        loadMoreInvitations,
        setInvitations // Allow manual updates if needed
    };

    return (
        <InvitationContext.Provider value={value}>
            {children}
        </InvitationContext.Provider>
    );
};

export default InvitationContext;
