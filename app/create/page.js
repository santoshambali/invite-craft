'use client';
import Link from 'next/link';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import styles from './page.module.css';

export default function CreatePage() {
    return (
        <div>
            <Header />
            <div className={styles.container}>
                <div className={styles.content}>
                    <h1 className={styles.heading}>Create Your Invitation</h1>
                    <p className={styles.subheading}>How would you like to start designing?</p>

                    <div className={styles.grid}>
                        <Link href="/create/ai">
                            <Card interactive className={styles.optionCard}>
                                <div className={styles.icon}>✨</div>
                                <h2 className={styles.cardTitle}>Use AI Generation</h2>
                                <p className={styles.cardDesc}>
                                    Just tell us about your event and let our AI craft the perfect invitation for you in seconds.
                                </p>
                                <Button>Generate with AI</Button>
                            </Card>
                        </Link>

                        <Link href="/templates">
                            <Card interactive className={styles.optionCard}>
                                <div className={styles.icon}>🎨</div>
                                <h2 className={styles.cardTitle}>Browse Templates</h2>
                                <p className={styles.cardDesc}>
                                    Explore our curated collection of premium templates and customize them to fit your needs.
                                </p>
                                <Button variant="secondary">View Templates</Button>
                            </Card>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
