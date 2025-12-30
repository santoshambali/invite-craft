'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import { TEMPLATE_CATEGORIES, TEMPLATES } from '../config/templates';

export default function TemplatesPage() {
    const router = useRouter();
    const [filter, setFilter] = useState('all');

    const filteredTemplates = filter === 'all'
        ? TEMPLATES
        : TEMPLATES.filter(t => t.category === filter);

    const handleUseTemplate = (template) => {
        // Store selected template data for Preview/Editor
        if (typeof window !== 'undefined') {
            localStorage.setItem('previewData', JSON.stringify({
                templateId: template.id,
                category: template.category,
                title: '',
                date: '',
                location: '',
                eventType: '',
                config: template.config
            }));
        }

        if (template.category === 'birthday') {
            router.push('/create/birthday');
        } else {
            router.push('/preview'); // Navigate to generic editor
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Browse Templates</h1>
            <p className={styles.subtitle}>Start with a professionally designed template</p>

            <div className={styles.filterBar}>
                {TEMPLATE_CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        className={`${styles.filterBtn} ${filter === cat.id ? styles.activeFilter : ''}`}
                        onClick={() => setFilter(cat.id)}
                    >
                        {cat.label}
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
                                alt={template.name}
                                className={styles.previewImage}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                priority={template.id === 'birthday-modern'}
                            />
                            <div className={styles.previewOverlay}>
                                <span className={styles.overlayBtn}>Use Template</span>
                            </div>
                        </div>
                        <div className={styles.content}>
                            <div className={styles.cardCategory}>
                                {TEMPLATE_CATEGORIES.find(c => c.id === template.category)?.label || template.category}
                            </div>
                            <h3 className={styles.cardTitle}>{template.name}</h3>
                            <p className={styles.cardDesc}>{template.description || `Beautiful ${template.category} invitation template.`}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
