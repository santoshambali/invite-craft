'use client';

import { useState } from 'react';
import Image from 'next/image';

import styles from './page.module.css';
import { useRouter } from 'next/navigation';

export default function TemplatesPage() {
    const router = useRouter();
    const [filter, setFilter] = useState('All');

    const categories = ['All', 'Birthday', 'Wedding', 'Party', 'Meeting', 'Announcement'];

    const templates = [
        {
            id: 1,
            title: 'Golden Elegance',
            category: 'Wedding',
            color: '#fef3c7',
            image: '/templates/wedding_golden_elegance_1766462022352.png',
            description: 'Luxurious wedding invitation with golden accents'
        },
        {
            id: 2,
            title: 'Neon Party',
            category: 'Party',
            color: '#171717',
            image: '/templates/party_neon_vibes_1766462042447.png',
            description: 'Vibrant nightclub-style party invitation'
        },
        {
            id: 4,
            title: 'Corporate Blue',
            category: 'Meeting',
            color: '#eff6ff',
            image: '/templates/meeting_corporate_blue_1766462077968.png',
            description: 'Professional business meeting invitation'
        },
        {
            id: 5,
            title: 'Minimalist White',
            category: 'Announcement',
            color: '#f8fafc',
            image: '/templates/announcement_minimal_white_1766462096620.png',
            description: 'Clean and elegant announcement card'
        },
        {
            id: 6,
            title: 'Garden Tea',
            category: 'Party',
            color: '#dcfce7',
            image: '/templates/party_garden_tea_1766462117592.png',
            description: 'Botanical garden party invitation'
        },
    ];

    const filteredTemplates = filter === 'All'
        ? templates
        : templates.filter(t => t.category === filter);

    const handleUseTemplate = (template) => {
        // Store selected template data for Preview/Editor
        // We'll pass this via localStorage or URL params
        const eventData = {
            title: template.title,
            eventType: template.category,
            theme: template.title,
            color: template.color,
            category: template.category,
            image: template.image
        };

        localStorage.setItem('previewData', JSON.stringify(eventData));

        if (template.category === 'Birthday') {
            router.push('/create/birthday');
        } else {
            router.push('/preview'); // Navigate to generic editor
        }
    };

    return (
        <div>

            <div className={styles.container}>
                <h1 className={styles.title}>Browse Templates</h1>
                <p className={styles.subtitle}>Start with a professionally designed template</p>

                <div className={styles.filterBar}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`${styles.filterBtn} ${filter === cat ? styles.activeFilter : ''}`}
                            onClick={() => setFilter(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className={styles.grid}>
                    {filteredTemplates.map(template => (
                        <div
                            key={template.id}
                            className={styles.card}
                            onClick={() => handleUseTemplate(template)}
                        >
                            <div className={styles.preview}>
                                <Image
                                    src={template.image}
                                    alt={template.title}
                                    className={styles.previewImage}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    priority={template.id <= 3}
                                />
                                <div className={styles.previewOverlay}>
                                    <span className={styles.overlayBtn}>Use Template</span>
                                </div>
                            </div>
                            <div className={styles.content}>
                                <div className={styles.cardCategory}>{template.category}</div>
                                <h3 className={styles.cardTitle}>{template.title}</h3>
                                <p className={styles.cardDesc}>{template.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
