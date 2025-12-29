'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import Header from '../../components/Header';
import styles from './page.module.css';

export default function AICreatePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');
    const imageRef = useRef(null);
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
        { id: 'party', label: 'Party', icon: '🎊' },
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

    // Fetch existing invitation if editing
    useEffect(() => {
        const fetchInvitation = async () => {
            if (!id) return;

            setLoading(true);
            try {
                const invitation = await getInvitation(id);

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
                            // Actually dashboard logic extracts filename and calls getViewUrl.
                            // Let's replicate dashboard logic if safe.
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

            } catch (error) {
                console.error('Error fetching invitation:', error);
                showToast('Failed to load invitation details', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchInvitation();
    }, [id]);

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
            showToast('Invitation generated successfully!');
        } catch (error) {
            console.error('Error generating invitation:', error);
            showToast('Failed to generate invitation. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!generatedImageUrl) {
            showToast('Please generate an invitation first', 'warning');
            return;
        }

        setSaving(true);
        try {
            // Convert the image URL to a data URL
            let imageDataUrl;

            try {
                // Fetch the image and convert to data URL
                const response = await fetch(generatedImageUrl);
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

            let result;

            if (savedInvitation?.id) {
                // Update existing invitation
                result = await updateInvitationWithImage(
                    savedInvitation.id,
                    {
                        ...formData,
                        templateId: 'ai-generated',
                        category: 'ai',
                        eventType: formData.eventType
                    },
                    imageDataUrl
                );
                showToast('Invitation updated successfully!');
            } else {
                // Save new invitation
                result = await saveInvitationWithImage(
                    {
                        ...formData,
                        templateId: 'ai-generated',
                        category: 'ai',
                        eventType: formData.eventType
                    },
                    imageDataUrl
                );
                showToast('Invitation saved successfully!');
            }

            setSavedInvitation(result);

            // Also save to localStorage for backward compatibility
            if (typeof window !== 'undefined') {
                const allEvents = JSON.parse(localStorage.getItem('myEvents') || '[]');
                const savedEvent = {
                    ...formData,
                    id: result.id || Date.now().toString(),
                    invitationId: result.id,
                    imageUrl: result.imageUrl,
                    status: result.status || 'Draft',
                    createdAt: result.createdAt || new Date().toISOString(),
                    templateId: 'ai-generated',
                    category: 'ai'
                };

                const existingIndex = allEvents.findIndex(e => e.id === savedEvent.id);
                if (existingIndex >= 0) {
                    // Update existing
                    allEvents[existingIndex] = savedEvent;
                } else {
                    // Create new
                    allEvents.unshift(savedEvent);
                }
                localStorage.setItem('myEvents', JSON.stringify(allEvents));
            }
        } catch (error) {
            console.error('Error saving invitation:', error);
            showToast(error.message || 'Failed to save invitation. Please try again.', 'error');

            // Fallback to localStorage-only save
            if (typeof window !== 'undefined') {
                const allEvents = JSON.parse(localStorage.getItem('myEvents') || '[]');
                const dateId = Date.now().toString();
                const newEvent = {
                    ...formData,
                    id: dateId,
                    status: 'Draft',
                    templateId: 'ai-generated',
                    category: 'ai',
                    imageUrl: generatedImageUrl
                };
                allEvents.unshift(newEvent);
                localStorage.setItem('myEvents', JSON.stringify(allEvents));
                setSavedInvitation({ id: dateId });
                showToast('Saved locally (offline mode)', 'warning');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDownload = async () => {
        if (!generatedImageUrl) {
            showToast('Please generate an invitation first', 'warning');
            return;
        }

        try {
            // Create a temporary link to download the image
            const link = document.createElement('a');
            link.href = generatedImageUrl;
            link.download = `${formData.title || 'invitation'}.png`;

            // For cross-origin images, we need to fetch and convert to blob
            const response = await fetch(generatedImageUrl);
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);

            link.href = blobUrl;
            link.click();

            // Clean up
            URL.revokeObjectURL(blobUrl);
            showToast('Download started!');
        } catch (error) {
            console.error('Error downloading image:', error);
            showToast('Failed to download image', 'error');
        }
    };

    const handleShare = async () => {
        if (!savedInvitation?.id) {
            showToast('Please save the invitation first before sharing', 'warning');
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
            <Header />
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
                                <h1 className={styles.title}>AI Invitation Generator</h1>
                                <p className={styles.subtitle}>Create beautiful invitation images in seconds</p>
                            </div>

                            {/* Invitation Details Section */}
                            <div className={styles.section}>
                                <div className={styles.sectionHeader}>
                                    <span className={styles.sectionIcon}>✨</span>
                                    <h2 className={styles.sectionTitle}>Invitation Details</h2>
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
                                        required
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
                                        required
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
                                        required
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
                                {loading ? 'Generating Invitation...' : 'Generate Invitation'}
                            </button>
                        </form>

                        {/* Preview Section */}
                        <div className={styles.previewSection}>
                            <h2 className={styles.previewTitle}>Preview</h2>
                            <div className={styles.previewBox}>
                                {generatedImageUrl ? (
                                    <img
                                        ref={imageRef}
                                        src={generatedImageUrl}
                                        alt="Generated Invitation"
                                        className={styles.previewImage}
                                    />
                                ) : (
                                    <div className={styles.previewPlaceholder}>
                                        <span className={styles.placeholderIcon}>⭐</span>
                                        <p className={styles.placeholderText}>Your invitation will appear here</p>
                                        <p className={styles.placeholderSubtext}>Fill in the details and click generate</p>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons - Show only when invitation is generated */}
                            {generatedImageUrl && (
                                <div className={styles.actionButtons}>
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
                                        {saving ? 'Saving...' : savedInvitation ? 'Update' : 'Save'}
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
