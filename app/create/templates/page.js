'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../../components/Sidebar';
import styles from './page.module.css';

const TEMPLATES = [
    { id: 1, name: 'Elegant Gold', category: 'Birthday', color: '#fcd34d', premium: true },
    { id: 2, name: 'Floral Spring', category: 'Wedding', color: '#f9a8d4', premium: false },
    { id: 3, name: 'Modern Blue', category: 'Birthday', color: '#93c5fd', premium: false },
    { id: 4, name: 'Vintage Rose', category: 'Anniversary', color: '#fbcfe8', premium: true },
    { id: 5, name: 'Baby Clouds', category: 'Baby Shower', color: '#bfdbfe', premium: false },
    { id: 6, name: 'Minimalist White', category: 'All', color: '#f3f4f6', premium: false }, // "All" category acts as a general one
];

const ALLOWED_CATEGORIES = ['All', 'Birthday', 'Wedding', 'Anniversary', 'Baby Shower', 'Graduation'];

export default function TemplatesPage() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState('All');

    const filteredTemplates = selectedCategory === 'All'
        ? TEMPLATES
        : TEMPLATES.filter(t => t.category === selectedCategory || t.category === 'All');

    const selectTemplate = (template) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('previewData', JSON.stringify({
                ...template,
                isAI: false,
                title: 'Event Title',
                date: '',
                location: '',
            }));
        }
        router.push('/preview');
    };

    return (
        <div className={styles.layout}>
            <Sidebar />

            <main className={styles.mainContent}>
                <header className={styles.header}>
                    <h1 className={styles.heading}>Choose a Template</h1>
                    <p className={styles.subtitle}>Start with a beautiful pre-designed template</p>
                </header>

                <div className={styles.filters}>
                    {ALLOWED_CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            className={`${styles.filterPill} ${selectedCategory === cat ? styles.activePill : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className={styles.grid}>
                    {filteredTemplates.map((t) => (
                        <div
                            key={t.id}
                            className={styles.templateCard}
                            onClick={() => selectTemplate(t)}
                        >
                            <div
                                className={styles.previewArea}
                                style={{ background: t.color }}
                            >
                                {t.premium && <span className={styles.premiumBadge}>Premium</span>}
                            </div>
                            <div className={styles.cardFooter}>
                                <div className={styles.templateName}>{t.name}</div>
                                <div className={styles.templateCategory}>{t.category}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
