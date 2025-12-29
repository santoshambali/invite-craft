export const TEMPLATE_CATEGORIES = [
    { id: 'all', label: 'All Templates' },
    { id: 'birthday', label: 'Birthday' },
    { id: 'wedding', label: 'Wedding' },
    { id: 'party', label: 'Party' },
    { id: 'announcement', label: 'Announcement' },
    { id: 'professional', label: 'Professional' },
];

export const TEMPLATES = [
    {
        id: 'birthday-pastel',
        name: 'Pastel Dream',
        category: 'birthday',
        image: '/templates/birthday_pastel_dream_1766462060366.png',
        premium: false,
        config: {
            background: 'url(/templates/birthday_pastel_dream_1766462060366.png) center/cover no-repeat',
            fontFamily: "'Comic Sans MS', 'Chalkboard SE', sans-serif",
            color: '#5D4037',
            textAlign: 'center',
            layout: {
                title: { fontSize: '3rem', fontWeight: 'bold', marginTop: '15vh', textShadow: '2px 2px 4px rgba(255,255,255,0.8)' },
                eventType: { fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' },
                details: { fontSize: '1.2rem', marginTop: '2rem', backgroundColor: 'rgba(255,255,255,0.6)', padding: '1rem', borderRadius: '1rem', display: 'inline-block' }
            }
        }
    },
    {
        id: 'birthday-modern',
        name: 'Modern Vibes',
        category: 'birthday',
        image: '/templates/modern_birthday_bg.png',
        premium: true,
        config: {
            background: 'url(/templates/modern_birthday_bg.png) center/cover no-repeat',
            fontFamily: "'Inter', sans-serif",
            color: '#1a1a1a',
            textAlign: 'left',
            layout: {
                container: { alignItems: 'flex-start', paddingLeft: '10%' },
                title: { fontSize: '4rem', fontWeight: '900', lineHeight: '0.9', marginTop: '20vh' },
                eventType: { fontSize: '1rem', fontWeight: '600', color: '#6366f1', textTransform: 'uppercase', marginBottom: '1rem' },
                details: { fontSize: '1.1rem', marginTop: '3rem', borderLeft: '4px solid #6366f1', paddingLeft: '1rem' }
            }
        }
    },
    {
        id: 'wedding-gold',
        name: 'Golden Elegance',
        category: 'wedding',
        image: '/templates/wedding_golden_elegance_1766462022352.png',
        premium: true,
        config: {
            background: 'url(/templates/wedding_golden_elegance_1766462022352.png) center/cover no-repeat',
            fontFamily: "'Playfair Display', serif",
            color: '#78350F',
            textAlign: 'center',
            layout: {
                title: { fontSize: '3.5rem', fontStyle: 'italic', marginTop: '25vh' },
                eventType: { fontSize: '1.2rem', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '2rem' },
                details: { fontSize: '1.1rem', marginTop: '3rem', fontFamily: "'Lato', sans-serif" }
            }
        }
    },
    {
        id: 'party-neon',
        name: 'Neon Night',
        category: 'party',
        image: '/templates/party_neon_vibes_1766462042447.png',
        premium: false,
        config: {
            background: 'url(/templates/party_neon_vibes_1766462042447.png) center/cover no-repeat',
            fontFamily: "'Montserrat', sans-serif",
            color: '#FFFFFF',
            textAlign: 'center',
            layout: {
                title: { fontSize: '3.5rem', fontWeight: '800', textShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff', marginTop: '20vh' },
                eventType: { fontSize: '1.5rem', letterSpacing: '2px', color: '#00ffff', textShadow: '0 0 5px #00ffff', marginBottom: '1rem' },
                details: { fontSize: '1.2rem', marginTop: '4rem', textShadow: '0 0 4px rgba(0,0,0,0.8)' }
            }
        }
    },
    {
        id: 'party-garden',
        name: 'Garden Tea',
        category: 'party',
        image: '/templates/party_garden_tea_1766462117592.png',
        premium: false,
        config: {
            background: 'url(/templates/party_garden_tea_1766462117592.png) center/cover no-repeat',
            fontFamily: "'Lora', serif",
            color: '#064E3B',
            textAlign: 'center',
            layout: {
                title: { fontSize: '3rem', fontWeight: 'normal', marginTop: '15vh' },
                eventType: { fontSize: '1rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#047857', marginBottom: '1.5rem' },
                details: { fontSize: '1.1rem', marginTop: '2rem', backgroundColor: 'rgba(255,255,255,0.85)', padding: '2rem', borderRadius: '50%', width: '300px', height: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', margin: '2rem auto' }
            }
        }
    },
    {
        id: 'corporate-blue',
        name: 'Corporate Meet',
        category: 'professional',
        image: '/templates/meeting_corporate_blue_1766462077968.png',
        premium: false,
        config: {
            background: 'url(/templates/meeting_corporate_blue_1766462077968.png) center/cover no-repeat',
            fontFamily: "'Roboto', sans-serif",
            color: '#FFFFFF',
            textAlign: 'left',
            layout: {
                container: { alignItems: 'flex-start', padding: '3rem' },
                title: { fontSize: '2.5rem', fontWeight: '700', marginTop: '10vh' },
                eventType: { fontSize: '1rem', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.8, marginBottom: '2rem' },
                details: { fontSize: '1rem', marginTop: '3rem', lineHeight: '2' }
            }
        }
    },
    {
        id: 'wedding-garden',
        name: 'Garden Wedding',
        category: 'wedding',
        image: '/templates/party_garden_tea_1766462117592.png',
        premium: false,
        config: {
            background: 'url(/templates/party_garden_tea_1766462117592.png) center/cover no-repeat',
            fontFamily: "'Cormorant Garamond', serif",
            color: '#2F4F4F',
            textAlign: 'center',
            layout: {
                title: { fontSize: '4rem', fontWeight: 'bold', marginTop: '10vh', letterSpacing: '2px', color: '#2F4F4F' },
                eventType: { fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '4rem' },
                details: { fontSize: '1.4rem', fontWeight: '500', marginTop: 'auto', marginBottom: '10vh', textShadow: '1px 1px 2px white' }
            }
        }
    },
    {
        id: 'announcement-white',
        name: 'Minimalist',
        category: 'announcement',
        image: '/templates/announcement_minimal_white_1766462096620.png',
        premium: false,
        config: {
            background: 'url(/templates/announcement_minimal_white_1766462096620.png) center/cover no-repeat',
            fontFamily: "'Helvetica Neue', sans-serif",
            color: '#000000',
            textAlign: 'center',
            layout: {
                title: { fontSize: '2.5rem', fontWeight: '300', marginTop: '25vh' },
                eventType: { fontSize: '0.9rem', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '3rem' },
                details: { fontSize: '1rem', marginTop: '2rem', color: '#666' }
            }
        }
    }
];
