/**
 * Social Media Share Utilities
 * 
 * Provides functions to share content on various social media platforms
 */

/**
 * Share on WhatsApp
 * @param {string} url - URL to share
 * @param {string} text - Text message to share
 */
export const shareOnWhatsApp = (url, text = '') => {
  const message = text ? `${text}\n${url}` : url;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
};

/**
 * Share on Facebook
 * @param {string} url - URL to share
 */
export const shareOnFacebook = (url) => {
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  window.open(facebookUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
};

/**
 * Share on Twitter/X
 * @param {string} url - URL to share
 * @param {string} text - Tweet text
 */
export const shareOnTwitter = (url, text = '') => {
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  window.open(twitterUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
};

/**
 * Share on LinkedIn
 * @param {string} url - URL to share
 */
export const shareOnLinkedIn = (url) => {
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  window.open(linkedInUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
};

/**
 * Share on Telegram
 * @param {string} url - URL to share
 * @param {string} text - Message text
 */
export const shareOnTelegram = (url, text = '') => {
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  window.open(telegramUrl, '_blank', 'noopener,noreferrer');
};

/**
 * Share via Email
 * @param {string} url - URL to share
 * @param {string} subject - Email subject
 * @param {string} body - Email body
 */
export const shareViaEmail = (url, subject = '', body = '') => {
  const emailBody = body ? `${body}\n\n${url}` : url;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
  window.location.href = mailtoUrl;
};

/**
 * Copy URL to clipboard
 * @param {string} url - URL to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (url) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (err) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
};

/**
 * Use native Web Share API if available
 * @param {Object} shareData - Share data object
 * @param {string} shareData.title - Title to share
 * @param {string} shareData.text - Text to share
 * @param {string} shareData.url - URL to share
 * @returns {Promise<boolean>} Success status
 */
export const shareNative = async ({ title, text, url }) => {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return true;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
      return false;
    }
  }
  return false;
};

/**
 * Check if native share is supported
 * @returns {boolean} Whether native share is supported
 */
export const isNativeShareSupported = () => {
  return typeof navigator !== 'undefined' && !!navigator.share;
};

/**
 * Share on Instagram
 * Note: Instagram does not support direct web sharing via URL.
 * We open Instagram for the user to paste the link or upload content manually.
 */
export const shareOnInstagram = () => {
  window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
};

export default {
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
};
