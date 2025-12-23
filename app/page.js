'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from './utils/auth';
import Header from './components/Header';
import styles from './page.module.css';

export default function Dashboard() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    setTimeout(() => {
      setIsLoading(false);
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('myEvents');
        if (stored) {
          setEvents(JSON.parse(stored));
        }
      }
    }, 0);
  }, [router]);

  if (isLoading) {
    return <div className={styles.layout}>Loading...</div>; // Or a better loading spinner
  }

  const handleDelete = (id) => {
    const updated = events.filter(e => e.id !== id);
    setEvents(updated);
    localStorage.setItem('myEvents', JSON.stringify(updated));
  };

  // Static demo event
  const demoEvent = {
    id: 'demo-1',
    title: "Sarah's 30th Birthday",
    eventType: 'Birthday',
    date: '2025-03-15',
    time: '18:00',
    location: 'Grand Hotel',
    status: 'Published',
    color: '#f9a8d4'
  };

  const allEvents = [...events, demoEvent];

  return (
    <div className={styles.layout}>
      <Header />

      <main className={styles.mainContent}>
        {/* <header className={styles.pageHeader}>
          <h1 className={styles.title}>My Invitations</h1>
          <p className={styles.subtitle}>Manage and track your invitations</p>
        </header> */}

        {/* <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>Total Events</h3>
            <div className={styles.statValue}>{allEvents.length}</div>
            <div className={`${styles.statMeta} ${styles.metaSuccess}`}>+1 this week</div>
          </div>

          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>Published</h3>
            <div className={styles.statValue}>{allEvents.filter(e => e.status === 'Published').length}</div>
            <div className={`${styles.statMeta} ${styles.metaSuccess}`}>Active invites</div>
          </div>

          <div className={styles.statCard}>
            <h3 className={styles.statTitle}>Drafts</h3>
            <div className={styles.statValue}>{allEvents.filter(e => e.status === 'Draft').length}</div>
            <div className={`${styles.statMeta} ${styles.metaPurple}`}>Work in progress</div>
          </div>
        </div> */}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {allEvents.map((event) => (
            <div key={event.id} className={styles.eventCard}>
              <div
                className={styles.eventPreview}
                style={{ background: event.color || '#f9a8d4', color: '#333' }}
              >
                {event.eventType}<br />Preview
              </div>

              <div className={styles.eventContent}>
                <h2 className={styles.eventTitle}>{event.title}</h2>
                <div className={styles.tag}>{event.eventType}</div>

                <div className={styles.detailsRow}>
                  <div className={styles.detailItem}>
                    📅 {event.date ? new Date(event.date).toLocaleDateString() : 'TBD'}
                  </div>
                  <div className={styles.detailItem}>
                    ⏰ {event.time || 'TBD'}
                  </div>
                  <div className={styles.detailItem}>
                    📍 {event.location || 'TBD'}
                  </div>
                </div>

                <div className={styles.actionRow}>
                  <button className={`${styles.actionBtn} ${styles.btnPurple}`} onClick={() => window.location.href = `/preview?id=${event.id}`}>✏️ Edit</button>
                  <button className={`${styles.actionBtn} ${styles.btnBlue}`}>👁️ Preview</button>
                  <button className={`${styles.actionBtn} ${styles.btnGreen}`}>⬇️ Download</button>
                  <button className={`${styles.actionBtn} ${styles.btnGray}`}>🔗 Share</button>
                  {event.id !== 'demo-1' && (
                    <button className={`${styles.actionBtn} ${styles.btnRed}`} onClick={() => handleDelete(event.id)}>🗑️ Delete</button>
                  )}
                </div>

                <div className={styles.statusBadge} style={{
                  background: event.status === 'Draft' ? '#fff7ed' : '#dcfce7',
                  color: event.status === 'Draft' ? '#c2410c' : '#16a34a'
                }}>
                  {event.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
