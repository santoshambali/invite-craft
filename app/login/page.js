'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '../components/Input';
import Button from '../components/Button';
import Toast from '../components/Toast';
import { setTokens } from '../utils/auth';
import { buildApiUrl, AUTH } from '../config/api';
import styles from './page.module.css';

export default function Login() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({ message: '', visible: false, type: 'success' });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const showToast = (message, type) => {
        setToast({ message, visible: true, type });
        setTimeout(() => setToast({ ...toast, visible: false }), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(buildApiUrl(AUTH.LOGIN), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                const { accessToken, refreshToken } = data.data;
                setTokens(accessToken, refreshToken);

                showToast('Login successful! Redirecting...', 'success');

                // Redirect after delay
                setTimeout(() => {
                    router.push('/'); // Redirect to dashboard/home
                }, 1500);
            } else {
                const errorMsg = data.message || 'Invalid username or password.';
                showToast(errorMsg, 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showToast('Network error or server unreachable.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <Toast message={toast.message} visible={toast.visible} type={toast.type} />

            <div className={styles.card}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Welcome Back</h1>
                    <p className={styles.subtitle}>Sign in to continue to your dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <Input
                        label="Username"
                        name="username"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={handleChange}
                        required={true}
                    />

                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        required={true}
                    />

                    <Button
                        type="submit"
                        variant="primary"
                        className={styles.submitButton}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                </form>

                <div className={styles.footer}>
                    <p>Don&apos;t have an account? <Link href="/register" className={styles.link}>Create Account</Link></p>
                </div>
            </div>
        </div>
    );
}
