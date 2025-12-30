'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from './Input';
import Button from './Button';
import Toast from './Toast';
import CreateOptionsModal from './CreateOptionsModal';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail, validatePassword, validateUsername } from '../services/authService';
import styles from './GuestLanding.module.css';

export default function GuestLanding() {
    const router = useRouter();
    const { register } = useAuth();
    const [createModalOpen, setCreateModalOpen] = useState(false);

    // Registration State
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({ message: '', visible: false, type: 'success' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const showToast = (message, type) => {
        setToast({ message, visible: true, type });
        setTimeout(() => setToast({ message: '', visible: false, type }), 3000);
    };

    const validateForm = () => {
        const newErrors = {};

        const usernameValidation = validateUsername(formData.username);
        if (!usernameValidation.isValid) {
            newErrors.username = usernameValidation.message;
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Invalid email address';
        }

        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
            newErrors.password = passwordValidation.message;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const result = await register(formData);

            if (result.success) {
                showToast('Account created! Logging you in...', 'success');
                // Allow some time for the toast
                setTimeout(() => {
                    // AuthContext usually handles redirect or state update
                    // but we can force a refresh or let the parent component handle it
                    // Since this component is shown when !isAuthenticated, 
                    // and useAuth will update isAuthenticated to true,
                    // the parent (Dashboard) should automatically Re-render and hide this component.
                }, 1500);
            } else {
                showToast(result.error || 'Registration failed.', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showToast('An unexpected error occurred.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <Toast message={toast.message} visible={toast.visible} type={toast.type} />
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
                            Design stunning invitations with AI or choose from our templates.
                            Start creating now!
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
                        </div>

                        <p className={styles.note}>
                            💡 Create invitations without signing up.
                        </p>
                    </div>

                    <div className={styles.heroVisual}>
                        <div className={styles.floatingCard}>
                            <div className={styles.cardGlow}></div>
                            <div className={styles.regCardContent}>
                                <div className={styles.regHeader}>
                                    <h3>Join LAGU</h3>
                                    <p>Sign up to save your invitations</p>
                                </div>
                                <form onSubmit={handleRegister} className={styles.regForm}>
                                    <div className={styles.nameRow}>
                                        <div className={styles.nameInputWrapper}>
                                            <Input
                                                placeholder="First Name"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                className={styles.compactInput}
                                            />
                                        </div>
                                        <div className={styles.nameInputWrapper}>
                                            <Input
                                                placeholder="Last Name"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                className={styles.compactInput}
                                            />
                                        </div>
                                    </div>
                                    <div className={styles.inputWrapper}>
                                        <Input
                                            placeholder="Username"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            error={!!errors.username}
                                            className={styles.compactInput}
                                        />
                                        {errors.username && <span className={styles.errorLabel}>{errors.username}</span>}
                                    </div>
                                    <div className={styles.inputWrapper}>
                                        <Input
                                            placeholder="Email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            error={!!errors.email}
                                            className={styles.compactInput}
                                        />
                                        {errors.email && <span className={styles.errorLabel}>{errors.email}</span>}
                                    </div>
                                    <div className={styles.inputWrapper}>
                                        <Input
                                            placeholder="Password"
                                            name="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            error={!!errors.password}
                                            className={styles.compactInput}
                                        />
                                        {errors.password && <span className={styles.errorLabel}>{errors.password}</span>}
                                    </div>

                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className={styles.regButton}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Creating Account...' : 'Sign Up Free'}
                                    </Button>
                                </form>
                                <div className={styles.regFooter}>
                                    <p>Already have an account? <Link href="/login" className={styles.loginLink}>Log in</Link></p>
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
                        <h3>Templates</h3>
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
