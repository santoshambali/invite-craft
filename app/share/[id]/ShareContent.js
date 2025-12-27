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
                // setError("Invitation not found or has been removed.");
                // For preview purposes, suppress error if we are just loading client side and server side already rendered meta
                // But actually, we need data for the UI.

                // If this fails, it might be due to auth.
                // But let's assume it works as per previous status.
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
            {/* Invitation Card */}
            <div className={styles.invitationWrapper}>
                <div
                    className={styles.invitationCard}
                    style={{
                        background: imageUrl
                            ? `url(${imageUrl}) center/cover no-repeat`
                            : "#ffffff",
                    }}
                >
                    {imageUrl && (
                        <div className={styles.overlay}></div>
                    )}

                    <div className={styles.cardContent}>
                        <div className={styles.inviteText}>You Are Cordially Invited To</div>

                        <h1 className={styles.eventTitle}>{invitation.title}</h1>

                        <div className={styles.eventDetails}>
                            <p className={styles.eventType}>{invitation.eventType}</p>
                            <hr className={styles.divider} />
                        </div>

                        <div className={styles.dateTimeLocation}>
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
                            {invitation.location && (
                                <p className={styles.location}>{invitation.location}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Share Section */}
                <div className={styles.shareSection}>
                    <h2 className={styles.shareTitle}>Share this invitation</h2>

                    {/* Native Share Button (Mobile) */}
                    {isNativeShareSupported() && (
                        <button className={styles.nativeShareButton} onClick={handleNativeShare}>
                            <span className={styles.shareIcon}>📤</span>
                            Share via...
                        </button>
                    )}

                    {/* Social Media Buttons */}
                    <div className={styles.socialButtons}>
                        <button
                            className={styles.socialButton}
                            onClick={() => shareOnWhatsApp(currentUrl, shareText)}
                            style={{ "--color": "#25D366" }}
                        >
                            <span className={styles.icon}>📱</span>
                            <span>WhatsApp</span>
                        </button>

                        <button
                            className={styles.socialButton}
                            onClick={() => shareOnFacebook(currentUrl)}
                            style={{ "--color": "#1877F2" }}
                        >
                            <span className={styles.icon}>📘</span>
                            <span>Facebook</span>
                        </button>

                        <button
                            className={styles.socialButton}
                            onClick={() => shareOnTwitter(currentUrl, shareText)}
                            style={{ "--color": "#1DA1F2" }}
                        >
                            <span className={styles.icon}>🐦</span>
                            <span>Twitter</span>
                        </button>

                        <button
                            className={styles.socialButton}
                            onClick={() => shareOnLinkedIn(currentUrl)}
                            style={{ "--color": "#0A66C2" }}
                        >
                            <span className={styles.icon}>💼</span>
                            <span>LinkedIn</span>
                        </button>

                        <button
                            className={styles.socialButton}
                            onClick={() => shareOnTelegram(currentUrl, shareText)}
                            style={{ "--color": "#0088cc" }}
                        >
                            <span className={styles.icon}>✈️</span>
                            <span>Telegram</span>
                        </button>

                        <button
                            className={styles.socialButton}
                            onClick={() =>
                                shareViaEmail(currentUrl, invitation.title || "Invitation", shareText)
                            }
                            style={{ "--color": "#EA4335" }}
                        >
                            <span className={styles.icon}>📧</span>
                            <span>Email</span>
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
                            {copied ? "✓ Copied!" : "📋 Copy Link"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className={styles.footer}>
                <p>
                    Create your own beautiful invitations at{" "}
                    <a href="/" className={styles.brandLink}>
                        InviteCraft
                    </a>
                </p>
            </div>
        </div>
    );
}
