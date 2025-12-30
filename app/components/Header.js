'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useInvitations } from '../contexts/InvitationContext';
import styles from './Header.module.css';
import CreateOptionsModal from './CreateOptionsModal';
import Spinner from './Spinner';

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const { login, logout, user, isAuthenticated } = useAuth();
    const { invitationCount } = useInvitations();

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Login State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

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

    const handleQuickLogin = async (e) => {
        e.preventDefault();
        if (!username || !password) return;

        setLoginLoading(true);
        try {
            const result = await login({ username, password });
            if (result.success) {
                setUsername('');
                setPassword('');
                // Optional: Redirect if needed, or just let AuthContext update state
            } else {
                alert(result.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An unexpected error occurred.');
        } finally {
            setLoginLoading(false);
        }
    };

    // Get user initials for avatar
    const getUserInitial = () => {
        if (user?.username) {
            return user.username.charAt(0).toUpperCase();
        }
        return 'U';
    };

    // Check if we are on an auth page
    const isAuthPage = pathname === '/login' || pathname === '/register';

    // Pages that have the full purple gradient background (don't need fake header gradient)
    const isGradientPage = pathname === '/' || pathname.startsWith('/share');

    return (
        <header className={`${styles.header} ${!isGradientPage ? styles.headerInner : ''} ${isScrolled ? styles.headerScrolled : ''}`}>
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
                ) : !isAuthenticated ? (
                    /* Guest User Header with Inline Login */
                    <div className={styles.actions}>


                        <form onSubmit={handleQuickLogin} className={styles.loginForm}>
                            <input
                                type="text"
                                placeholder="Username"
                                className={styles.headerInput}
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                className={styles.headerInput}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button type="submit" className={styles.headerLoginBtn} disabled={loginLoading}>
                                {loginLoading ? <Spinner size="small" /> : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                                        <polyline points="10 17 15 12 10 7"></polyline>
                                        <line x1="15" y1="12" x2="3" y2="12"></line>
                                    </svg>
                                )}
                            </button>
                        </form>

                    </div>
                ) : (
                    <>
                        {/* Desktop Navigation */}


                        {/* Actions */}
                        <div className={styles.actions}>
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

            {/* Mobile Menu Overlay */}
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
