'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { logout } from '../utils/auth';
import styles from './Header.module.css';

export default function Header() {
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <header className={styles.header}>
            <div className={styles.brand} onClick={() => router.push('/')}>
                InviteCraft
            </div>

            <nav className={styles.nav}>
                <Link href="/" style={{ textDecoration: 'none' }}>
                    <div className={`${styles.navItem} ${styles.active}`}>
                        Dashboard
                    </div>
                </Link>
                <Link href="/templates" style={{ textDecoration: 'none' }}>
                    <div className={styles.navItem}>
                        Templates
                    </div>
                </Link>
                <Link href="/profile" style={{ textDecoration: 'none' }}>
                    <div className={styles.navItem}>
                        Profile
                    </div>
                </Link>
                <Link href="/settings" style={{ textDecoration: 'none' }}>
                    <div className={styles.navItem}>
                        Settings
                    </div>
                </Link>
            </nav>

            <div className={styles.actions}>
                <Link href="/create" style={{ textDecoration: 'none' }}>
                    <button className={styles.createButton}>
                        <span>+</span> New Invitation
                    </button>
                </Link>

                <div
                    className={`${styles.navItem} ${styles.logoutBtn}`}
                    onClick={handleLogout}
                    title="Logout"
                >
                    🚪
                </div>
            </div>
        </header>
    );
}
