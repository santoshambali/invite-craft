"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getInvitation, getViewUrl } from "../../services/invitationService";
import {
    shareOnWhatsApp,
    shareOnFacebook,
    shareOnTwitter,
    shareOnLinkedIn,
    shareOnTelegram,
    shareViaEmail,
    copyToClipboard,
    shareNative,
    isNativeShareSupported,
} from "../../utils/shareUtils";
import styles from "./page.module.css";

export default function ShareContent() {
    const params = useParams();
    const invitationId = params.id;

    const [invitation, setInvitation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const loadInvitation = async () => {
            try {
                const data = await getInvitation(invitationId);
                setInvitation(data);

                // Get signed URL for the image if it exists
                if (data.imageUrl) {
                    try {
                        const filename = data.imageUrl.split("/").pop();
                        const signedUrl = await getViewUrl(filename);
                        setImageUrl(signedUrl);
                    } catch (err) {
                        console.error("Failed to get view URL:", err);
                        setImageUrl(data.imageUrl);
                    }
                }
            } catch (err) {
                console.error("Error loading invitation:", err);
                setError("Invitation not found or has been removed.");
            } finally {
                setLoading(false);
            }
        };

        if (invitationId) {
            loadInvitation();
        }
    }, [invitationId]);

    const handleCopy = async () => {
        const success = await copyToClipboard(window.location.href);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleNativeShare = async () => {
        const shareText = `You're invited! ${invitation?.title || "Check out this invitation"}`;
        await shareNative({
            title: invitation?.title || "Invitation",
            text: shareText,
            url: window.location.href,
        });
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loader}>
                    <div className={styles.spinner}></div>
                    <p>Loading invitation...</p>
                </div>
            </div>
        );
    }

    if (error || !invitation) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <div className={styles.errorIcon}>⚠️</div>
                    <h1>Oops!</h1>
                    <p>{error || "Invitation not found"}</p>
                    <a href="/" className={styles.homeLink}>
                        Go to Homepage
                    </a>
                </div>
            </div>
        );
    }

    const shareText = `You're invited! ${invitation.title || "Check out this invitation"}`;
    const currentUrl = typeof window !== "undefined" ? window.location.href : "";

    return (
        <div className={styles.container}>
            {/* Invitation Wrapper */}
            <div className={styles.invitationWrapper}>

                {/* Visual Card */}
                <div className={`${styles.invitationCard} ${!imageUrl ? styles.fallbackCard : ''}`}>
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={invitation.title}
                            className={styles.invitationImage}
                        />
                    ) : (
                        // Fallback Text Card (only shown if no image)
                        <div className={styles.cardContent}>
                            <div className={styles.inviteText}>You Are Cordially Invited To</div>
                            <h1 className={styles.eventTitle}>{invitation.title}</h1>

                            <div className={styles.eventDetails}>
                                {invitation.eventType && <p className={styles.eventType}>{invitation.eventType}</p>}
                                <hr className={styles.divider} style={{ width: '40px', borderColor: 'rgba(0,0,0,0.1)', margin: '16px auto' }} />

                                {invitation.date && (
                                    <p className={styles.date}>
                                        {new Date(invitation.date).toLocaleDateString(undefined, {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </p>
                                )}
                                {invitation.time && <p className={styles.time}>{invitation.time}</p>}
                                {invitation.location && <p className={styles.location}>{invitation.location}</p>}
                            </div>
                        </div>
                    )}
                </div>

                {/* If there IS an image, we still might want to show details below it for clarity? 
                    Let's only do it if the user scrolls or maybe just keep it clean. 
                    For now, I'll assume the image contains the text. 
                */}

                {/* Share Section */}
                <div className={styles.shareSection}>
                    <div className={styles.shareHeader}>
                        <h2 className={styles.shareTitle}>Share Preview</h2>
                        <p className={styles.shareSubtitle}>Invite friends and family</p>
                    </div>

                    {/* Native Share Button (Mobile) */}
                    {isNativeShareSupported() && (
                        <button className={styles.nativeShareButton} onClick={handleNativeShare}>
                            <span style={{ fontSize: '1.2rem' }}>📤</span>
                            Share Native
                        </button>
                    )}

                    {/* Social Media Icons */}
                    <div className={styles.socialButtons}>
                        <button
                            className={styles.socialButton}
                            onClick={() => shareOnWhatsApp(currentUrl, shareText)}
                            style={{ "--color": "#25D366" }}
                            title="WhatsApp"
                        >
                            <span>💬</span>
                        </button>

                        <button
                            className={styles.socialButton}
                            onClick={() => shareOnFacebook(currentUrl)}
                            style={{ "--color": "#1877F2" }}
                            title="Facebook"
                        >
                            <span>📘</span>
                        </button>

                        <button
                            className={styles.socialButton}
                            onClick={() => shareOnTwitter(currentUrl, shareText)}
                            style={{ "--color": "#1DA1F2" }}
                            title="X (Twitter)"
                        >
                            <span>🐦</span>
                        </button>

                        <button
                            className={styles.socialButton}
                            onClick={() => shareOnLinkedIn(currentUrl)}
                            style={{ "--color": "#0A66C2" }}
                            title="LinkedIn"
                        >
                            <span>💼</span>
                        </button>

                        <button
                            className={styles.socialButton}
                            onClick={() => shareOnTelegram(currentUrl, shareText)}
                            style={{ "--color": "#0088cc" }}
                            title="Telegram"
                        >
                            <span>✈️</span>
                        </button>

                        <button
                            className={styles.socialButton}
                            onClick={() =>
                                shareViaEmail(currentUrl, invitation.title || "Invitation", shareText)
                            }
                            style={{ "--color": "#EA4335" }}
                            title="Email"
                        >
                            <span>📧</span>
                        </button>
                    </div>

                    {/* Copy Link */}
                    <div className={styles.copyContainer}>
                        <input
                            type="text"
                            value={currentUrl}
                            readOnly
                            className={styles.urlInput}
                            onClick={(e) => e.target.select()}
                        />
                        <button
                            className={`${styles.copyButton} ${copied ? styles.copied : ""}`}
                            onClick={handleCopy}
                        >
                            {copied ? "Copied" : "Copy"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className={styles.footer}>
                <p>
                    Powered by{" "}
                    <a href="/" className={styles.brandLink}>
                        InviteCraft
                    </a>
                </p>
            </div>
        </div>
    );
}
