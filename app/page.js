'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from './utils/auth';
import { getUserInvitations, deleteInvitation } from './services/invitationService';
import Header from './components/Header';
import styles from './page.module.css';

export default function Dashboard() {
  const router = useRouter();
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const fetchInvitations = async () => {
      try {
        setError(null);
        const data = await getUserInvitations();
        setInvitations(data);
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

  return (
    <div className={styles.layout}>
      <Header />

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
                {invitation.imageUrl ? (
                  <img
                    src={invitation.imageUrl}
                    alt={invitation.title || 'Invitation'}
                    className={styles.eventPreview}
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className={styles.eventPreview}
                    style={{ background: '#f9a8d4', color: '#333' }}
                  >
                    {invitation.eventType || 'Event'}<br />Preview
                  </div>
                )}

                <div className={styles.eventContent}>
                  <h2 className={styles.eventTitle}>{invitation.title || 'Untitled Invitation'}</h2>
                  {invitation.eventType && <div className={styles.tag}>{invitation.eventType}</div>}

                  <div className={styles.detailsRow}>
                    <div className={styles.detailItem}>
                      📅 {invitation.date ? new Date(invitation.date).toLocaleDateString() : 'TBD'}
                    </div>
                    <div className={styles.detailItem}>
                      ⏰ {invitation.time || 'TBD'}
                    </div>
                    <div className={styles.detailItem}>
                      📍 {invitation.location || 'TBD'}
                    </div>
                  </div>

                  <div className={styles.actionRow}>
                    <button className={`${styles.actionBtn} ${styles.btnPurple}`} onClick={() => router.push(`/preview?id=${invitation.id}`)}>✏️ Edit</button>
                    {invitation.imageUrl && (
                      <a 
                        href={invitation.imageUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`${styles.actionBtn} ${styles.btnBlue}`}
                      >
                        👁️ View
                      </a>
                    )}
                    {invitation.imageUrl && (
                      <a 
                        href={invitation.imageUrl} 
                        download={`${invitation.title || 'invitation'}.png`}
                        className={`${styles.actionBtn} ${styles.btnGreen}`}
                      >
                        ⬇️ Download
                      </a>
                    )}
                    <button className={`${styles.actionBtn} ${styles.btnGray}`} onClick={() => {
                      navigator.clipboard.writeText(invitation.imageUrl || window.location.href);
                      alert('Link copied to clipboard!');
                    }}>🔗 Share</button>
                    <button className={`${styles.actionBtn} ${styles.btnRed}`} onClick={() => handleDelete(invitation.id)}>🗑️ Delete</button>
                  </div>

                  <div className={styles.statusBadge} style={{
                    background: '#dcfce7',
                    color: '#16a34a'
                  }}>
                    Published
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
