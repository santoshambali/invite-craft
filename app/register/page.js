'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import Input from '../components/Input';
import Button from '../components/Button';
import Toast from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail, validatePassword, validateUsername } from '../services/authService';
import Spinner from '../components/Spinner';
import styles from './page.module.css';

export default function Register() {
    const router = useRouter();
    const { register, isAuthenticated } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({ message: '', visible: false, type: 'success' });

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, router]);

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

        // Validate email
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Validate password
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
            newErrors.password = passwordValidation.message;
        }

        // Validate confirm password
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        // Validate first name (optional but if provided, should not be empty)
        if (formData.firstName && formData.firstName.trim().length < 2) {
            newErrors.firstName = 'First name must be at least 2 characters';
        }

        // Validate last name (optional but if provided, should not be empty)
        if (formData.lastName && formData.lastName.trim().length < 2) {
            newErrors.lastName = 'Last name must be at least 2 characters';
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
            // Remove confirmPassword before sending to API
            const { confirmPassword, ...registrationData } = formData;

            const result = await register(registrationData);

            if (result.success) {
                showToast(result.message || 'Registration successful! Redirecting to login...', 'success');

                // Clear form
                setFormData({
                    username: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    firstName: '',
                    lastName: ''
                });

                // Redirect after delay
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                const errorMsg = result.error || 'Registration failed. Please try again.';
                showToast(errorMsg, 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
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
                        <h1 className={styles.title}>Create Account</h1>
                        <p className={styles.subtitle}>Join us and start crafting your invitations</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form} noValidate>
                        <div className={styles.row}>
                            <div>
                                <Input
                                    label="First Name"
                                    name="firstName"
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    autoComplete="given-name"
                                    disabled={isLoading}
                                />
                                {errors.firstName && (
                                    <p className={styles.errorText}>{errors.firstName}</p>
                                )}
                            </div>
                            <div>
                                <Input
                                    label="Last Name"
                                    name="lastName"
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    autoComplete="family-name"
                                    disabled={isLoading}
                                />
                                {errors.lastName && (
                                    <p className={styles.errorText}>{errors.lastName}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Input
                                label="Username"
                                name="username"
                                placeholder="johndoe123"
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
                                label="Email Address"
                                name="email"
                                type="email"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required={true}
                                autoComplete="email"
                                disabled={isLoading}
                            />
                            {errors.email && (
                                <p className={styles.errorText}>{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <Input
                                label="Password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required={true}
                                autoComplete="new-password"
                                disabled={isLoading}
                            />
                            {errors.password && (
                                <p className={styles.errorText}>{errors.password}</p>
                            )}
                        </div>

                        <div>
                            <Input
                                label="Confirm Password"
                                name="confirmPassword"
                                type="password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required={true}
                                autoComplete="new-password"
                                disabled={isLoading}
                            />
                            {errors.confirmPassword && (
                                <p className={styles.errorText}>{errors.confirmPassword}</p>
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
                                    Creating Account...
                                </>
                            ) : (
                                'Sign Up'
                            )}
                        </Button>
                    </form>

                    <div className={styles.footer}>
                        <p>Already have an account? <Link href="/login" className={styles.link}>Sign in</Link></p>
                    </div>
                </div>
            </div>
        </div>
    );
}
