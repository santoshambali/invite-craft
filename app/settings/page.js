'use client';
import Header from '../components/Header';

export default function SettingsPage() {
    return (
        <div>
            <Header />
            <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '1rem' }}>Settings</h1>
                <p style={{ color: '#64748b' }}>System settings are coming soon.</p>
            </div>
        </div>
    );
}
