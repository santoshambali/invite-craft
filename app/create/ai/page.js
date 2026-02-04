'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isAuthenticated } from '../../utils/auth';
import { useGuestInvitations } from '../../contexts/GuestInvitationContext';
import {
    generateInvitationImage,
    saveInvitationWithImage,
    updateInvitationWithImage,
    getShareUrl,
    getInvitation,
    getViewUrl
} from '../../services/invitationService';
import Toast from '../../components/Toast';
import ShareModal from '../../components/ShareModal';
import Spinner from '../../components/Spinner';

import styles from './page.module.css';

function AICreatePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const imageRef = useRef(null);
    const isAuth = isAuthenticated();
    const { createGuestInvitation, updateGuestInvitation, getGuestInvitation } = useGuestInvitations();

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
    const [savedInvitation, setSavedInvitation] = useState(null);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareData, setShareData] = useState(null);
    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'success'
    });

    const [formData, setFormData] = useState({
        eventType: '',
        title: '',
        date: '',
        time: '',
        location: '',
        description: '',
        designStyle: ''
    });

    const eventTypes = [
        { id: 'party', label: 'Party', icon: '🎉' },
        { id: 'birthday', label: 'Birthday', icon: '🎂' },
        { id: 'corporate', label: 'Corporate', icon: '💼' },
        { id: 'celebration', label: 'Celebration', icon: '🎊' },
        { id: 'conference', label: 'Conference', icon: '📊' }
    ];

    const designStyles = [
        { id: 'formal', label: 'Formal', description: 'Elegant and professional' },
        { id: 'casual', label: 'Casual', description: 'Relaxed and friendly' },
        { id: 'modern', label: 'Modern', description: 'Clean and contemporary' },
        { id: 'vintage', label: 'Vintage', description: 'Classic and timeless' }
    ];

    const showToast = (msg, type = 'success') => {
        setToast({ show: true, message: msg, type });
        setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
    };

    const lastLoadedIdRef = useRef(null);

    // Fetch existing invitation if editing
    useEffect(() => {
        const fetchInvitation = async () => {
            if (!id) return;

            // Skip if already loaded this ID
            if (lastLoadedIdRef.current === id) return;

            setLoading(true);
            try {
                let invitation;

                if (isAuth) {
                    invitation = await getInvitation(id);
                } else {
                    invitation = getGuestInvitation(id);
                }

                if (!invitation) {
                    showToast('Invitation not found', 'error');
                    router.push('/');
                    return;
                }

                // Format date and time for inputs
                let formattedDate = '';
                if (invitation.date) {
                    const d = new Date(invitation.date);
                    if (!isNaN(d.getTime())) {
                        formattedDate = d.toISOString().split('T')[0];
                    }
                }

                let formattedTime = '';
                if (invitation.time) {
                    // Assuming time comes as HH:mm:ss or similar
                    formattedTime = invitation.time.substring(0, 5);
                }

                setFormData({
                    eventType: invitation.eventType || '',
                    title: invitation.title || '',
                    date: formattedDate,
                    time: formattedTime,
                    location: invitation.location || '',
                    description: invitation.description || '', // Note: description might not be persisted by backend yet
                    designStyle: invitation.designStyle || 'modern' // Default fallback
                });

                // Handle Image
                if (invitation.imageUrl) {
                    try {
                        let url = invitation.imageUrl;
                        // Determine if we need a signed view URL
                        // Simple heuristic: if it looks like a gs path or simple filename
                        if (!url.startsWith('http')) {
                            url = await getViewUrl(url);
                        } else if (url.includes('storage.googleapis.com') && !url.includes('X-Goog-Signature')) {
                            // Assuming we might need to refresh it, but let's try direct first.
                            const filename = url.split('/').pop();
                            try {
                                const signedUrl = await getViewUrl(filename);
                                url = signedUrl;
                            } catch (e) {
                                // fallback to original url
                            }
                        }
                        setGeneratedImageUrl(url);
                    } catch (e) {
                        console.error("Error getting view URL", e);
                        setGeneratedImageUrl(invitation.imageUrl);
                    }
                }

                setSavedInvitation(invitation);
                lastLoadedIdRef.current = invitation.id || id;

            } catch (error) {
                console.error('Error fetching invitation:', error);
                showToast('Failed to load invitation details', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchInvitation();
    }, [id, isAuth]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEventTypeSelect = (type) => {
        setFormData({ ...formData, eventType: type });
    };

    const handleDesignStyleSelect = (style) => {
        setFormData({ ...formData, designStyle: style });
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Generate AI invitation image
            const imageUrl = await generateInvitationImage({
                event_type: formData.eventType,
                title: formData.title,
                date: formData.date,
                time: formData.time,
                location: formData.location,
                description: formData.description,
                style: formData.designStyle
            });

            setGeneratedImageUrl(imageUrl);
            showToast('Card generated successfully!');
        } catch (error) {
            console.error('Error generating invitation:', error);
            showToast('Failed to generate card. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!generatedImageUrl) {
            showToast('Please generate a card first', 'warning');
            return;
        }

        setSaving(true);
        try {
            // Convert the image URL to a data URL
            let imageDataUrl;

            try {
                // Fetch the image via proxy and convert to data URL
                const proxiedUrl = `/api/proxy-image?url=${encodeURIComponent(generatedImageUrl)}`;
                const response = await fetch(proxiedUrl);
                const blob = await response.blob();

                // Convert blob to data URL
                imageDataUrl = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            } catch (fetchError) {
                console.error('Error fetching image:', fetchError);
                // If fetch fails, try using the URL directly
                imageDataUrl = generatedImageUrl;
            }

            const eventData = {
                ...formData,
                templateId: 'ai-generated',
                category: 'ai',
                eventType: formData.eventType
            };

            let result;

            if (savedInvitation?.id) {
                // Update existing invitation
                if (isAuth) {
                    result = await updateInvitationWithImage(
                        savedInvitation.id,
                        eventData,
                        imageDataUrl
                    );
                } else {
                    result = await updateGuestInvitation(
                        savedInvitation.id,
                        eventData,
                        imageDataUrl
                    );
                }
                showToast('Card updated successfully!');
            } else {
                // Save new invitation
                if (isAuth) {
                    result = await saveInvitationWithImage(eventData, imageDataUrl);
                } else {
                    result = await createGuestInvitation(eventData, imageDataUrl);
                }
                showToast('Card saved successfully!');
            }

            setSavedInvitation(result);

        } catch (error) {
            console.error('Error saving invitation:', error);

            // Check if error is due to authentication requirement
            if (error.message.includes('Authentication required') || error.message.includes('Unauthorized')) {
                // Show friendly message for guest users
                const shouldLogin = window.confirm(
                    '🔐 Guest Mode Notice\n\n' +
                    'To save cards, you need to sign in or create an account.\n\n' +
                    'Would you like to sign in now?\n\n' +
                    '(Your card details will be saved and you can continue after signing in)'
                );

                if (shouldLogin) {
                    // Save current state to sessionStorage
                    if (typeof window !== 'undefined') {
                        sessionStorage.setItem('pendingInvitation', JSON.stringify({
                            formData,
                            generatedImageUrl,
                            returnUrl: '/create/ai'
                        }));
                    }
                    router.push('/login');
                    return;
                }

                showToast('Please sign in to save cards', 'warning');
            } else {
                showToast(error.message || 'Failed to save card. Please try again.', 'error');
            }
        } finally {
            setSaving(false);
        }
    };

    const [downloadFormat, setDownloadFormat] = useState('png');

    const handleDownload = async () => {
        if (!generatedImageUrl) {
            showToast('Please generate a card first', 'warning');
            return;
        }

        try {
            showToast(`Preparing ${downloadFormat.toUpperCase()}...`, "success");

            // If user wants original format and it's png, we can just use proxy-download
            // But to be consistent with format selection, we use canvas conversion
            const proxiedUrl = `/api/proxy-image?url=${encodeURIComponent(generatedImageUrl)}`;
            const response = await fetch(proxiedUrl);
            const blob = await response.blob();

            const img = new Image();
            img.crossOrigin = "anonymous";
            const imageUrl = URL.createObjectURL(blob);

            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = imageUrl;
            });

            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const mimeType = downloadFormat === 'jpeg' ? 'image/jpeg' : 'image/png';
            const convertedDataUrl = canvas.toDataURL(mimeType, 0.95);

            // Sanitized filename
            let fileName = (formData.title || 'card').toString()
                .replace(/[/\\?%*:|"<>]/g, '-')
                .trim();

            if (!fileName || /^[0-9a-f-]{36}$/i.test(fileName)) {
                fileName = 'card';
            }

            const link = document.createElement('a');
            link.href = convertedDataUrl;
            link.download = `${fileName}.${downloadFormat === 'jpeg' ? 'jpg' : 'png'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(imageUrl);
            showToast('Download started!');
        } catch (error) {
            console.error('Download error:', error);
            const filename = `${formData.title || 'card'}.png`;
            window.open(`/api/proxy-download?url=${encodeURIComponent(generatedImageUrl)}&filename=${encodeURIComponent(filename)}`, '_blank');
            showToast('Fallback download started', 'success');
        }
    };

    const handleShare = async () => {
        if (!savedInvitation?.id) {
            showToast('Please save the card first before sharing', 'warning');
            return;
        }

        try {
            const shareUrlData = await getShareUrl(savedInvitation.id);
            setShareData(shareUrlData);
            setShareModalOpen(true);
        } catch (error) {
            console.error('Error getting share URL:', error);
            showToast('Failed to get share link. Please try again.', 'error');
        }
    };

    return (
        <div className={styles.mainLayout}>

            <div className={styles.container}>
                <Toast visible={toast.show} message={toast.message} type={toast.type} />

                {/* Share Modal */}
                {shareData && (
                    <ShareModal
                        isOpen={shareModalOpen}
                        onClose={() => setShareModalOpen(false)}
                        shareUrl={shareData.shareUrl}
                        title={shareData.title}
                        invitationId={shareData.invitationId}
                    />
                )}

                <div className={styles.formWrapper}>
                    <div className={styles.splitLayout}>
                        <form onSubmit={handleGenerate} className={styles.form}>
                            {/* Header moved inside scrollable form */}
                            <div className={styles.header}>
                                <h1 className={styles.title}>AI Card Generator</h1>
                                <p className={styles.subtitle}>Create beautiful card images in seconds</p>
                            </div>

                            {/* Invitation Details Section */}
                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <span className={styles.sectionIcon}>✨</span>
                                    <h2 className={styles.sectionTitle}>Card Details</h2>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        <span className={styles.labelIcon}>📝</span>
                                        Event Title
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        placeholder="e.g., Summer Garden Party"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className={styles.input}
                                        required
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        <span className={styles.labelIcon}>📅</span>
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        <span className={styles.labelIcon}>🕐</span>
                                        Time
                                    </label>
                                    <input
                                        type="time"
                                        name="time"
                                        value={formData.time}
                                        onChange={handleChange}
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>
                                        <span className={styles.labelIcon}>📍</span>
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        placeholder="e.g., 123 Garden Street, Springfield"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Description</label>
                                    <textarea
                                        name="description"
                                        placeholder="Add any additional details about the event..."
                                        value={formData.description}
                                        onChange={handleChange}
                                        className={styles.textarea}
                                        rows="3"
                                    />
                                </div>
                            </div>

                            {/* Event Type Section */}
                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <h2 className={styles.sectionTitle}>Event Type</h2>
                                </div>
                                <div className={styles.eventTypeGrid}>
                                    {eventTypes.map((type) => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => handleEventTypeSelect(type.id)}
                                            className={`${styles.eventTypeCard} ${formData.eventType === type.id ? styles.selected : ''
                                                }`}
                                        >
                                            <span className={styles.eventTypeIcon}>{type.icon}</span>
                                            <span className={styles.eventTypeLabel}>{type.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Design Style Section */}
                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <span className={styles.sectionIcon}>🎨</span>
                                    <h2 className={styles.sectionTitle}>Design Style</h2>
                                </div>
                                <div className={styles.designStyleGrid}>
                                    {designStyles.map((style) => (
                                        <button
                                            key={style.id}
                                            type="button"
                                            onClick={() => handleDesignStyleSelect(style.id)}
                                            className={`${styles.designStyleCard} ${formData.designStyle === style.id ? styles.selected : ''
                                                }`}
                                        >
                                            <div className={styles.designStyleContent}>
                                                <h3 className={styles.designStyleLabel}>{style.label}</h3>
                                                <p className={styles.designStyleDescription}>{style.description}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Generate Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={styles.generateButton}
                            >
                                <span className={styles.buttonIcon}>✨</span>
                                {loading ? (
                                    <>
                                        <Spinner size="small" />
                                        <span>Generating Card...</span>
                                    </>
                                ) : 'Generate Card'}
                            </button>
                        </form>

                        {/* Preview Section */}
                        <div className={styles.previewSection}>
                            <h2 className={styles.previewTitle}>Preview</h2>
                            <div className={styles.previewBox}>
                                {loading ? (
                                    <div className={styles.loadingState}>
                                        <Spinner size="large" text="Creating your masterpiece..." />
                                    </div>
                                ) : generatedImageUrl ? (
                                    <img
                                        ref={imageRef}
                                        src={generatedImageUrl}
                                        alt="Generated Card"
                                        className={styles.previewImage}
                                    />
                                ) : (
                                    <div className={styles.previewPlaceholder}>
                                        <span className={styles.placeholderIcon}>⭐</span>
                                        <p className={styles.placeholderText}>Your card will appear here</p>
                                        <p className={styles.placeholderSubtext}>Fill in the details and click generate</p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons - Show only when invitation is generated */}
                            {generatedImageUrl && (
                                <div className={styles.actionButtons}>
                                    <div style={{ display: 'flex', background: 'white', borderRadius: '12px', padding: '0 0.75rem', border: '1px solid #e2e8f0', alignItems: 'center' }}>
                                        <select
                                            value={downloadFormat}
                                            onChange={(e) => setDownloadFormat(e.target.value)}
                                            style={{ border: 'none', background: 'transparent', fontSize: '0.85rem', fontWeight: '600', color: '#6366f1', outline: 'none', cursor: 'pointer', padding: '0.5rem' }}
                                        >
                                            <option value="png">PNG</option>
                                            <option value="jpeg">JPG</option>
                                        </select>
                                    </div>
                                    <button
                                        onClick={handleDownload}
                                        className={styles.actionButton}
                                        type="button"
                                    >
                                        <span className={styles.actionIcon}>⬇️</span>
                                        Download
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className={styles.actionButton}
                                        disabled={!savedInvitation}
                                        type="button"
                                    >
                                        <span className={styles.actionIcon}>📤</span>
                                        Share
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className={`${styles.actionButton} ${styles.primaryAction}`}
                                        disabled={saving}
                                        type="button"
                                    >
                                        <span className={styles.actionIcon}>💾</span>
                                        {saving ? (
                                            <>
                                                <Spinner size="small" style={{ borderTopColor: 'white' }} />
                                                <span>Saving...</span>
                                            </>
                                        ) : savedInvitation ? 'Update' : 'Save'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AICreatePage() {
    return (
        <Suspense fallback={<div className={styles.container}><Spinner fullPage text="Loading editor..." /></div>}>
            <AICreatePageContent />
        </Suspense>
    );
}
