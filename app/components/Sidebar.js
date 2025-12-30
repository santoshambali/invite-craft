'use client';
// components/Sidebar.js
import Link from 'next/link';
import { logout } from '../utils/auth';
import styles from './Sidebar.module.css';

export default function Sidebar() {
    const handleLogout = async () => {
        await logout();
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.brand}>SmartInvite</div>
            <div className={styles.tagline}>Create magical cards</div>

            <nav className={styles.nav}>
                <div className={`${styles.navItem} ${styles.active}`}>
                    <span className={styles.icon}>🏠</span> Dashboard
                </div>
                <Link href="/create/templates" style={{ textDecoration: 'none' }}>
                    <div className={styles.navItem}>
                        <span className={styles.icon}>🎨</span> Templates
                    </div>
                </Link>

                <Link href="/create" style={{ textDecoration: 'none' }}>
                    <button className={styles.createButton}>
                        <span>+</span> New Event
                    </button>
                </Link>
            </nav>

            <div className={styles.bottomNav}>
                <div className={styles.navItem}>
                    <span className={styles.icon}>👤</span> Profile
                </div>
                <div className={styles.navItem}>
                    <span className={styles.icon}>⚙️</span> Settings
                </div>
                <div
                    className={styles.navItem}
                    style={{ color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
                    onClick={handleLogout}
                >
                    <span className={styles.icon}>🚪</span> Logout
                </div>
            </div>
        </aside>
    );
}
