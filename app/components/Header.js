'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { logout } from '../utils/auth';
import styles from './Header.module.css';

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    const dropdownRef = useRef(null);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle click outside for dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsProfileDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/' },
        { name: 'Templates', path: '/templates' },
        { name: 'Profile', path: '/profile' },
        { name: 'Settings', path: '/settings' },
    ];

    return (
        <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
            <div className={styles.container}>
                {/* Brand */}
                <div className={styles.brand} onClick={() => router.push('/')}>
                    <div className={styles.brandLogo}>L</div>
                    <span className={styles.brandText}>LAGU Invitations</span>
                </div>

                {/* Desktop Navigation */}
                <nav className={styles.navDesktop}>
                    {navItems.map((item) => (
                        <Link key={item.path} href={item.path} style={{ textDecoration: 'none' }}>
                            <div className={`${styles.navItem} ${pathname === item.path ? styles.active : ''}`}>
                                {item.name}
                            </div>
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className={styles.actions}>
                    {/* Create Button (Desktop) */}
                    <Link href="/create" className={styles.createButton}>
                        <span>+</span> New Invitation
                    </Link>

                    {/* Profile Dropdown (Desktop) */}
                    <div className={styles.userMenuWrapper} ref={dropdownRef}>
                        <button
                            className={styles.userAvatarBtn}
                            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                        >
                            U
                        </button>

                        {isProfileDropdownOpen && (
                            <div className={styles.dropdownMenu}>
                                <Link href="/profile" className={styles.dropdownItem}>
                                    👤 Profile
                                </Link>
                                <Link href="/settings" className={styles.dropdownItem}>
                                    ⚙️ Settings
                                </Link>
                                <div className={styles.dropdownDivider} />
                                <div className={`${styles.dropdownItem} ${styles.logoutItem}`} onClick={handleLogout}>
                                    🚪 Logout
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className={`${styles.mobileToggle} ${isMobileMenuOpen ? styles.open : ''}`}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <span className={styles.bar}></span>
                        <span className={styles.bar}></span>
                        <span className={styles.bar}></span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ''}`}>
                {navItems.map((item) => (
                    <Link key={item.path} href={item.path} className={styles.mobileNavLink}>
                        {item.name}
                    </Link>
                ))}
                <div style={{ height: '1px', background: '#f1f5f9', margin: '1rem 0' }}></div>
                <Link href="/create" className={styles.mobileNavLink} style={{ color: 'var(--primary-color)' }}>
                    + New Invitation
                </Link>
                <div className={styles.mobileNavLink} onClick={handleLogout} style={{ color: '#ef4444' }}>
                    Logout
                </div>
            </div>
        </header>
    );
}
