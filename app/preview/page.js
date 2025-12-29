"use client";
import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toPng } from "html-to-image";
import Button from "../components/Button";
import Toast from "../components/Toast";
import ShareModal from "../components/ShareModal";
import { getInvitation, getViewUrl, getShareUrl } from "../services/invitationService";
import styles from "./page.module.css";

function PreviewContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("id");
  const cardRef = useRef(null);

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
    theme: "",
    color: "#ffffff",
    category: "General",
    templateImage: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState(null);



  const showToast = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000);
  };

  useEffect(() => {
    const loadData = async () => {
      if (typeof window !== "undefined") {
        let initialData = null;

        // Scenario 1: Editing existing invitation from backend
        if (eventId) {
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
                templateId: invitation.templateId,
                category: invitation.templateId,
                templateImage: templateImage,
                imageUrl: invitation.imageUrl,
              };
            }
          } catch (err) {
            console.error("Failed to fetch invitation from backend:", err);
            // Fallback to localStorage
            const allEvents = JSON.parse(
              localStorage.getItem("myEvents") || "[]"
            );
            const found = allEvents.find((e) => e.id === eventId);
            if (found) initialData = found;
          }
        }

        // Scenario 2: Creating new from template (fallback)
        if (!initialData) {
          const stored = localStorage.getItem("previewData");
          if (stored) initialData = JSON.parse(stored);
        }

        if (initialData) {
          setData({
            title: initialData.title || "Event Title",
            eventType: initialData.eventType || "Celebration",
            date: initialData.date || "",
            time: initialData.time || "",
            location: initialData.location || "Location Here",
            theme: initialData.theme || "",
            color: initialData.color || "#ffffff",
            category: initialData.category || "General",
            templateImage:
              initialData.image || initialData.templateImage || null,
            id: initialData.id,
            eventId: initialData.eventId,
            templateId: initialData.templateId,
            config: initialData.config,
          });
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
    // First, generate the image from the card BEFORE setting any loading state
    // This ensures the card element is still mounted and visible
    if (!cardRef.current) {
      showToast("Unable to generate invitation image", "error");
      return;
    }

    try {
      // Generate image data URL first while card is still visible
      const dataUrl = await toPng(cardRef.current, { quality: 0.95 });

      // Now set saving state (doesn't hide the card)
      setSaving(true);

      // Import the invitation service dynamically
      const { saveInvitationWithImage, updateInvitationWithImage } =
        await import("../services/invitationService");

      // Prepare event data
      const eventData = {
        ...data,
        eventId: data.eventId || data.id, // Use existing eventId or id
        templateId: data.templateId || data.category || "custom",
      };

      // Check if this is an update (has invitation ID) or create
      const isUpdate = data.invitationId || data.id;
      let result;

      if (isUpdate) {
        // Update existing invitation
        result = await updateInvitationWithImage(
          data.invitationId || data.id,
          eventData,
          dataUrl
        );
      } else {
        // Create new invitation
        result = await saveInvitationWithImage(eventData, dataUrl);
      }

      // Also save to localStorage for backward compatibility
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
          // Update existing
          const updatedEvents = allEvents.map((e) =>
            e.id === data.id ? savedEvent : e
          );
          localStorage.setItem("myEvents", JSON.stringify(updatedEvents));
        } else {
          // Create new
          localStorage.setItem(
            "myEvents",
            JSON.stringify([savedEvent, ...allEvents])
          );
          setData((prev) => ({
            ...prev,
            id: savedEvent.id,
            invitationId: result.id,
          }));
        }
      }

      showToast("Invitation saved successfully!");
    } catch (error) {
      console.error("Error saving invitation:", error);
      showToast(
        error.message || "Failed to save invitation. Please try again.",
        "error"
      );

      // Fallback to localStorage-only save
      if (typeof window !== "undefined") {
        const allEvents = JSON.parse(localStorage.getItem("myEvents") || "[]");
        let dateId;

        if (data.id && allEvents.some((e) => e.id === data.id)) {
          // Update existing
          const updatedEvents = allEvents.map((e) =>
            e.id === data.id ? { ...data, status: "Draft" } : e
          );
          localStorage.setItem("myEvents", JSON.stringify(updatedEvents));
          dateId = data.id;
        } else {
          // Create new
          dateId = Date.now().toString();
          const newEvent = { ...data, id: dateId, status: "Draft" };
          localStorage.setItem(
            "myEvents",
            JSON.stringify([newEvent, ...allEvents])
          );
          setData((prev) => ({ ...prev, id: dateId }));
        }
        showToast("Saved locally (offline mode)", "warning");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (cardRef.current) {
      try {
        const dataUrl = await toPng(cardRef.current, { quality: 0.95 });
        const link = document.createElement("a");
        link.download = `${data.title || "invitation"}.png`;
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
    // Check if invitation has been saved
    const invitationId = data.invitationId || data.id;
    if (!invitationId) {
      showToast("Please save the invitation first before sharing", "warning");
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



  if (loading) return <div className={styles.container}>Loading editor...</div>;

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

      {/* Left: Editor Panel */}
      <div className={styles.editorPanel}>
        <div className={styles.editorHeader}>
          <div
            onClick={() => (window.location.href = "/")}
            className={styles.backLink}
          >
            ← Back to Dashboard
          </div>
          <h1 className={styles.sectionTitle}>
            {eventId ? "Edit Invitation" : "Customize Invitation"}
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
            {/* Overlay for better text readability when using template image BUT NOT custom config (custom config handles its own contrast) */}
            {data.templateImage && !data.config && (
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

            <div
              className={styles.cardContent}
              style={{
                position: "relative",
                zIndex: 1,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Event Type / Uppercase Header */}
              <div
                style={{
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  fontSize: "0.8rem",
                  opacity: 0.8,
                  marginBottom: '1rem',
                  ...data.config?.layout?.eventType
                }}
              >
                {data.eventType || "You Are Invited"}
              </div>

              {/* Title */}
              <h1
                style={{
                  fontSize: "3rem",
                  lineHeight: "1.1",
                  margin: "0 0 1rem 0",
                  ...data.config?.layout?.title
                }}
              >
                {data.title}
              </h1>

              {/* Divider if no custom config or if explicitly requested (could be added to config later) */}
              {!data.config && (
                <div style={{ fontSize: "1.2rem", margin: "auto 0 2rem" }}>
                  <hr
                    style={{
                      width: "50px",
                      border: "none",
                      borderTop: "2px solid rgba(0,0,0,0.1)",
                      margin: "1rem auto",
                    }}
                  />
                </div>
              )}

              {/* Details Section */}
              <div style={{
                fontSize: "1.1rem",
                lineHeight: "1.6",
                marginTop: 'auto',
                ...data.config?.layout?.details
              }}>
                <p style={{ fontWeight: 'bold' }}>
                  {data.date
                    ? new Date(data.date).toLocaleDateString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                    : "Date"}
                </p>
                <p>{data.time || "Time"}</p>
                <p style={{ marginTop: "0.5rem" }}>{data.location}</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.floatingActions}>
          <Button variant="secondary" onClick={handleDownload}>
            Download Image
          </Button>
          <Button variant="secondary" onClick={handleShare}>
            📤 Share
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving
              ? "Saving..."
              : eventId || data.id
                ? "Update Invitation"
                : "Save Invitation"}
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
