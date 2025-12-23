'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Input from '../components/Input';
import Button from '../components/Button';
import Toast from '../components/Toast';
import { buildApiUrl, USERS } from '../config/api';
import styles from './page.module.css';

export default function Register() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: ''
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
            const response = await fetch(buildApiUrl(USERS.REGISTER), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok && data.status === 'success') {
                showToast('Registration successful! Redirecting...', 'success');
                // Clear form
                setFormData({
                    username: '',
                    email: '',
                    password: '',
                    firstName: '',
                    lastName: ''
                });
                // Redirect after delay
                setTimeout(() => {
                    router.push('/login'); // Assuming /login exists or will exist
                }, 2000);
            } else {
                const errorMsg = data.message || 'Registration failed.';
                showToast(errorMsg, 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
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
                    <h1 className={styles.title}>Create Account</h1>
                    <p className={styles.subtitle}>Join us and start crafting your invitations</p>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.row}>
                        <Input
                            label="First Name"
                            name="firstName"
                            placeholder="John"
                            value={formData.firstName}
                            onChange={handleChange}
                        />
                        <Input
                            label="Last Name"
                            name="lastName"
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={handleChange}
                        />
                    </div>

                    <Input
                        label="Username"
                        name="username"
                        placeholder="johndoe123"
                        value={formData.username}
                        onChange={handleChange}
                        required={true}
                    />

                    <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required={true}
                    />

                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
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
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </Button>
                </form>

                <div className={styles.footer}>
                    <p>Already have an account? <Link href="/login" className={styles.link}>Sign in</Link></p>
                </div>
            </div>
        </div>
    );
}
