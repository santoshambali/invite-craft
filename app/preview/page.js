'use client';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { toPng } from 'html-to-image';
import Button from '../components/Button';
import Toast from '../components/Toast';
import styles from './page.module.css';

function PreviewContent() {
    const searchParams = useSearchParams();
    const eventId = searchParams.get('id');
    const cardRef = useRef(null);

    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [data, setData] = useState({
        title: '',
        eventType: '',
        date: '',
        time: '',
        location: '',
        theme: '',
        color: '#ffffff',
        category: 'General',
        templateImage: null
    });

    const [loading, setLoading] = useState(true);

    const showToast = (msg, type = 'success') => {
        setToast({ show: true, message: msg, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            let initialData = null;

            // Scenario 1: Editing existing event
            if (eventId) {
                const allEvents = JSON.parse(localStorage.getItem('myEvents') || '[]');
                const found = allEvents.find(e => e.id === eventId);
                if (found) initialData = found;
            }

            // Scenario 2: Creating new from template (fallback)
            if (!initialData) {
                const stored = localStorage.getItem('previewData');
                if (stored) initialData = JSON.parse(stored);
            }

            if (initialData) {
                setTimeout(() => {
                    setData({
                        title: initialData.title || 'Event Title',
                        eventType: initialData.eventType || 'Celebration',
                        date: initialData.date || '',
                        time: initialData.time || '',
                        location: initialData.location || 'Location Here',
                        theme: initialData.theme || '',
                        color: initialData.color || '#ffffff',
                        category: initialData.category || 'General',
                        templateImage: initialData.image || initialData.templateImage || null,
                        id: initialData.id // Keep ID if editing
                    });
                    setLoading(false);
                }, 0);
            } else {
                setTimeout(() => setLoading(false), 0);
            }
        }
    }, [eventId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (typeof window !== 'undefined') {
            const allEvents = JSON.parse(localStorage.getItem('myEvents') || '[]');
            let dateId;

            if (data.id && allEvents.some(e => e.id === data.id)) {
                // Update existing
                const updatedEvents = allEvents.map(e => e.id === data.id ? { ...data, status: 'Draft' } : e);
                localStorage.setItem('myEvents', JSON.stringify(updatedEvents));
                dateId = data.id;
            } else {
                // Create new
                dateId = Date.now().toString();
                const newEvent = { ...data, id: dateId, status: 'Draft' };
                localStorage.setItem('myEvents', JSON.stringify([newEvent, ...allEvents]));
                // Update local state so subsequent saves are updates
                setData(prev => ({ ...prev, id: dateId }));
            }
            showToast('Event Saved Successfully!');
        }
    };

    const handleDownload = async () => {
        if (cardRef.current) {
            try {
                const dataUrl = await toPng(cardRef.current, { quality: 0.95 });
                const link = document.createElement('a');
                link.download = `${data.title || 'invitation'}.png`;
                link.href = dataUrl;
                link.click();
                showToast('Download Started!');
            } catch (err) {
                console.error(err);
                showToast('Failed to download image', 'error');
            }
        }
    };

    if (loading) return <div className={styles.container}>Loading editor...</div>;

    return (
        <div className={styles.container}>
            <Toast visible={toast.show} message={toast.message} type={toast.type} />

            {/* Left: Editor Panel */}
            <div className={styles.editorPanel}>
                <div className={styles.editorHeader}>
                    <div onClick={() => window.location.href = '/'} className={styles.backLink}>
                        ← Back to Dashboard
                    </div>
                    <h1 className={styles.sectionTitle}>
                        {eventId ? 'Edit Invitation' : 'Customize Invitation'}
                    </h1>
                </div>

                <div className={styles.formContent}>
                    <div className={styles.section}>
                        <label className={styles.label}>Event Details</label>
                        <div className={styles.inputGroup}>
                            <input
                                className={styles.input}
                                name="title"
                                placeholder="Event Title"
                                value={data.title}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <input
                                className={styles.input}
                                name="eventType"
                                placeholder="Event Type"
                                value={data.eventType}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className={styles.section}>
                        <label className={styles.label}>Date & Location</label>
                        <div className={styles.inputGroup}>
                            <input
                                className={styles.input}
                                type="date"
                                name="date"
                                value={data.date}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <input
                                className={styles.input}
                                type="time"
                                name="time"
                                value={data.time}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <input
                                className={styles.input}
                                name="location"
                                placeholder="Venue / Address"
                                value={data.location}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Preview Area */}
            <div className={styles.previewArea}>
                <div className={styles.canvas}>
                    {/* The Card - Ref added here */}
                    <div
                        ref={cardRef}
                        className={styles.card}
                        style={{
                            background: data.templateImage
                                ? `url(${data.templateImage}) center/cover no-repeat`
                                : data.color,
                            position: 'relative'
                        }}
                    >
                        {/* Overlay for better text readability when using template image */}
                        {data.templateImage && (
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'rgba(255, 255, 255, 0.85)',
                                zIndex: 0
                            }} />
                        )}

                        <div className={styles.cardContent} style={{ color: '#1a1a1a', position: 'relative', zIndex: 1 }}>
                            <div style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', marginBottom: '3rem', opacity: 0.7 }}>
                                You Are Cordially Invited To
                            </div>

                            <h1 style={{
                                fontFamily: '"Times New Roman", Times, serif',
                                fontSize: '3rem',
                                marginBottom: '1rem',
                                lineHeight: '1.1'
                            }}>
                                {data.title}
                            </h1>

                            <div style={{ fontSize: '1.2rem', margin: 'auto 0 2rem' }}>
                                <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{data.eventType}</p>
                                <hr style={{ width: '50px', border: 'none', borderTop: '2px solid rgba(0,0,0,0.1)', margin: '1rem auto' }} />
                            </div>

                            <div style={{ fontSize: '1.1rem', lineHeight: '1.6' }}>
                                <p>
                                    {data.date ? new Date(data.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Date'}
                                </p>
                                <p>{data.time || 'Time'}</p>
                                <p style={{ marginTop: '1rem' }}>{data.location}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.floatingActions}>
                    <Button variant="secondary" onClick={handleDownload}>
                        Download Image
                    </Button>
                    <Button onClick={handleSave}>
                        {eventId || data.id ? 'Update Invitation' : 'Save Invitation'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function PreviewPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PreviewContent />
        </Suspense>
    );
}
