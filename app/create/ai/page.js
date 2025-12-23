'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import styles from './page.module.css';

export default function AICreatePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        eventType: '',
        title: '',
        date: '',
        location: '',
        theme: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        // Mimic API delay
        setTimeout(() => {
            // In a real app, we'd pass this data to an API
            // For now, we'll store in localStorage to pass to preview
            if (typeof window !== 'undefined') {
                localStorage.setItem('previewData', JSON.stringify({
                    ...formData,
                    isAI: true,
                    // Mocking a generated design ID or content
                    designId: 'ai-generated-' + Date.now()
                }));
            }
            router.push('/preview');
        }, 1500);
    };

    return (
        <div className={styles.container}>
            <Card className={styles.formCard}>
                <h1 className={styles.heading}>Describe Your Event</h1>
                <form onSubmit={handleSubmit}>
                    <Input
                        label="Event Type"
                        name="eventType"
                        placeholder="Birthday, Wedding, etc."
                        value={formData.eventType}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Invitation Title"
                        name="title"
                        placeholder="Sarah's 30th Birthday Bash"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Date & Time"
                        name="date"
                        type="datetime-local"
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Location"
                        name="location"
                        placeholder="123 Party Lane, Fun City"
                        value={formData.location}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Theme / Vibe"
                        name="theme"
                        placeholder="Elegant, Tropical, Cyberpunk..."
                        value={formData.theme}
                        onChange={handleChange}
                    />

                    <div className={styles.actions}>
                        <Button type="submit">
                            {loading ? 'Generating...' : 'Generate Invitation ✨'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
