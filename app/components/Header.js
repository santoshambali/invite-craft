'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './Header.module.css';
import CreateOptionsModal from './CreateOptionsModal';

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const { logout, user, isAuthenticated } = useAuth();

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

    // Close mobile menu and modals on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsCreateModalOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        await logout();
    };

    // Get user initials for avatar
    const getUserInitial = () => {
        if (user?.username) {
            return user.username.charAt(0).toUpperCase();
        }
        return 'U';
    };

    const navItems = [];

    // Check if we are on an auth page
    const isAuthPage = pathname === '/login' || pathname === '/register';

    return (
        <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
            <div className={styles.container}>
                {/* Brand */}
                <div className={styles.brand} onClick={() => router.push('/')}>
                    <div className={styles.brandLogo}>L</div>
                    <span className={styles.brandText}>LAGU Invitations</span>
                </div>

                {/* Simplified Header for Auth Pages */}
                {isAuthPage ? (
                    <div className={styles.actions}>
                        {pathname === '/login' ? (
                            <Link href="/register" className={styles.createButton} style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', boxShadow: 'none' }}>
                                Create Account
                            </Link>
                        ) : (
                            <Link href="/login" className={styles.createButton} style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', boxShadow: 'none' }}>
                                Sign In
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Desktop Navigation */}


                        {/* Actions */}
                        <div className={styles.actions}>
                            {/* Create Button (Desktop) */}


                            {/* Profile Dropdown (Desktop) */}
                            {isAuthenticated && (
                                <div className={styles.userMenuWrapper} ref={dropdownRef}>
                                    <button
                                        className={styles.userAvatarBtn}
                                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                        aria-label="User menu"
                                    >
                                        {getUserInitial()}
                                    </button>

                                    {isProfileDropdownOpen && (
                                        <div className={styles.dropdownMenu}>
                                            {user?.username && (
                                                <>
                                                    <div className={styles.dropdownHeader}>
                                                        <p className={styles.dropdownUsername}>@{user.username}</p>
                                                    </div>
                                                    <div className={styles.dropdownDivider} />
                                                </>
                                            )}
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
                            )}

                            {/* Mobile Menu Toggle */}
                            <button
                                className={`${styles.mobileToggle} ${isMobileMenuOpen ? styles.open : ''}`}
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                aria-label="Toggle mobile menu"
                            >
                                <span className={styles.bar}></span>
                                <span className={styles.bar}></span>
                                <span className={styles.bar}></span>
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Mobile Menu Overlay - Only for non-auth pages */}
            {!isAuthPage && (
                <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ''}`}>

                    {isAuthenticated && (
                        <div className={styles.mobileNavLink} onClick={handleLogout} style={{ color: '#ef4444' }}>
                            Logout
                        </div>
                    )}
                </div>
            )}

            <CreateOptionsModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
        </header>
    );
}
