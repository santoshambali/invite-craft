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
    shareOnInstagram,
    shareViaEmail,
    copyToClipboard,
    shareNative,
    isNativeShareSupported,
} from "../../utils/shareUtils";
import SharePreview from "../../components/SharePreview";
import Spinner from "../../components/Spinner";
import styles from "./page.module.css";

// SVG Icons (Matching ShareModal)
const Icons = {
    WhatsApp: (props) => (
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
    ),
    Facebook: (props) => (
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
    ),
    X: (props) => (
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="currentColor" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" stroke="none"></path></svg>
    ),
    LinkedIn: (props) => (
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
    ),
    Instagram: (props) => (
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
    ),
    Telegram: (props) => (
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
    ),
    Email: (props) => (
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
    ),
    Copy: (props) => (
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
    ),
    Check: (props) => (
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="20 6 9 17 4 12"></polyline></svg>
    ),
    Share: (props) => (
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
    )
};

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
        const shareText = `Check out this card! ${invitation?.title || "Check out this card"}`;
        await shareNative({
            title: invitation?.title || "Card",
            text: shareText,
            url: window.location.href,
        });
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <Spinner fullPage text="Loading card..." />
            </div>
        );
    }

    if (error || !invitation) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <div className={styles.errorIcon}>⚠️</div>
                    <h1>Oops!</h1>
                    <p>{error || "Card not found"}</p>
                    <a href="/" className={styles.homeLink}>
                        Go to Homepage
                    </a>
                </div>
            </div>
        );
    }

    const shareText = `Check out this card! ${invitation.title || "Check out this card"}`;
    const currentUrl = typeof window !== "undefined" ? window.location.href : "";

    const socialPlatforms = [
        {
            name: "WhatsApp",
            Icon: Icons.WhatsApp,
            color: "#25D366",
            action: () => shareOnWhatsApp(currentUrl, shareText),
        },
        {
            name: "Facebook",
            Icon: Icons.Facebook,
            color: "#1877F2",
            action: () => shareOnFacebook(currentUrl),
        },
        {
            name: "X",
            Icon: Icons.X,
            color: "#000000",
            action: () => shareOnTwitter(currentUrl, shareText),
        },
        {
            name: "LinkedIn",
            Icon: Icons.LinkedIn,
            color: "#0A66C2",
            action: () => shareOnLinkedIn(currentUrl),
        },
        {
            name: "Instagram",
            Icon: Icons.Instagram,
            color: "#E1306C",
            action: () => shareOnInstagram(currentUrl),
        },
        {
            name: "Telegram",
            Icon: Icons.Telegram,
            color: "#0088cc",
            action: () => shareOnTelegram(currentUrl, shareText),
        },
        {
            name: "Email",
            Icon: Icons.Email,
            color: "#EA4335",
            action: () => shareViaEmail(currentUrl, invitation.title || "Card", shareText),
        },
    ];

    return (
        <div className={styles.container}>
            {/* Invitation Wrapper */}
            <div className={styles.invitationWrapper}>

                {/* Visual Card */}
                <div className={styles.invitationCard}>
                    <div className={styles.floatingCard}>
                        <div className={styles.cardGlow}></div>
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={invitation.title}
                                className={styles.invitationImage}
                            />
                        ) : (
                            // Fallback Text Card (only shown if no image)
                            <div className={styles.fallbackCard}>
                                <div className={styles.inviteText}>Greetings</div>
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
                </div>

                {/* Share Section */}
                <SharePreview
                    shareUrl={currentUrl}
                    title={invitation.title}
                />
            </div>

            {/* Footer */}
            <div className={styles.footer}>
                <p>
                    Powered by{" "}
                    <a href="/" className={styles.brandLink}>
                        LAGU
                    </a>
                </p>
            </div>
        </div>
    );
}
