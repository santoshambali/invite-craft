'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { TEMPLATE_CATEGORIES, TEMPLATES } from '../../config/templates';

export default function TemplatesPage() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState('all');

    const filteredTemplates = selectedCategory === 'all'
        ? TEMPLATES
        : TEMPLATES.filter(t => t.category === selectedCategory);

    const selectTemplate = (template) => {
        if (typeof window !== 'undefined') {
            // Save the selected template details
            localStorage.setItem('previewData', JSON.stringify({
                templateId: template.id,
                title: 'Event Title',
                date: '',
                location: '',
                eventType: template.category.charAt(0).toUpperCase() + template.category.slice(1),
                // We pass the config forward so the customized preview knows how to render
                config: template.config
            }));
        }
        router.push('/preview');
    };

    return (
        <div className={styles.container}>
            <div className={styles.modal}>
                {/* <button
                    onClick={() => router.back()}
                    className={styles.backButton}
                    aria-label="Go back"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5" />
                        <path d="M12 19l-7-7 7-7" />
                    </svg>
                </button> */}

                {/* <header className={styles.header}>
                    <h1 className={styles.heading}>Choose a Template</h1>
                    <p className={styles.subtitle}>Start with a beautiful, professionally designed template</p>
                </header> */}

                <div className={styles.filters}>
                    {TEMPLATE_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            className={`${styles.filterPill} ${selectedCategory === cat.id ? styles.activePill : ''}`}
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                <div className={styles.scrollArea}>
                    <div className={styles.grid}>
                        {filteredTemplates.map((t) => (
                            <div
                                key={t.id}
                                className={styles.templateCard}
                                onClick={() => selectTemplate(t)}
                            >
                                <div
                                    className={styles.previewArea}
                                    style={{
                                        backgroundImage: `url(${t.image})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}
                                >
                                    {t.premium && <span className={styles.premiumBadge}>Premium</span>}
                                    <div className={styles.previewOverlay}>
                                        <span className={styles.useButton}>Use Template</span>
                                    </div>
                                </div>
                                <div className={styles.cardFooter}>
                                    <div className={styles.templateName}>{t.name}</div>
                                    <div className={styles.templateCategory}>
                                        {TEMPLATE_CATEGORIES.find(c => c.id === t.category)?.label || t.category}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
