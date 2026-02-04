/**
 * Protected Route Component
 * 
 * Wrapper component that protects routes requiring authentication
 * Redirects to login if user is not authenticated
 */

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import Spinner from './Spinner';

export default function ProtectedRoute({ children }) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            // Redirect to login with return URL
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
    }, [isAuthenticated, isLoading, router, pathname]);

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'var(--bg-app)'
            }}>
                <Spinner size="large" text="Loading..." />
            </div>
        );
    }

    // Don't render children if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
