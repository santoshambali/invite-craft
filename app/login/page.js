'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

import Input from '../components/Input';
import Button from '../components/Button';
import Toast from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { validateUsername } from '../services/authService';
import Spinner from '../components/Spinner';
import styles from './page.module.css';

export default function Login() {
    return (
        <Suspense fallback={<div className={styles.container}><Spinner fullPage text="Loading..." /></div>}>
            <LoginForm />
        </Suspense>
    );
}

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, isAuthenticated } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({ message: '', visible: false, type: 'success' });

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            const redirect = searchParams.get('redirect') || '/';
            router.push(redirect);
        }
    }, [isAuthenticated, router, searchParams]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for this field when user starts typing
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

        // Validate username
        const usernameValidation = validateUsername(formData.username);
        if (!usernameValidation.isValid) {
            newErrors.username = usernameValidation.message;
        }

        // Validate password
        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 3) {
            newErrors.password = 'Password is too short';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form
        if (!validateForm()) {
            showToast('Please fix the errors in the form', 'error');
            return;
        }

        setIsLoading(true);

        try {
            // Create a copy of credentials for submission
            const credentials = {
                username: formData.username,
                password: formData.password
            };

            // Clear form data immediately for security
            setFormData({ username: '', password: '' });

            const result = await login(credentials);

            // Clear credentials from memory
            credentials.username = '';
            credentials.password = '';

            if (result.success) {
                showToast(result.message || 'Login successful! Redirecting...', 'success');

                // Redirect after delay
                setTimeout(() => {
                    const redirect = searchParams.get('redirect') || '/';
                    router.push(redirect);
                }, 1000);
            } else {
                const errorMsg = result.error || 'Invalid username or password.';
                showToast(errorMsg, 'error');
                // Restore username on error (but not password)
                setFormData(prev => ({ ...prev, username: credentials.username }));
            }
        } catch (error) {
            console.error('Login error:', error);
            showToast('An unexpected error occurred. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            <div className={styles.container}>
                <Toast message={toast.message} visible={toast.visible} type={toast.type} />

                <div className={styles.card}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Welcome Back</h1>
                        <p className={styles.subtitle}>Sign in to continue to your dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form} noValidate>
                        <div>
                            <Input
                                label="Username"
                                name="username"
                                placeholder="Enter your username"
                                value={formData.username}
                                onChange={handleChange}
                                required={true}
                                autoComplete="username"
                                disabled={isLoading}
                            />
                            {errors.username && (
                                <p className={styles.errorText}>{errors.username}</p>
                            )}
                        </div>

                        <div>
                            <Input
                                label="Password"
                                name="password"
                                type="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                                required={true}
                                autoComplete="current-password"
                                disabled={isLoading}
                            />
                            {errors.password && (
                                <p className={styles.errorText}>{errors.password}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            className={styles.submitButton}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Spinner size="small" />
                                    Signing In...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>

                    <div className={styles.footer}>
                        <p>Don&apos;t have an account? <Link href="/register" className={styles.link}>Create Account</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
