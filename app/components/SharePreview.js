"use client";
import { useState } from "react";
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
} from "../utils/shareUtils";
import styles from "./SharePreview.module.css";

// SVG Icons
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

export default function SharePreview({ shareUrl, title, showGlassBackground = true }) {
    const [copied, setCopied] = useState(false);

    const shareText = `${title || "Check out this invitation"}`;

    const handleCopy = async () => {
        const success = await copyToClipboard(shareUrl);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleNativeShare = async () => {
        await shareNative({
            title: title || "Invitation",
            text: shareText,
            url: shareUrl,
        });
    };

    const socialPlatforms = [
        {
            name: "WhatsApp",
            Icon: Icons.WhatsApp,
            color: "#25D366",
            action: () => shareOnWhatsApp(shareUrl, shareText),
        },
        {
            name: "Facebook",
            Icon: Icons.Facebook,
            color: "#1877F2",
            action: () => shareOnFacebook(shareUrl),
        },
        {
            name: "X",
            Icon: Icons.X,
            color: "#000000",
            action: () => shareOnTwitter(shareUrl, shareText),
        },
        {
            name: "LinkedIn",
            Icon: Icons.LinkedIn,
            color: "#0A66C2",
            action: () => shareOnLinkedIn(shareUrl),
        },
        {
            name: "Instagram",
            Icon: Icons.Instagram,
            color: "#E1306C",
            action: () => shareOnInstagram(shareUrl),
        },
        {
            name: "Telegram",
            Icon: Icons.Telegram,
            color: "#0088cc",
            action: () => shareOnTelegram(shareUrl, shareText),
        },
        {
            name: "Email",
            Icon: Icons.Email,
            color: "#EA4335",
            action: () => shareViaEmail(shareUrl, title || "Invitation", shareText),
        },
    ];

    return (
        <div className={`${styles.shareSection} ${showGlassBackground ? styles.glass : ""}`}>
            <div className={styles.shareHeader}>
                {/* <h2 className={styles.shareTitle}>Share Preview</h2>
                <p className={styles.shareSubtitle}>Invite friends and family</p> */}
            </div>

            {/* Native Share Button */}
            {isNativeShareSupported() && (
                <button className={styles.nativeShareButton} onClick={handleNativeShare}>
                    <Icons.Share size={20} />
                    <span>Share Native</span>
                </button>
            )}

            {/* Social Media Icons */}
            <div className={styles.socialButtons}>
                {socialPlatforms.map((platform) => (
                    <button
                        key={platform.name}
                        className={styles.socialButton}
                        onClick={platform.action}
                        style={{ "--color": platform.color }}
                        title={platform.name}
                    >
                        <platform.Icon size={18} />
                    </button>
                ))}
            </div>

            {/* Copy Link */}
            <div className={styles.copyContainer}>
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
                >
                    {copied ? <Icons.Check size={16} /> : <Icons.Copy size={16} />}
                    <span style={{ marginLeft: 6 }}>{copied ? "Copied" : "Copy"}</span>
                </button>
            </div>
        </div>
    );
}
