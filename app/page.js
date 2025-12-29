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

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Prevent card click
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

  const handleShare = async (e, invitationId) => {
    e.stopPropagation();
    try {
      const shareUrlData = await getShareUrl(invitationId);
      setShareData(shareUrlData);
      setShareModalOpen(true);
    } catch (error) {
      console.error('Error getting share URL:', error);
      alert('Failed to get share link. Please try again.');
    }
  };

  const handleEdit = (invitation) => {
    if (invitation.templateId === 'ai-generated') {
      router.push(`/create/ai?id=${invitation.id}`);
    } else {
      router.push(`/preview?id=${invitation.id}`);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.layout}>
        <Header />
        <main className={styles.mainContent}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✨</div>
              <p style={{ color: '#64748b' }}>Loading your beautiful invitations...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
        <div className={styles.pageHeader}>
          <div className={styles.welcomeSection}>
            <h1>Dashboard</h1>
            <p>Manage your events and invitations</p>
          </div>
        </div>

        {error && (
          <div style={{ padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '12px', marginBottom: '2rem' }}>
            {error}
          </div>
        )}

        <div className={styles.gridContainer}>
          {/* Create New Card */}
          <div className={styles.createCard} onClick={() => router.push('/create')}>
            <div className={styles.createIcon}>+</div>
            <span className={styles.createText}>Create Invitation</span>
          </div>

          {/* Invitation Cards */}
          {invitations.map((invitation) => (
            <div key={invitation.id} className={styles.card} onClick={() => handleEdit(invitation)}>

              {/* Image / Preview */}
              <div className={styles.cardImageWrapper}>
                {invitation.viewUrl || invitation.imageUrl ? (
                  <img
                    src={invitation.viewUrl || invitation.imageUrl}
                    alt={invitation.title || 'Invitation'}
                    className={styles.cardImage}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<div class="${styles.cardPlaceholder}"><span>${invitation.eventType || 'Event'}</span><span>Preview</span></div>`;
                    }}
                  />
                ) : (
                  <div className={styles.cardPlaceholder}>
                    <span style={{ fontSize: '2rem' }}>🎨</span>
                    <span>{invitation.eventType || 'No Preview'}</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>{invitation.title || 'Untitled Invitation'}</h3>
                  <span className={`${styles.statusBadge} ${(!invitation.status || invitation.status === 'DRAFT') ? styles.statusDraft : styles.statusPublished}`}>
                    {invitation.status || 'Draft'}
                  </span>
                </div>

                {invitation.eventType && <span className={styles.eventTypeTag}>{invitation.eventType}</span>}

                <div className={styles.cardMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaIcon}>📅</span>
                    {invitation.date ? new Date(invitation.date).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric'
                    }) : 'Date not set'}
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaIcon}>⏰</span>
                    {invitation.time || 'Time not set'}
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaIcon}>📍</span>
                    {invitation.location || 'Location not set'}
                  </div>
                </div>

                {/* Actions */}
                <div className={styles.cardActions} onClick={(e) => e.stopPropagation()}>
                  <button
                    className={styles.actionBtn + ' ' + styles.btnAccent}
                    onClick={(e) => { e.stopPropagation(); handleEdit(invitation); }}
                  >
                    ✏️ Edit
                  </button>

                  <button
                    className={styles.actionBtn + ' ' + styles.btnPrimary}
                    onClick={(e) => handleShare(e, invitation.id)}
                  >
                    📤 Share
                  </button>

                  {(invitation.viewUrl || invitation.imageUrl) && (
                    <a
                      href={invitation.viewUrl || invitation.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.btnIcon}
                      title="View"
                      onClick={(e) => e.stopPropagation()}
                    >
                      👁️
                    </a>
                  )}

                  {(invitation.viewUrl || invitation.imageUrl) && (
                    <a
                      href={invitation.viewUrl || invitation.imageUrl}
                      download={`${invitation.title || 'invitation'}.png`}
                      className={styles.btnIcon}
                      title="Download"
                      onClick={(e) => e.stopPropagation()}
                    >
                      ⬇️
                    </a>
                  )}

                  <button
                    className={styles.btnIcon + ' ' + styles.btnIconDelete}
                    onClick={(e) => handleDelete(e, invitation.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {invitations.length === 0 && !isLoading && !error && (
          <div style={{ textAlign: 'center', marginTop: '3rem', color: '#94a3b8' }}>
            <p>Start by creating your first invitation above!</p>
          </div>
        )}

      </main>
    </div>
  );
}
