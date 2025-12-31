export const TEMPLATE_CATEGORIES = [
    { id: 'all', label: 'All Templates' },
    { id: 'birthday', label: 'Birthday' },
    { id: 'wedding', label: 'Wedding' },
    { id: 'new-year', label: 'New Year' },
];

export const TEMPLATES = [
    {
        id: 'birthday-cosmic',
        name: 'Cosmic Celebration',
        category: 'birthday',
        image: '/templates/new_year_cosmic_1767107981495.png',
        premium: false,
        config: {
            background: 'url(/templates/new_year_cosmic_1767107981495.png) center/cover no-repeat',
            fontFamily: "'Inter', sans-serif",
            color: '#FFFFFF',
            textAlign: 'center',
            layout: {
                container: { justifyContent: 'center' },
                title: { fontSize: '4.5rem', fontWeight: '900', letterSpacing: '-2px', textShadow: '0 0 30px rgba(147, 51, 234, 0.8)' },
                eventType: { fontSize: '1rem', fontWeight: 'bold', color: '#a855f7', textTransform: 'uppercase', letterSpacing: '10px', marginBottom: '4rem' },
                details: { fontSize: '1.1rem', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', padding: '2rem', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.2)' }
            }
        }
    },
    {
        id: 'wedding-timeless',
        name: 'Rose Gold Romance',
        category: 'wedding',
        image: '/templates/new_year_rosegold_1767108020891.png',
        premium: false,
        config: {
            background: 'url(/templates/new_year_rosegold_1767108020891.png) center/cover no-repeat',
            fontFamily: "'Playfair Display', serif",
            color: '#5d3a3a',
            textAlign: 'center',
            layout: {
                container: { justifyContent: 'center' },
                title: {
                    fontSize: '4.5rem',
                    fontWeight: '400',
                    fontStyle: 'italic',
                    color: '#b76e79',
                    marginBottom: '1rem',
                    textShadow: '2px 2px 4px rgba(255, 255, 255, 0.5)'
                },
                eventType: {
                    fontSize: '1rem',
                    letterSpacing: '6px',
                    textTransform: 'uppercase',
                    color: '#c9a0a8',
                    fontWeight: '600',
                    marginBottom: '4rem'
                },
                details: {
                    fontSize: '1.2rem',
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(12px)',
                    padding: '3rem 2rem',
                    borderRadius: '20px',
                    border: '2px solid rgba(183, 110, 121, 0.2)',
                    boxShadow: '0 8px 32px rgba(183, 110, 121, 0.1)',
                    maxWidth: '450px',
                    margin: '0 auto',
                    lineHeight: '2',
                    color: '#5d3a3a'
                }
            }
        }
    },
    {
        id: 'new-year-elegant',
        name: 'Midnight Sparkle',
        category: 'new-year',
        image: '/templates/new_year_midnight_sparkle_1767086061674.png',
        premium: false,
        config: {
            background: '#000000 url(/templates/new_year_midnight_sparkle_1767086061674.png) center/cover no-repeat',
            fontFamily: "'Playfair Display', serif",
            color: '#FFD700',
            textAlign: 'center',
            layout: {
                container: {
                    justifyContent: 'center',
                    padding: '3rem 2rem'
                },
                content: {
                    justifyContent: 'center',
                    alignItems: 'center'
                },
                eventType: {
                    fontSize: '0.85rem',
                    letterSpacing: '5px',
                    textTransform: 'uppercase',
                    marginBottom: '1.5rem',
                    color: '#FFD700',
                    fontWeight: '600',
                    textShadow: '0 0 20px rgba(255, 215, 0, 0.6), 2px 2px 4px rgba(0,0,0,0.8)'
                },
                title: {
                    fontSize: '3.8rem',
                    fontWeight: '700',
                    marginBottom: '2rem',
                    lineHeight: '1.1',
                    color: '#FFFFFF',
                    textShadow: '0 0 30px rgba(255, 215, 0, 0.5), 0 0 10px rgba(255, 215, 0, 0.3), 3px 3px 6px rgba(0,0,0,0.9)',
                    letterSpacing: '2px'
                },
                details: {
                    fontSize: '1.15rem',
                    marginTop: '2.5rem',
                    color: '#FFFFFF',
                    lineHeight: '2',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.9), 0 0 10px rgba(255, 215, 0, 0.2)',
                    fontWeight: '400',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    padding: '1.5rem 2rem',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 215, 0, 0.2)'
                }
            }
        }
    },

    {
        id: 'new-year-snowy',
        name: 'Snowy Soiree',
        category: 'new-year',
        image: '/templates/new_year_snowy_celebration.png',
        premium: false,
        config: {
            background: 'url(/templates/new_year_snowy_celebration.png) center/cover no-repeat',
            fontFamily: "'Lora', serif",
            color: '#2C3E50',
            textAlign: 'center',
            layout: {
                container: { justifyContent: 'center' },
                title: {
                    fontSize: '3.5rem',
                    fontWeight: '700',
                    color: '#1A252F',
                    textShadow: '0 0 20px rgba(255,255,255,0.8)',
                    marginBottom: '1rem'
                },
                eventType: {
                    fontSize: '1rem',
                    letterSpacing: '4px',
                    textTransform: 'uppercase',
                    color: '#5D6D7E',
                    marginBottom: '3rem'
                },
                details: {
                    fontSize: '1.1rem',
                    marginTop: '2rem',
                    background: 'rgba(255, 255, 255, 0.7)',
                    padding: '2.5rem',
                    borderRadius: '50% 50% 0 0',
                    width: '350px',
                    margin: '0 auto',
                    border: '1px solid rgba(255,255,255,0.3)',
                    backdropFilter: 'blur(5px)'
                }
            }
        }
    },
    {
        id: 'new-year-romantic',
        name: 'Romantic Midnight',
        category: 'new-year',
        image: '/templates/new_year_romantic_couple.png',
        premium: false,
        config: {
            background: 'url(/templates/new_year_romantic_couple.png) center/cover no-repeat',
            fontFamily: "'Playfair Display', serif",
            color: '#FFFFFF',
            textAlign: 'center',
            layout: {
                container: {
                    justifyContent: 'flex-start',
                    paddingTop: '8vh'
                },
                title: {
                    fontSize: '3.5rem',
                    fontWeight: '700',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                    marginBottom: '1rem',
                    color: '#FFDF00'
                },
                eventType: {
                    fontSize: '1.2rem',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    marginBottom: '2rem',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                },
                details: {
                    fontSize: '1.1rem',
                    marginTop: 'auto',
                    marginBottom: '5vh',
                    background: 'rgba(0, 0, 0, 0.4)',
                    padding: '2rem',
                    borderRadius: '15px',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    maxWidth: '80%',
                    margin: '0 auto'
                }
            }
        }
    },
    {
        id: 'new-year-glam',
        name: 'Glamorous Toast',
        category: 'new-year',
        image: '/templates/new_year_couple_glam.png',
        premium: false,
        config: {
            background: 'url(/templates/new_year_couple_glam.png) center/cover no-repeat',
            fontFamily: "'Montserrat', sans-serif",
            color: '#FFFFFF',
            textAlign: 'center',
            layout: {
                container: {
                    justifyContent: 'center',
                    alignItems: 'center'
                },
                title: {
                    fontSize: '4rem',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '-2px',
                    lineHeight: '0.9',
                    marginBottom: '1.5rem',
                    textShadow: '0 0 20px rgba(0,0,0,0.8)'
                },
                eventType: {
                    fontSize: '1rem',
                    letterSpacing: '5px',
                    textTransform: 'uppercase',
                    color: '#d4af37',
                    fontWeight: 'bold',
                    marginBottom: '2rem'
                },
                details: {
                    fontSize: '1.1rem',
                    padding: '1.5rem',
                    borderTop: '2px solid #d4af37',
                    borderBottom: '2px solid #d4af37',
                    display: 'inline-block',
                    marginTop: '2rem',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)'
                }
            }
        }
    },
    {
        id: 'new-year-minimalist',
        name: 'Minimalist Chic',
        category: 'new-year',
        image: '/templates/new_year_minimalist_1767107919645.png',
        premium: false,
        config: {
            background: 'url(/templates/new_year_minimalist_1767107919645.png) center/cover no-repeat',
            fontFamily: "'Inter', sans-serif",
            color: '#1a1a2e',
            textAlign: 'center',
            layout: {
                container: {
                    justifyContent: 'center',
                    alignItems: 'center'
                },
                title: {
                    fontSize: '4.5rem',
                    fontWeight: '700',
                    letterSpacing: '-3px',
                    lineHeight: '1',
                    marginBottom: '1rem',
                    color: '#0f3460',
                    textShadow: '2px 2px 0px rgba(212, 175, 55, 0.3)'
                },
                eventType: {
                    fontSize: '0.9rem',
                    letterSpacing: '6px',
                    textTransform: 'uppercase',
                    color: '#d4af37',
                    fontWeight: '600',
                    marginBottom: '2.5rem'
                },
                details: {
                    fontSize: '1.15rem',
                    padding: '2rem 3rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '8px',
                    maxWidth: '500px',
                    margin: '0 auto',
                    lineHeight: '1.8',
                    border: '1px solid rgba(212, 175, 55, 0.3)'
                }
            }
        }
    },
    {
        id: 'new-year-neon',
        name: 'Neon Nights',
        category: 'new-year',
        image: '/templates/new_year_neon_1767107944356.png',
        premium: false,
        config: {
            background: 'url(/templates/new_year_neon_1767107944356.png) center/cover no-repeat',
            fontFamily: "'Outfit', sans-serif",
            color: '#FFFFFF',
            textAlign: 'center',
            layout: {
                container: {
                    justifyContent: 'center',
                    alignItems: 'center'
                },
                title: {
                    fontSize: '4.2rem',
                    fontWeight: '900',
                    textTransform: 'uppercase',
                    letterSpacing: '3px',
                    marginBottom: '1.5rem',
                    color: '#FFFFFF',
                    textShadow: '0 0 30px rgba(255, 0, 255, 0.8), 0 0 60px rgba(0, 255, 255, 0.6), 3px 3px 0px rgba(0,0,0,0.5)'
                },
                eventType: {
                    fontSize: '1.1rem',
                    letterSpacing: '8px',
                    textTransform: 'uppercase',
                    color: '#00ffff',
                    fontWeight: 'bold',
                    marginBottom: '2rem',
                    textShadow: '0 0 20px rgba(0, 255, 255, 0.8)'
                },
                details: {
                    fontSize: '1.2rem',
                    padding: '2rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '16px',
                    border: '2px solid rgba(255, 0, 255, 0.5)',
                    boxShadow: '0 0 30px rgba(255, 0, 255, 0.4), inset 0 0 20px rgba(0, 255, 255, 0.2)',
                    maxWidth: '600px',
                    margin: '0 auto',
                    lineHeight: '1.8'
                }
            }
        }
    },
    {
        id: 'new-year-artdeco',
        name: 'Art Deco Glam',
        category: 'new-year',
        image: '/templates/new_year_artdeco_1767107965363.png',
        premium: false,
        config: {
            background: 'url(/templates/new_year_artdeco_1767107965363.png) center/cover no-repeat',
            fontFamily: "'Playfair Display', serif",
            color: '#d4af37',
            textAlign: 'center',
            layout: {
                container: {
                    justifyContent: 'center',
                    alignItems: 'center'
                },
                title: {
                    fontSize: '4.5rem',
                    fontWeight: '700',
                    fontStyle: 'italic',
                    letterSpacing: '2px',
                    marginBottom: '1.5rem',
                    color: '#d4af37',
                    textShadow: '3px 3px 0px rgba(0, 0, 0, 0.8), 0 0 20px rgba(212, 175, 55, 0.5)'
                },
                eventType: {
                    fontSize: '1rem',
                    letterSpacing: '8px',
                    textTransform: 'uppercase',
                    color: '#FFFFFF',
                    fontWeight: '600',
                    marginBottom: '2.5rem',
                    fontFamily: "'Montserrat', sans-serif"
                },
                details: {
                    fontSize: '1.2rem',
                    padding: '2.5rem 3rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: '3px solid #d4af37',
                    borderRadius: '4px',
                    maxWidth: '550px',
                    margin: '0 auto',
                    lineHeight: '1.9',
                    color: '#FFFFFF',
                    boxShadow: 'inset 0 0 30px rgba(212, 175, 55, 0.2)'
                }
            }
        }
    },
    {
        id: 'new-year-cosmic',
        name: 'Cosmic Dreams',
        category: 'new-year',
        image: '/templates/new_year_cosmic_1767107981495.png',
        premium: false,
        config: {
            background: 'url(/templates/new_year_cosmic_1767107981495.png) center/cover no-repeat',
            fontFamily: "'Poppins', sans-serif",
            color: '#FFFFFF',
            textAlign: 'center',
            layout: {
                container: {
                    justifyContent: 'center',
                    alignItems: 'center'
                },
                title: {
                    fontSize: '4rem',
                    fontWeight: '600',
                    letterSpacing: '1px',
                    marginBottom: '1.5rem',
                    color: '#E0BBE4',
                    textShadow: '0 0 40px rgba(224, 187, 228, 0.8), 0 0 20px rgba(147, 112, 219, 0.6), 2px 2px 4px rgba(0,0,0,0.8)'
                },
                eventType: {
                    fontSize: '1rem',
                    letterSpacing: '6px',
                    textTransform: 'uppercase',
                    color: '#B19CD9',
                    fontWeight: '500',
                    marginBottom: '2rem',
                    textShadow: '0 0 15px rgba(177, 156, 217, 0.8)'
                },
                details: {
                    fontSize: '1.15rem',
                    padding: '2rem 2.5rem',
                    backgroundColor: 'rgba(25, 25, 60, 0.7)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '20px',
                    border: '1px solid rgba(224, 187, 228, 0.3)',
                    boxShadow: '0 0 40px rgba(147, 112, 219, 0.3)',
                    maxWidth: '550px',
                    margin: '0 auto',
                    lineHeight: '1.9'
                }
            }
        }
    },
    {
        id: 'new-year-tropical',
        name: 'Tropical Paradise',
        category: 'new-year',
        image: '/templates/new_year_tropical_1767108001208.png',
        premium: false,
        config: {
            background: 'url(/templates/new_year_tropical_1767108001208.png) center/cover no-repeat',
            fontFamily: "'Quicksand', sans-serif",
            color: '#FFFFFF',
            textAlign: 'center',
            layout: {
                container: {
                    justifyContent: 'center',
                    alignItems: 'center'
                },
                title: {
                    fontSize: '4.2rem',
                    fontWeight: '700',
                    letterSpacing: '1px',
                    marginBottom: '1.5rem',
                    color: '#FFFFFF',
                    textShadow: '3px 3px 6px rgba(0, 0, 0, 0.7), 0 0 30px rgba(255, 165, 0, 0.5)'
                },
                eventType: {
                    fontSize: '1.1rem',
                    letterSpacing: '5px',
                    textTransform: 'uppercase',
                    color: '#FFD700',
                    fontWeight: '700',
                    marginBottom: '2rem',
                    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)'
                },
                details: {
                    fontSize: '1.2rem',
                    padding: '2rem 3rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '25px',
                    border: '2px solid rgba(255, 215, 0, 0.4)',
                    maxWidth: '580px',
                    margin: '0 auto',
                    lineHeight: '1.8',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                }
            }
        }
    },
    {
        id: 'new-year-rosegold',
        name: 'Rose Gold Elegance',
        category: 'new-year',
        image: '/templates/new_year_rosegold_1767108020891.png',
        premium: false,
        config: {
            background: 'url(/templates/new_year_rosegold_1767108020891.png) center/cover no-repeat',
            fontFamily: "'Cormorant Garamond', serif",
            color: '#8B4C5C',
            textAlign: 'center',
            layout: {
                container: {
                    justifyContent: 'center',
                    alignItems: 'center'
                },
                title: {
                    fontSize: '4.5rem',
                    fontWeight: '600',
                    fontStyle: 'italic',
                    letterSpacing: '2px',
                    marginBottom: '1.5rem',
                    color: '#B76E79',
                    textShadow: '2px 2px 4px rgba(255, 255, 255, 0.5), 0 0 20px rgba(183, 110, 121, 0.4)'
                },
                eventType: {
                    fontSize: '0.95rem',
                    letterSpacing: '7px',
                    textTransform: 'uppercase',
                    color: '#C9A0A8',
                    fontWeight: '600',
                    marginBottom: '2.5rem',
                    fontFamily: "'Lato', sans-serif"
                },
                details: {
                    fontSize: '1.15rem',
                    padding: '2.5rem 3rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.75)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '15px',
                    border: '2px solid rgba(183, 110, 121, 0.3)',
                    maxWidth: '520px',
                    margin: '0 auto',
                    lineHeight: '1.9',
                    color: '#5D3A3A',
                    boxShadow: '0 8px 32px rgba(183, 110, 121, 0.2)'
                }
            }
        }
    }
];
