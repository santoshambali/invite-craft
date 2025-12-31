"use client";
import { useEffect, useState, useRef, Suspense, useLayoutEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { toPng } from "html-to-image";
import Toast from "../components/Toast";
import ShareModal from "../components/ShareModal";
import { getInvitation, getViewUrl, getShareUrl } from "../services/invitationService";
import { useInvitations } from "../contexts/InvitationContext";
import { TEMPLATES } from "../config/templates";
import Spinner from "../components/Spinner";
import styles from "./page.module.css";

// Helper function to get placeholders based on template category
const getPlaceholders = (category) => {
  const placeholders = {
    birthday: {
      title: "e.g. Sarah's 5th Birthday Party",
      eventType: "e.g. Birthday Celebration",
      location: "e.g. 123 Party Lane, Fun City",
      description: "Join us for cake, games, and fun!"
    },
    wedding: {
      title: "e.g. Emma & James Wedding",
      eventType: "e.g. Wedding Ceremony",
      location: "e.g. Garden Rose Chapel, Springfield",
      description: "Join us as we celebrate our special day..."
    },
    party: {
      title: "e.g. Summer Garden Party",
      eventType: "e.g. Garden Party",
      location: "e.g. Backyard Garden, 456 Green St",
      description: "Come celebrate with food, music, and dancing!"
    },
    'new-year': {
      title: "e.g. Midnight Sparkle Gala",
      eventType: "e.g. New Year's Eve Party",
      location: "e.g. Sky Lounge, City Heights",
      description: "Let's toast to the new year! Join us for a night of music, dancing, and memories."
    },
    announcement: {
      title: "e.g. Big News Announcement",
      eventType: "e.g. Special Announcement",
      location: "e.g. Conference Hall, Main Street",
      description: "We have exciting news to share with you..."
    },
    professional: {
      title: "e.g. Annual Team Meeting 2025",
      eventType: "e.g. Corporate Meeting",
      location: "e.g. Conference Room A, Office Tower",
      description: "Quarterly review and planning session"
    },
    default: {
      title: "e.g. My Special Event",
      eventType: "e.g. Celebration",
      location: "e.g. Venue Name, Address",
      description: "Add a personal message or details..."
    }
  };

  return placeholders[category] || placeholders.default;
};

// Helper to get default event type value
const getDefaultEventType = (category) => {
  switch (category?.toLowerCase()) {
    case 'birthday': return 'Birthday Party';
    case 'wedding': return 'Wedding';
    case 'new-year': return 'New Year Celebration';
    case 'party': return 'Party';
    case 'professional': return 'Professional Event';
    case 'announcement': return 'Announcement';
    default: return '';
  }
};

// Helper to proxy URLs
const getProxiedUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('/')) return url;
  return `/api/proxy-image?url=${encodeURIComponent(url)}`;
};

function PreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("id");
  const cardRef = useRef(null);
  const containerRef = useRef(null);
  const { invitations, refreshInvitations } = useInvitations();

  const [activeTab, setActiveTab] = useState('edit'); // 'edit' or 'preview'
  const [scale, setScale] = useState(1);
  const [isGenerated, setIsGenerated] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [data, setData] = useState({
    title: "",
    eventType: "",
    date: "",
    time: "",
    location: "",
    description: "",
    theme: "",
    color: "#ffffff",
    category: "General",
    templateImage: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle dynamic scaling of the business card
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;

      const parent = containerRef.current;
      // Account for larger padding in new modern design and providing breathing room
      const availableWidth = parent.clientWidth - 96;
      const availableHeight = parent.clientHeight - 96;

      // Card natural dimensions: 480 x 680
      const scaleX = availableWidth / 480;
      const scaleY = availableHeight / 680;

      // Scale to fit, but max 1.05 to avoid blurring too much
      let newScale = Math.min(scaleX, scaleY, 1.05);

      // Ensure it doesn't get too small ridiculously, but fitting is priority
      if (newScale < 0.3) newScale = 0.3;

      setScale(newScale);
    };

    window.addEventListener('resize', handleResize);
    // Initial calculation
    const timer = setTimeout(handleResize, 100);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [activeTab, mounted]); // Recalculate when tab changes or mounted

  const showToast = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        let initialData = null;

        // Scenario 1: Editing existing invitation from backend or context
        if (eventId) {
          // Check context first to avoid network call
          const found = invitations.find(i => i.id === eventId);
          if (found) {
            initialData = found;
          } else {
            // Fetch from backend
            try {
              const invitation = await getInvitation(eventId);
              if (invitation) {
                // Get signed URL for the image if it exists
                let templateImage = null;
                if (invitation.imageUrl) {
                  try {
                    const filename = invitation.imageUrl.split("/").pop();
                    templateImage = await getViewUrl(filename);
                  } catch (err) {
                    console.error("Failed to get view URL:", err);
                    templateImage = invitation.imageUrl;
                  }
                }

                initialData = {
                  id: invitation.id,
                  eventId: invitation.eventId,
                  title: invitation.title,
                  eventType: invitation.eventType,
                  date: invitation.date,
                  time: invitation.time,
                  location: invitation.location,
                  description: invitation.description,
                  templateId: invitation.templateId,
                  category: invitation.templateId, // Will be corrected below
                  templateImage: templateImage,
                  imageUrl: invitation.imageUrl,
                };
              }
            } catch (err) {
              console.error("Failed to fetch invitation", err);
            }
          }
        }

        // Re-hydrate config and category from TEMPLATES if missing
        if (initialData && initialData.templateId) {
          const template = TEMPLATES.find(t => t.id === initialData.templateId);
          if (template) {
            if (!initialData.config) {
              initialData.config = template.config;
            }
            // Use the original template image for background, not the composite image
            initialData.templateImage = template.image;

            // Ensure category is correct (e.g. 'birthday' instead of 'birthday-modern')
            if (!initialData.category || initialData.category === initialData.templateId) {
              initialData.category = template.category;
            }
          }
        }

        // Scenario 2: Load local cache for potentially non-persisted fields (like description)
        const stored = localStorage.getItem("previewData");
        const localData = stored ? JSON.parse(stored) : null;

        // Merge API data with local cache if they match or if API data is missing fields
        if (initialData && localData) {
          // If the template matches, we can safely merge fields that might be missing in API
          if (initialData.templateId === localData.templateId) {
            initialData = {
              ...localData,
              ...initialData,
              // Favor local description if API version is empty/null
              description: initialData.description || localData.description || ""
            };
          }
        } else if (!initialData && localData) {
          initialData = localData;
        }

        if (initialData) {
          // Pre-fill eventType if empty using helper
          if (!initialData.eventType && initialData.category) {
            initialData.eventType = getDefaultEventType(initialData.category);
          }

          setData({
            title: initialData.title || "",
            eventType: initialData.eventType || "",
            date: initialData.date || "",
            time: initialData.time || "",
            location: initialData.location || "",
            description: initialData.description || "",
            templateId: initialData.templateId || "",
            templateImage: initialData.templateImage || initialData.image || "",
            // Provide defaults for config-related fields
            category: initialData.category || "default",
            color: initialData.color || initialData.config?.color || "#000000",
            config: initialData.config || null,
            // Keep original IDs
            id: initialData.id,
            eventId: initialData.eventId,
          });

          setIsGenerated(initialData.templateId === 'ai-generated');
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [eventId, invitations]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTemplateChange = (template) => {
    setData(prev => ({
      ...prev,
      templateId: template.id,
      templateImage: template.image,
      config: template.config,
      color: template.config?.color || prev.color
    }));
    // Also update localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("previewData");
      if (stored) {
        const localData = JSON.parse(stored);
        localStorage.setItem("previewData", JSON.stringify({
          ...localData,
          templateId: template.id,
          config: template.config
        }));
      }
    }
    showToast(`Switched to ${template.name}`);
  };

  const handleSave = async () => {
    if (!cardRef.current) {
      showToast("Unable to generate invitation image", "error");
      return;
    }

    try {
      // Temporarily reset scale for clear image generation if needed, 
      // but toPng usually handles visual state. 
      // It's often safer to capture at 1.0 scale.
      const currentScale = scale;
      // We might need to trick it if we were scaling via transform.
      // But html-to-image is smart. Let's see. 
      // Ideally we capture the element as is but at high res.
      // The current transform might affect it. 
      // Let's try capturing with the current transform, it should be fine as it's just visual scaling.

      const dataUrl = await toPng(cardRef.current, { quality: 0.95, pixelRatio: 2 });
      setSaving(true);

      const { saveInvitationWithImage, updateInvitationWithImage } =
        await import("../services/invitationService");

      const eventData = {
        ...data,
        eventId: data.eventId || data.id,
        templateId: data.templateId || data.category || "custom",
      };

      const isUpdate = data.invitationId || data.id;
      let result;

      if (isUpdate) {
        result = await updateInvitationWithImage(
          data.invitationId || data.id,
          eventData,
          dataUrl
        );
      } else {
        result = await saveInvitationWithImage(eventData, dataUrl);
      }

      if (typeof window !== "undefined") {
        const allEvents = JSON.parse(localStorage.getItem("myEvents") || "[]");
        const savedEvent = {
          ...data,
          id: result.id || data.id || Date.now().toString(),
          invitationId: result.id,
          imageUrl: result.imageUrl,
          status: result.status || "Draft",
          createdAt: result.createdAt || new Date().toISOString(),
        };

        if (data.id && allEvents.some((e) => e.id === data.id)) {
          const updatedEvents = allEvents.map((e) =>
            e.id === data.id ? savedEvent : e
          );
          localStorage.setItem("myEvents", JSON.stringify(updatedEvents));
          // Also update previewData to ensure fields like description are preserved on reload
          localStorage.setItem("previewData", JSON.stringify(eventData));
        } else {
          localStorage.setItem("myEvents", JSON.stringify([savedEvent, ...allEvents]));
          // Also update previewData to ensure fields like description are preserved on reload
          localStorage.setItem("previewData", JSON.stringify(eventData));

          setData((prev) => ({
            ...prev,
            id: savedEvent.id,
            invitationId: result.id,
          }));
        }
      }

      refreshInvitations();
      showToast("Card saved successfully!");
      setJustSaved(true);

      // If this was a new invitation (no eventId in URL), update URL to include the new ID
      if (!eventId && result.id) {
        router.replace(`/preview?id=${result.id}`, { scroll: false });
      }
    } catch (error) {
      console.error("Error saving invitation:", error);
      showToast(
        error.message || "Failed to save card. Try again.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const [downloadFormat, setDownloadFormat] = useState('png'); // 'png' or 'jpeg'

  const handleDownload = async () => {
    if (cardRef.current) {
      try {
        showToast(`Preparing ${downloadFormat.toUpperCase()}...`);
        let dataUrl;
        if (downloadFormat === 'jpeg') {
          const { toJpeg } = await import("html-to-image");
          dataUrl = await toJpeg(cardRef.current, { quality: 0.95, pixelRatio: 2, bgcolor: '#ffffff' });
        } else {
          dataUrl = await toPng(cardRef.current, { quality: 0.95, pixelRatio: 2 });
        }

        // Sanitized filename
        let fileName = (data.title || 'invitation').toString()
          .replace(/[/\\?%*:|"<>]/g, '-')
          .trim();

        if (!fileName || /^[0-9a-f-]{36}$/i.test(fileName)) {
          fileName = 'invitation';
        }

        const link = document.createElement("a");
        link.download = `${fileName}.${downloadFormat === 'jpeg' ? 'jpg' : 'png'}`;
        link.href = dataUrl;
        link.click();
        showToast("Download Started!");
      } catch (err) {
        console.error(err);
        showToast("Failed to download image", "error");
      }
    }
  };

  const handleShare = async () => {
    const invitationId = data.invitationId || data.id;
    if (!invitationId) {
      showToast("Please save the card first before sharing", "warning");
      return;
    }

    try {
      const shareUrlData = await getShareUrl(invitationId);
      setShareData(shareUrlData);
      setShareModalOpen(true);
    } catch (error) {
      console.error("Error getting share URL:", error);
      showToast("Failed to get share link. Please try again.", "error");
    }
  };

  if (loading) return <div className={styles.container}><Spinner fullPage text="Loading card..." /></div>;

  // Get placeholders based on template category
  const placeholders = getPlaceholders(data.category?.toLowerCase() || 'default');

  return (
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

      <div className={styles.mainContent}>
        <div className={styles.editorWrapper}>
          <div className={styles.splitLayout}>

            {/* Left: Editor Panel */}
            <div className={`${styles.editorPanel} ${activeTab === 'edit' ? styles.active : ''}`}>
              <div className={styles.formContent}>
                <div className={styles.header}>
                  <h1 className={styles.title}>Customize Card</h1>
                  <p className={styles.subtitle}>Personalize your event details below</p>
                </div>
                {isGenerated && (
                  <div className={styles.aiNotice}>
                    <div className={styles.aiIcon}>✨</div>
                    <div className={styles.aiText}>
                      <h3>AI Generated Card</h3>
                      <p>This card was created using AI. To change the design or details, please use the AI Generator.</p>
                      <button
                        className={styles.editInAiBtn}
                        onClick={() => router.push(`/create/ai?id=${eventId}`)}
                      >
                        Edit in AI Generator
                      </button>
                    </div>
                  </div>
                )}

                {!isGenerated && justSaved && (
                  <div className={styles.saveSuccessMessage}>
                    <div className={styles.successIcon}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                    <div className={styles.successText}>
                      <h3>Saved Successfully!</h3>
                      <p>Your card is ready to be shared.</p>
                    </div>
                    <button
                      className={styles.dismissButton}
                      onClick={() => setJustSaved(false)}
                    >
                      Continue Editing
                    </button>
                  </div>
                )}

                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.label}>Event Details</span>
                    <div className={styles.separator} />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Event Title</label>
                    <input
                      className={styles.input}
                      name="title"
                      placeholder={placeholders.title}
                      value={data.title}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Event Type</label>
                    <input
                      className={styles.input}
                      name="eventType"
                      placeholder={placeholders.eventType}
                      value={data.eventType}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Message</label>
                    <textarea
                      className={styles.input}
                      name="description"
                      placeholder={placeholders.description}
                      value={data.description}
                      onChange={handleChange}
                      rows={4}
                      style={{ minHeight: '100px', resize: 'vertical' }}
                    />
                  </div>
                </div>

                <div className={styles.section}>
                  <div className={styles.sectionHeader}>
                    <span className={styles.label}>When & Where</span>
                    <div className={styles.separator} />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Date</label>
                    <input
                      className={styles.input}
                      type="date"
                      name="date"
                      value={data.date}
                      onChange={handleChange}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Time</label>
                    <input
                      className={styles.input}
                      type="time"
                      name="time"
                      value={data.time}
                      onChange={handleChange}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Location</label>
                    <input
                      className={styles.input}
                      name="location"
                      placeholder={placeholders.location}
                      value={data.location}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {!isGenerated && (
                  <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                      <span className={styles.label}>Change Theme</span>
                      <div className={styles.separator} />
                    </div>
                    <div className={styles.templateSwitcher}>
                      {TEMPLATES.filter(t => t.category === data.category).map(t => (
                        <div
                          key={t.id}
                          className={`${styles.templateOption} ${data.templateId === t.id ? styles.selectedTemplate : ''}`}
                          onClick={() => handleTemplateChange(t)}
                          title={t.name}
                        >
                          <div
                            className={styles.templateThumb}
                            style={{ backgroundImage: `url(${t.image})` }}
                          />
                          <span className={styles.templateLabel}>{t.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Preview Area */}
            <div
              className={`${styles.previewArea} ${activeTab === 'preview' ? styles.active : ''}`}
            >
              <h2 className={styles.previewTitle}>Preview</h2>
              <div ref={containerRef} className={styles.previewBox}>
                <div className={styles.previewWrapper}>
                  <div
                    className={styles.canvas}
                    style={{
                      transform: `scale(${scale})`,
                      transformOrigin: 'top center',
                      width: '480px',
                      height: '680px',
                      flexShrink: 0,
                      marginBottom: `-${680 * (1 - scale)}px`
                    }}
                  >
                    {/* The Card - Ref added here */}
                    <div
                      ref={cardRef}
                      className={styles.card}
                      style={{
                        background: data.templateImage
                          ? `url(${getProxiedUrl(data.templateImage)}) center/cover no-repeat`
                          : (data.config?.background || data.color),

                        color: data.config?.color || "#1a1a1a",
                        fontFamily: data.config?.fontFamily || '"Times New Roman", Times, serif',
                        textAlign: data.config?.textAlign || 'center',
                        position: "relative",
                        display: 'flex',
                        flexDirection: 'column',
                        ...data.config?.layout?.container
                      }}
                    >
                      {/* Overlay for better text readability */}
                      {data.templateImage && !data.config && !isGenerated && (
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "rgba(255, 255, 255, 0.85)",
                            zIndex: 0,
                          }}
                        />
                      )}

                      {!isGenerated && (
                        <div
                          className={styles.cardContent}
                          style={{
                            position: "relative",
                            zIndex: 1,
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            ...data.config?.layout?.content
                          }}
                        >
                          <div style={{ flex: 1 }}></div>
                          {/* Event Type */}
                          <div
                            style={{
                              textTransform: "uppercase",
                              letterSpacing: "3px",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              opacity: 0.7,
                              marginBottom: '1.5rem',
                              ...data.config?.layout?.eventType
                            }}
                          >
                            {data.eventType}
                          </div>

                          {/* Title */}
                          <h1
                            style={{
                              fontSize: "3.5rem",
                              lineHeight: "1.05",
                              fontWeight: "400",
                              marginBottom: "1.5rem",
                              letterSpacing: "-0.02em",
                              ...data.config?.layout?.title
                            }}
                          >
                            {data.title}
                          </h1>

                          {/* Divider */}
                          {!data.config && (
                            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                              <div style={{ width: '40px', height: '1px', background: 'currentColor', opacity: 0.3 }}></div>
                            </div>
                          )}

                          {/* Details Section */}
                          <div style={{
                            fontSize: "1.1rem",
                            lineHeight: "1.8",
                            fontWeight: "300",
                            ...data.config?.layout?.details
                          }}>
                            {mounted && data.date && (
                              <p style={{ fontWeight: '500', fontSize: '1.2rem', marginBottom: '0.25rem' }}>
                                {new Date(data.date).toLocaleDateString(undefined, {
                                  weekday: "long",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                            )}
                            {data.time && <p style={{ opacity: 0.8 }}>{data.time}</p>}

                            {data.location && (
                              <p style={{ marginTop: "1rem", fontWeight: "500" }}>
                                📍 {data.location}
                              </p>
                            )}

                            {data.description && (
                              <div style={{ marginTop: "2rem", fontSize: "0.95em", opacity: 0.85, whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                {data.description}
                              </div>
                            )}
                          </div>

                          <div style={{ flex: 1.5 }}></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.actionBar}>
                <div className={styles.formatSelector}>
                  <select
                    value={downloadFormat}
                    onChange={(e) => setDownloadFormat(e.target.value)}
                    className={styles.select}
                  >
                    <option value="png">PNG</option>
                    <option value="jpeg">JPG</option>
                  </select>
                </div>
                <button
                  className={styles.btnIcon}
                  onClick={handleDownload}
                  title={`Download as ${downloadFormat.toUpperCase()}`}
                >
                  <span className={styles.btnTextIcon}>⬇️</span>
                  <span>Download</span>
                </button>
                <button
                  className={styles.btnIcon}
                  onClick={handleShare}
                  title="Share Card"
                >
                  <span className={styles.btnTextIcon}>📤</span>
                  <span>Share</span>
                </button>
                <button
                  className={`${styles.btnIcon} ${styles.primary}`}
                  onClick={handleSave}
                  disabled={saving}
                  title="Save Card"
                >
                  <span className={styles.btnTextIcon}>💾</span>
                  {saving ? (
                    <>
                      <Spinner size="small" style={{ borderTopColor: 'white' }} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{(data.invitationId || data.id) ? 'Update' : 'Save'}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tabs */}
      {/* <div className={styles.mobileTabs}>
        <button
          className={`${styles.tabButton} ${activeTab === 'edit' ? styles.active : ''}`}
          onClick={() => setActiveTab('edit')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          Edit
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'preview' ? styles.active : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          Preview
        </button>
      </div> */}
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<div className={styles.container}><Spinner fullPage text="Loading..." /></div>}>
      <PreviewContent />
    </Suspense>
  );
}
