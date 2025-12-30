'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateOptionsModal from '../components/CreateOptionsModal';
import styles from './GuestLanding.module.css';

export default function GuestLanding() {
    const router = useRouter();
    const [createModalOpen, setCreateModalOpen] = useState(false);

    return (
        <div className={styles.container}>
            <CreateOptionsModal
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
            />

            <main className={styles.main}>
                <div className={styles.hero}>
                    <div className={styles.heroContent}>
                        <h1 className={styles.title}>
                            Create Beautiful Invitations
                            <span className={styles.titleGradient}> Instantly</span>
                        </h1>
                        <p className={styles.subtitle}>
                            Design stunning invitations with AI or choose from our premium templates.
                            No login required to get started!
                        </p>

                        <div className={styles.ctaButtons}>
                            <button
                                className={styles.primaryButton}
                                onClick={() => setCreateModalOpen(true)}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962l6.135-1.583A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0l1.581 6.135a2 2 0 0 0 1.437 1.437l6.135 1.583a.5.5 0 0 1 0 .962l-6.135 1.582c-.745.192-1.245.826-1.245 1.582v0" />
                                </svg>
                                Create Invitation
                            </button>

                            <button
                                className={styles.secondaryButton}
                                onClick={() => router.push('/login')}
                            >
                                Sign In
                            </button>
                        </div>

                        <p className={styles.note}>
                            💡 Create invitations without signing up. Your work is saved locally in your browser.
                        </p>
                    </div>

                    <div className={styles.heroVisual}>
                        <div className={styles.floatingCard}>
                            <div className={styles.cardGlow}></div>
                            <div className={styles.cardContent}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.cardIcon}>🎉</div>
                                    <h3>Birthday Party</h3>
                                </div>
                                <div className={styles.cardDetails}>
                                    <p>📅 December 31, 2025</p>
                                    <p>🕐 7:00 PM</p>
                                    <p>📍 Grand Ballroom</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.features}>
                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>✨</div>
                        <h3>AI-Powered Design</h3>
                        <p>Let AI create stunning invitations based on your event details</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>🎨</div>
                        <h3>Premium Templates</h3>
                        <p>Choose from beautifully crafted templates for any occasion</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>📤</div>
                        <h3>Easy Sharing</h3>
                        <p>Share your invitations instantly via link or social media</p>
                    </div>

                    <div className={styles.featureCard}>
                        <div className={styles.featureIcon}>💾</div>
                        <h3>No Login Required</h3>
                        <p>Start creating immediately, save to account later if you want</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
