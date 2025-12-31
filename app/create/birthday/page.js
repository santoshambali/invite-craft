"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import Button from "../../components/Button";
import Toast from "../../components/Toast";
import ShareModal from "../../components/ShareModal";
import { getInvitation, getViewUrl, getShareUrl } from "../../services/invitationService";
import Spinner from "../../components/Spinner";
import styles from "./page.module.css";

// Helper to proxy URLs for canvas capture
const getProxiedUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('data:') || url.startsWith('/')) return url;
    return `/api/proxy-image?url=${encodeURIComponent(url)}`;
};

// Theme configurations
const THEMES = [
    {
        id: 'space',
        name: 'Space Explorer',
        color: '#0f172a',
        font: "'Courier New', Courier, monospace",
        accent: '#818cf8',
        bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        textColor: '#ffffff'
    },
    {
        id: 'garden',
        name: 'Garden Party',
        color: '#f0fdf4',
        font: "'Times New Roman', serif",
        accent: '#4ade80',
        bg: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
    },
    {
        id: 'royal',
        name: 'Royal Gold',
        color: '#fffbeb',
        font: "serif",
        accent: '#d97706',
        bg: 'radial-gradient(circle, #fffbeb 0%, #fef3c7 100%)'
    },
    {
        id: 'modern',
        name: 'Bold Modern',
        color: '#ffffff',
        font: "'Inter', sans-serif",
        accent: '#000000',
        bg: '#ffffff'
    },
    {
        id: 'unicorn',
        name: 'Magic Rainbow',
        color: '#ffffff',
        font: "'Verdana', sans-serif",
        accent: '#c084fc',
        bg: 'linear-gradient(to bottom right, #eff6ff, #f3e8ff, #fce7f3)'
    },
    {
        id: 'premium_abstract',
        name: 'Abstract',
        color: '#ffffff',
        font: "'Inter', sans-serif",
        accent: '#6366f1',
        bg: 'url(/templates/modern_birthday_bg.png) center/cover no-repeat'
    }
];

function BirthdayEditorContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const eventId = searchParams.get("id");
    const cardRef = useRef(null);

    // States
    const [toast, setToast] = useState({ show: false, message: "", type: "success" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareData, setShareData] = useState(null);

    const [selectedThemeId, setSelectedThemeId] = useState('space');

    const [data, setData] = useState({
        title: "",
        eventType: "",
        date: "",
        time: "",
        location: "",
        description: "",
        theme: "",
        category: "Birthday",
        templateImage: null,
    });

    const showToast = (msg, type = "success") => {
        setToast({ show: true, message: msg, type });
        setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
    };

    const currentTheme = THEMES.find(t => t.id === selectedThemeId) || THEMES[0];

    useEffect(() => {
        const loadData = async () => {
            if (typeof window !== "undefined") {
                let initialData = null;

                // Load existing invitation
                if (eventId) {
                    try {
                        const invitation = await getInvitation(eventId);
                        if (invitation) {
                            let templateImage = null;
                            if (invitation.imageUrl) {
                                // Try to load image if available
                                templateImage = invitation.imageUrl;
                            }

                            initialData = {
                                ...invitation,
                                templateImage
                            };

                            // Try to infer theme from saved data if stored in specific field, else default
                            // For now simpler to default or strict logic if we saved themeId
                        }
                    } catch (err) {
                        console.error("Fetch error:", err);
                    }
                }

                if (!initialData) {
                    const stored = localStorage.getItem("previewData");
                    if (stored) initialData = JSON.parse(stored);
                }

                if (initialData) {
                    setData(prev => ({
                        ...prev,
                        title: initialData.title || "",
                        eventType: initialData.eventType || "",
                        date: initialData.date || "",
                        time: initialData.time || "",
                        location: initialData.location || "",
                        description: initialData.description || "",
                        templateImage: initialData.image || initialData.templateImage || null,
                        id: initialData.id,
                        eventId: initialData.eventId,
                    }));
                }
                setLoading(false);
            }
        };
        loadData();
    }, [eventId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!cardRef.current) return;
        setSaving(true);
        try {
            const dataUrl = await toPng(cardRef.current, { quality: 0.95 });
            const { saveInvitationWithImage, updateInvitationWithImage } =
                await import("../../services/invitationService");

            const eventData = {
                ...data,
                eventId: data.eventId || data.id,
                templateId: `birthday-${selectedThemeId}`,
            };

            const isUpdate = data.invitationId || data.id;
            let result;

            if (isUpdate) {
                result = await updateInvitationWithImage(data.invitationId || data.id, eventData, dataUrl);
            } else {
                result = await saveInvitationWithImage(eventData, dataUrl);
            }

            showToast("Invitation saved successfully!");

            // Redirect to preview page to show final result with share/download options
            if (result && result.id) {
                router.push(`/preview?id=${result.id}`);
            }
        } catch (error) {
            console.error(error);
            showToast("Failed to save.", "error");
        } finally {
            setSaving(false);
        }
    };

    const [downloadFormat, setDownloadFormat] = useState('png');

    const handleDownload = async () => {
        if (!cardRef.current) return;

        try {
            showToast(`Preparing ${downloadFormat.toUpperCase()}...`, "success");
            let dataUrl;
            if (downloadFormat === 'jpeg') {
                const { toJpeg } = await import("html-to-image");
                dataUrl = await toJpeg(cardRef.current, { quality: 0.95, pixelRatio: 2, bgcolor: '#ffffff' });
            } else {
                dataUrl = await toPng(cardRef.current, { quality: 0.95, pixelRatio: 2 });
            }

            // Sanitized filename
            let fileName = (data.title || 'birthday-invite').toString()
                .replace(/[/\\?%*:|"<>]/g, '-')
                .trim();

            if (!fileName || /^[0-9a-f-]{36}$/i.test(fileName)) {
                fileName = 'birthday-invite';
            }

            const link = document.createElement("a");
            link.download = `${fileName}.${downloadFormat === 'jpeg' ? 'jpg' : 'png'}`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Download error:", err);
            showToast("Failed to download image", "error");
        }
    };

    if (loading) return <div className={styles.container}><Spinner fullPage text="Loading..." /></div>;

    return (
        <div className={styles.container}>
            <Toast visible={toast.show} message={toast.message} type={toast.type} />

            {/* Background decoration */}
            <div style={{
                position: 'fixed',
                top: '-20%',
                right: '-10%',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)',
                pointerEvents: 'none',
                zIndex: 0
            }} />

            {/* Editor Panel */}
            <div className={styles.editorPanel}>
                <div className={styles.editorHeader}>
                    <div onClick={() => router.push('/templates')} className={styles.backLink}>
                        <span style={{ fontSize: '1.2em' }}>‹</span> Back
                    </div>
                    <h1 className={styles.sectionTitle}>
                        Design Party!
                    </h1>
                    <p className={styles.sectionSubtitle}>Customize the perfect birthday card.</p>
                </div>

                <div className={styles.formContent}>

                    {/* Theme Selector Removed as per request */}

                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionIcon}>🎉</div>
                            <span className={styles.label}>Event Details</span>
                        </div>
                        <div className={styles.inputGroup}>
                            <span className={styles.inputLabel}>Headline</span>
                            <input
                                className={styles.input}
                                name="title"
                                placeholder="Sarah's Birthday"
                                value={data.title}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <span className={styles.inputLabel}>Sub-headline</span>
                            <input
                                className={styles.input}
                                name="eventType"
                                placeholder="Join us for cake!"
                                value={data.eventType}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <div className={styles.sectionIcon}>🕒</div>
                            <span className={styles.label}>Time & Place</span>
                        </div>
                        <div className={styles.inputGroup}>
                            <span className={styles.inputLabel}>When</span>
                            <input
                                className={styles.input}
                                type="date"
                                name="date"
                                value={data.date}
                                onChange={handleChange}
                            />
                            <input
                                className={styles.input}
                                type="time"
                                name="time"
                                value={data.time}
                                onChange={handleChange}
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <span className={styles.inputLabel}>Where</span>
                            <input
                                className={styles.input}
                                name="location"
                                placeholder="123 Party Lane, Fun City"
                                value={data.location}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionIcon}>📝</div>
                        <span className={styles.label}>Message</span>
                    </div>
                    <div className={styles.inputGroup}>
                        <textarea
                            className={styles.input}
                            name="description"
                            placeholder="Add a personal message..."
                            value={data.description}
                            onChange={handleChange}
                            rows={3}
                            style={{ resize: 'vertical' }}
                        />
                    </div>
                </div>
            </div>

            {/* Preview Area */}
            <div className={styles.previewArea}>
                <div className={styles.canvas}>
                    <div
                        ref={cardRef}
                        className={styles.card}
                        style={{
                            background: data.templateImage
                                ? `url(${getProxiedUrl(data.templateImage)}) center/cover no-repeat`
                                : currentTheme.bg,
                            color: currentTheme.textColor || '#1a1a1a',
                            fontFamily: currentTheme.font
                        }}
                    >
                        {/* Decorative overlay for some themes could go here */}

                        <div className={styles.cardContent}>
                            {/* Header Decoration */}
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                                🎈
                            </div>

                            <div style={{
                                textTransform: "uppercase",
                                letterSpacing: "3px",
                                fontSize: "0.9rem",
                                marginBottom: "3rem",
                                opacity: 0.7,
                                fontWeight: 600
                            }}>
                                {data.eventType}
                            </div>

                            <h1 style={{
                                fontSize: "3.5rem",
                                marginBottom: "1.5rem",
                                lineHeight: "1.1",
                                color: currentTheme.textColor ? 'currentColor' : currentTheme.accent,
                                textShadow: currentTheme.id === 'space' ? '0 0 10px rgba(129, 140, 248, 0.5)' : 'none'
                            }}>
                                {data.title}
                            </h1>

                            <div style={{
                                width: "60px",
                                height: "4px",
                                background: currentTheme.textColor ? 'currentColor' : currentTheme.accent,
                                margin: "0 auto 3rem",
                                borderRadius: "2px",
                                opacity: 0.5
                            }} />

                            <div style={{
                                fontSize: "1.2rem",
                                lineHeight: "1.8",
                                background: currentTheme.id === 'space' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)',
                                padding: "2rem",
                                borderRadius: "1.5rem",
                                backdropFilter: "blur(4px)"
                            }}>
                                {data.date && <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                    {new Date(data.date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                                </p>}
                                {data.time && <p style={{ marginBottom: '1rem' }}>
                                    {data.time}
                                </p>}
                                {data.location && <p style={{ opacity: 0.9 }}>📍 {data.location}</p>}
                                {data.description && <p style={{ marginTop: '1rem', fontStyle: 'italic', fontSize: '0.9em' }}>{data.description}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.floatingActions}>
                    <div style={{ display: 'flex', background: 'white', borderRadius: '99px', padding: '0 1rem', border: '1px solid #e2e8f0', alignItems: 'center', marginRight: '-1rem', zIndex: 1 }}>
                        <select
                            value={downloadFormat}
                            onChange={(e) => setDownloadFormat(e.target.value)}
                            style={{ border: 'none', background: 'transparent', fontSize: '0.9rem', fontWeight: '600', color: '#6366f1', outline: 'none', cursor: 'pointer', padding: '0.5rem' }}
                        >
                            <option value="png">PNG</option>
                            <option value="jpeg">JPG</option>
                        </select>
                    </div>
                    <Button variant="secondary" onClick={handleDownload} style={{ borderRadius: '99px', paddingLeft: '2rem' }}>
                        ↓ Download
                    </Button>
                    <Button onClick={handleSave} disabled={saving} style={{ borderRadius: '99px', paddingLeft: '2rem', paddingRight: '2rem' }}>
                        {saving ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Spinner size="small" />
                                <span>Saving...</span>
                            </div>
                        ) : "Save Invitation"}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function BirthdayPage() {
    return (
        <Suspense fallback={<div className={styles.container}><Spinner fullPage text="Loading..." /></div>}>
            <BirthdayEditorContent />
        </Suspense>
    );
}
