'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUserId } from './utils/auth';
import { getUserInvitations, deleteInvitation, getViewUrl, getShareUrl } from './services/invitationService';
import Header from './components/Header';
import ShareModal from './components/ShareModal';
import styles from './page.module.css';

export default function Dashboard() {
  const router = useRouter();
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState(null);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const fetchInvitations = async () => {
      try {
        setError(null);
        const userId = getUserId();
        const data = await getUserInvitations(userId);
        console.log('Dashboard invitations:', data);

        // Fetch signed view URLs for each invitation's image
        const invitationsWithViewUrls = await Promise.all(
          data.map(async (invitation) => {
            if (invitation.imageUrl) {
              try {
                // Extract filename from the full URL
                const filename = invitation.imageUrl.split('/').pop();
                const viewUrl = await getViewUrl(filename);
                return { ...invitation, viewUrl };
              } catch (err) {
                console.error('Failed to get view URL for:', invitation.imageUrl, err);
                return invitation;
              }
            }
            return invitation;
          })
        );

        setInvitations(invitationsWithViewUrls);
      } catch (err) {
        console.error('Failed to fetch invitations:', err);
        setError('Failed to load invitations. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitations();
  }, [router]);

  if (isLoading) {
    return (
      <div className={styles.layout}>
        <Header />
        <main className={styles.mainContent}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            Loading invitations...
          </div>
        </main>
      </div>
    );
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this invitation?')) {
      return;
    }

    try {
      await deleteInvitation(id);
      setInvitations(invitations.filter(inv => inv.id !== id));
    } catch (err) {
      console.error('Failed to delete invitation:', err);
      alert('Failed to delete invitation. Please try again.');
    }
  };

  const handleShare = async (invitationId) => {
    try {
      const shareUrlData = await getShareUrl(invitationId);
      setShareData(shareUrlData);
      setShareModalOpen(true);
    } catch (error) {
      console.error('Error getting share URL:', error);
      alert('Failed to get share link. Please try again.');
    }
  };

  return (
    <div className={styles.layout}>
      <Header />

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

      <main className={styles.mainContent}>
        {error && (
          <div style={{ padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {invitations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <h2>No invitations yet</h2>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>Create your first invitation to get started!</p>
            <button
              className={`${styles.actionBtn} ${styles.btnPurple}`}
              onClick={() => router.push('/create')}
              style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
            >
              Create Invitation
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {invitations.map((invitation) => (
              <div key={invitation.id} className={styles.eventCard}>
                {/* Left Half - Preview Image */}
                <div className={styles.eventPreviewSection}>
                  {invitation.viewUrl || invitation.imageUrl ? (
                    <img
                      src={invitation.viewUrl || invitation.imageUrl}
                      alt={invitation.title || 'Invitation'}
                      className={styles.eventPreviewImage}
                      onError={(e) => {
                        console.error('Image failed to load:', invitation.imageUrl);
                        e.target.onerror = null;
                        e.target.src = '';
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<div class="${styles.eventPreviewPlaceholder}">${invitation.eventType || 'Event'}<br/>Preview</div>`;
                      }}
                    />
                  ) : (
                    <div className={styles.eventPreviewPlaceholder}>
                      {invitation.eventType || 'Event'}<br />Preview
                    </div>
                  )}
                </div>

                {/* Right Half - Event Details */}
                <div className={styles.eventDetailsSection}>
                  <div className={styles.eventHeader}>
                    <h2 className={styles.eventTitle}>{invitation.title || 'Untitled Invitation'}</h2>
                    <span className={`${styles.statusBadgeInline} ${invitation.status === 'DRAFT' ? styles.draft : ''}`}>
                      {invitation.status || 'Draft'}
                    </span>
                  </div>

                  {invitation.eventType && <div className={styles.tag}>{invitation.eventType}</div>}

                  <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                      <span>📅</span>
                      <span>{invitation.date ? new Date(invitation.date).toLocaleDateString() : 'Date not set'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span>⏰</span>
                      <span>{invitation.time || 'Time not set'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span>📍</span>
                      <span>{invitation.location || 'Location not set'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span>🎨</span>
                      <span>{invitation.templateId || 'Custom'}</span>
                    </div>
                  </div>

                  <div className={styles.actionRow}>
                    <button
                      className={`${styles.actionBtn} ${styles.btnPurple}`}
                      onClick={() => {
                        if (invitation.templateId === 'ai-generated') {
                          router.push(`/create/ai?id=${invitation.id}`);
                        } else {
                          router.push(`/preview?id=${invitation.id}`);
                        }
                      }}
                    >
                      ✏️ Edit
                    </button>
                    {(invitation.viewUrl || invitation.imageUrl) && (
                      <a
                        href={invitation.viewUrl || invitation.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.actionBtn} ${styles.btnBlue}`}
                      >
                        👁️ View
                      </a>
                    )}
                    {(invitation.viewUrl || invitation.imageUrl) && (
                      <a
                        href={invitation.viewUrl || invitation.imageUrl}
                        download={`${invitation.title || 'invitation'}.png`}
                        className={`${styles.actionBtn} ${styles.btnGreen}`}
                      >
                        ⬇️ Download
                      </a>
                    )}
                    <button className={`${styles.actionBtn} ${styles.btnGray}`} onClick={() => handleShare(invitation.id)}>📤 Share</button>
                    <button className={`${styles.actionBtn} ${styles.btnRed}`} onClick={() => handleDelete(invitation.id)}>🗑️ Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
