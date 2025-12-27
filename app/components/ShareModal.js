"use client";
import { useState } from "react";
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
} from "../utils/shareUtils";
import styles from "./ShareModal.module.css";

export default function ShareModal({ isOpen, onClose, shareUrl, title, invitationId }) {
    const [copied, setCopied] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    if (!isOpen) return null;

    const shareText = `You're invited! ${title || "Check out this invitation"}`;

    const handleCopy = async () => {
        const success = await copyToClipboard(shareUrl);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleNativeShare = async () => {
        const success = await shareNative({
            title: title || "Invitation",
            text: shareText,
            url: shareUrl,
        });
        if (!success) {
            // Fallback to copy if native share fails
            handleCopy();
        }
    };

    const socialPlatforms = [
        {
            name: "WhatsApp",
            icon: "📱",
            color: "#25D366",
            action: () => shareOnWhatsApp(shareUrl, shareText),
        },
        {
            name: "Facebook",
            icon: "📘",
            color: "#1877F2",
            action: () => shareOnFacebook(shareUrl),
        },
        {
            name: "Twitter",
            icon: "🐦",
            color: "#1DA1F2",
            action: () => shareOnTwitter(shareUrl, shareText),
        },
        {
            name: "LinkedIn",
            icon: "💼",
            color: "#0A66C2",
            action: () => shareOnLinkedIn(shareUrl),
        },
        {
            name: "Telegram",
            icon: "✈️",
            color: "#0088cc",
            action: () => shareOnTelegram(shareUrl, shareText),
        },
        {
            name: "Email",
            icon: "📧",
            color: "#EA4335",
            action: () => shareViaEmail(shareUrl, title || "Invitation", shareText),
        },
    ];

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Share Invitation</h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className={styles.content}>
                    <p className={styles.description}>
                        Share this beautiful invitation with your guests
                    </p>

                    {/* Native Share Button (Mobile) */}
                    {isNativeShareSupported() && (
                        <button className={styles.nativeShareButton} onClick={handleNativeShare}>
                            <span className={styles.shareIcon}>📤</span>
                            Share via...
                        </button>
                    )}

                    {/* Social Media Grid */}
                    <div className={styles.socialGrid}>
                        {socialPlatforms.map((platform) => (
                            <button
                                key={platform.name}
                                className={styles.socialButton}
                                onClick={platform.action}
                                style={{ "--platform-color": platform.color }}
                            >
                                <span className={styles.platformIcon}>{platform.icon}</span>
                                <span className={styles.platformName}>{platform.name}</span>
                            </button>
                        ))}
                    </div>

                    {/* Copy Link Section */}
                    <div className={styles.copySection}>
                        <div className={styles.urlContainer}>
                            <input
                                type="text"
                                value={shareUrl}
                                readOnly
                                className={styles.urlInput}
                                onClick={(e) => e.target.select()}
                            />
                            <button
                                className={`${styles.copyButton} ${copied ? styles.copied : ""}`}
                                onClick={handleCopy}
                                onMouseEnter={() => setShowTooltip(true)}
                                onMouseLeave={() => setShowTooltip(false)}
                            >
                                {copied ? "✓ Copied!" : "📋 Copy"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
