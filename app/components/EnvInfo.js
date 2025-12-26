'use client';

import { useEffect, useState } from 'react';
import { API_BASE_URL, INVITATION_API_BASE_URL } from '../config/api';

/**
 * Environment Info Component
 * Displays current API configuration for debugging
 * Only visible in development mode
 */
export default function EnvInfo() {
    const [mounted, setMounted] = useState(false);
    const [runtimeEnv, setRuntimeEnv] = useState(null);

    useEffect(() => {
        setMounted(true);
        // Access window.__ENV__ after component mounts
        if (typeof window !== 'undefined' && window.__ENV__) {
            setRuntimeEnv(window.__ENV__);
        }
    }, []);

    // Only show in development
    if (process.env.NODE_ENV === 'production') {
        return null;
    }

    if (!mounted) {
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#00ff00',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '12px',
            fontFamily: 'monospace',
            maxWidth: '400px',
            zIndex: 9999,
            border: '1px solid #00ff00'
        }}>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                🔧 Environment Configuration
            </div>
            <div style={{ marginBottom: '3px' }}>
                <strong>API Base URL:</strong> {API_BASE_URL}
            </div>
            <div style={{ marginBottom: '3px' }}>
                <strong>Invitation API:</strong> {INVITATION_API_BASE_URL}
            </div>
            {runtimeEnv && (
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #00ff00' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '3px' }}>
                        Runtime Config (window.__ENV__):
                    </div>
                    <pre style={{ margin: 0, fontSize: '10px' }}>
                        {JSON.stringify(runtimeEnv, null, 2)}
                    </pre>
                </div>
            )}
            <div style={{ marginTop: '8px', fontSize: '10px', opacity: 0.7 }}>
                💡 This panel only shows in development mode
            </div>
        </div>
    );
}
