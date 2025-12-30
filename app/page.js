'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUserId } from './utils/auth';
import { getUserInvitations, deleteInvitation, getViewUrl, getShareUrl } from './services/invitationService';
import ShareModal from './components/ShareModal';
import CreateOptionsModal from './components/CreateOptionsModal';
import GuestLanding from './components/GuestLanding';
import { useInvitations } from './contexts/InvitationContext';
import Spinner from './components/Spinner';
import styles from './page.module.css';

export default function Dashboard() {
  const router = useRouter();
  const { invitations, setInvitations, isLoading: contextLoading, error: contextError } = useInvitations();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [shareData, setShareData] = useState(null);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication
    const authenticated = isAuthenticated();
    setIsUserAuthenticated(authenticated);

    if (!authenticated) {
      // Show guest landing page instead of redirecting
      setIsLoading(false);
      return;
    }

    const enrichInvitations = async () => {
      if (invitations.length === 0 && !contextLoading) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Fetch signed view URLs for each invitation's image if not already present
        const invitationsWithViewUrls = await Promise.all(
          invitations.map(async (invitation) => {
            if (invitation.imageUrl && !invitation.viewUrl) {
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

        // Only update if something actually changed to avoid infinite loops
        const hasChanges = invitationsWithViewUrls.some((inv, idx) => inv.viewUrl !== invitations[idx].viewUrl);
        if (hasChanges) {
          setInvitations(invitationsWithViewUrls);
        }
      } catch (err) {
        console.error('Failed to enrich invitations:', err);
      } finally {
        setIsLoading(false);
      }
    };

    enrichInvitations();
  }, [router, invitations.length, contextLoading]);

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
        <main className={styles.mainContent}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
            <Spinner size="large" text="Loading your beautiful invitations..." />
          </div>
        </main>
      </div>
    );
  }

  // Show guest landing page for non-authenticated users
  if (!isUserAuthenticated) {
    return <GuestLanding />;
  }

  return (
    <div className={styles.layout}>


      {/* Create Options Modal */}
      <CreateOptionsModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

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
        {/* <div className={styles.pageHeader}>
          <div className={styles.welcomeSection}>
            <h1>Dashboard</h1>
            <p>Welcome back! You have {invitations.length} invitation{invitations.length !== 1 ? 's' : ''} ready to go.</p>
          </div>
        </div> */}

        {error && (
          <div style={{ padding: '1rem', background: '#fee2e2', color: '#dc2626', borderRadius: '12px', marginBottom: '2rem' }}>
            {error}
          </div>
        )}

        <div className={styles.gridContainer}>
          {/* Create New Card */}
          <div className={styles.createCard} onClick={() => setCreateModalOpen(true)}>
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
                  {invitation.eventType && (
                    <span className={styles.eventTypeTag}>
                      {invitation.eventType}
                    </span>
                  )}
                </div>

                <div className={styles.cardMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaIcon}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </span>
                    {invitation.date ? new Date(invitation.date).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric'
                    }) : 'Date not set'}
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaIcon}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    </span>
                    {invitation.time || 'Time not set'}
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaIcon}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    </span>
                    {invitation.location || 'Location not set'}
                  </div>
                </div>

                {/* Actions */}
                <div className={styles.cardActions} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.actionGroup}>
                    <button
                      className={styles.btnIcon}
                      onClick={(e) => { e.stopPropagation(); handleEdit(invitation); }}
                      title="Edit"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>

                    <button
                      className={styles.btnIcon}
                      onClick={(e) => handleShare(e, invitation.id)}
                      title="Share"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>
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
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
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
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      </a>
                    )}
                  </div>

                  <button
                    className={styles.btnIcon + ' ' + styles.btnIconDelete}
                    onClick={(e) => handleDelete(e, invitation.id)}
                    title="Delete"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
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
