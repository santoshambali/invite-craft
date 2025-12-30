'use client';
import Link from 'next/link';
import Card from './Card';
import Button from './Button';
import styles from './CreateOptionsModal.module.css';

export default function CreateOptionsModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className={styles.closeButton}
                    aria-label="Close modal"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <h1 className={styles.heading}>Create Your Invitation</h1>
                <p className={styles.subheading}>How would you like to start designing?</p>

                <div className={styles.grid}>
                    <Link href="/create/ai" onClick={onClose} style={{ textDecoration: 'none', height: '100%' }}>
                        <Card interactive className={styles.optionCard}>
                            <div className={styles.cardContent}>
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                                    <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962l6.135-1.583A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0l1.581 6.135a2 2 0 0 0 1.437 1.437l6.135 1.583a.5.5 0 0 1 0 .962l-6.135 1.582c-.745.192-1.245.826-1.245 1.582v0" />
                                    <path d="M20 3v4" />
                                    <path d="M22 5h-4" />
                                    <path d="M4 17v2" />
                                    <path d="M5 18H3" />
                                </svg>
                                <h2 className={styles.cardTitle}>Use AI Generation</h2>
                                <p className={styles.cardDesc}>
                                    Just tell us about your event and let our AI craft the perfect invitation for you in seconds.
                                </p>
                                <Button>Generate with AI</Button>
                            </div>
                        </Card>
                    </Link>

                    <Link href="/create/templates" onClick={onClose} style={{ textDecoration: 'none', height: '100%' }}>
                        <Card interactive className={styles.optionCard}>
                            <div className={styles.cardContent}>
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                                    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                                    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                                    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                                    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
                                </svg>
                                <h2 className={styles.cardTitle}>Browse Templates</h2>
                                <p className={styles.cardDesc}>
                                    Explore our curated collection of templates and customize them to fit your needs.
                                </p>
                                <Button>View Templates</Button>
                            </div>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    );
}
