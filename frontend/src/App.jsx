/* Copyright (c) 2025 ot6_j. All Rights Reserved. */

import { useState } from 'react';
import Sidebar from './components/Sidebar';
import NeuroRadiology from './components/departments/NeuroRadiology';
import Dermatology from './components/departments/Dermatology';
import Pharmacy from './components/departments/Pharmacy';
import Surgery from './components/departments/Surgery';
import Icon from './components/Icon';
import CountUp from 'react-countup';

// --- CONFIGURATION API ---
// Lien vers votre Backend hébergé sur Hugging Face
export const API_URL = "https://ot6jj-medivision-backend.hf.space";

function Dashboard() {
    return (
        <div style={{ padding: '0', maxWidth: '100%', margin: '0 auto', overflowX: 'hidden' }}>
            {/* HERO SECTION */}
            <div className="fade-in" style={{
                background: 'linear-gradient(135deg, var(--sky-500) 0%, var(--sky-700) 100%)',
                padding: '4rem 2rem 8rem 2rem', // Extra bottom padding for overlap
                borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
                color: 'white',
                marginBottom: '-4rem', // Negative margin for card overlap
                position: 'relative',
                zIndex: 1
            }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ maxWidth: '600px' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 12px',
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            marginBottom: '1rem',
                            border: '1px solid rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(4px)'
                        }}>
                            <span style={{ position: 'relative', display: 'flex', height: '8px', width: '8px' }}>
                                <span style={{ animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite', position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '50%', backgroundColor: '#4ade80', opacity: 0.75 }}></span>
                                <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', height: '8px', width: '8px', backgroundColor: '#4ade80' }}></span>
                            </span>
                            SYS: ONLINE • v1.0
                        </div>
                        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '1.5rem', letterSpacing: '-0.02em', textShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            MediVision <span style={{ color: '#bae6fd' }}>360</span>
                        </h1>
                        <p style={{ fontSize: '1.1rem', color: '#e0f2fe', lineHeight: '1.6', marginBottom: '2rem', maxWidth: '90%' }}>
                            Plateforme d'analyse médicale unifiée assistée par Intelligence Artificielle.
                            Neuro-radiologie, Dermatologie, Chirurgie et Pharmacie.
                        </p>
                    </div>

                    {/* Stats Rapides (Style Dashboard) */}
                    <div style={{
                        display: 'flex',
                        gap: '2rem',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        padding: '24px',
                        borderRadius: '24px',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8, marginBottom: '4px' }}>Analyses</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: '1' }}>
                                <CountUp end={1284} duration={2.5} separator="," />
                            </div>
                        </div>
                        <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
                        <div>
                            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8, marginBottom: '4px' }}>Précision IA</div>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: '1', color: '#86efac' }}>
                                <CountUp end={98.5} decimals={1} suffix="%" duration={3} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FEATURES GRID */}
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 2 }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '4rem'
                }}>
                    {[
                        { title: 'Neuro-Radiologie', desc: 'Détection et segmentation de tumeurs cérébrales via ResNet50 & U-Net.', icon: 'brain', color: 'var(--sky-500)' },
                        { title: 'Dermatologie', desc: 'Analyse des lésions cutanées, brûlures et détection de mélanomes.', icon: 'dna', color: 'var(--emerald-500)' },
                        { title: 'Chirurgie', desc: 'Monitoring vidéo temps réel des instruments et alertes de sécurité.', icon: 'surgery', color: 'var(--amber-500)' },
                        { title: 'Pharmacie', desc: 'Identification instantanée et vérification des contre-indications.', icon: 'pill', color: 'var(--violet-500)' },
                    ].map((feature, idx) => (
                        <div key={idx} className="glass-panel" style={{
                            padding: '2rem',
                            borderRadius: '24px',
                            background: 'var(--slate-800)', // Fallback
                            border: '1px solid var(--slate-700)',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            cursor: 'default'
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '14px',
                                backgroundColor: `${feature.color}20`, // 20% opacity
                                color: feature.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.5rem'
                            }}>
                                <Icon name={feature.icon} className="w-8 h-8" />
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--slate-100)' }}>{feature.title}</h3>
                            <p style={{ color: 'var(--slate-400)', lineHeight: '1.6' }}>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function App() {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [darkMode, setDarkMode] = useState(true);

    const renderPage = () => {
        switch (currentPage) {
            case 'neuro':
                // On passe l'URL de l'API en 'prop' pour que le composant puisse l'utiliser
                return <NeuroRadiology apiUrl={API_URL} />;
            case 'derma':
                return <Dermatology apiUrl={API_URL} />;
            case 'pharma':
                return <Pharmacy apiUrl={API_URL} />;
            case 'surgery':
                return <Surgery apiUrl={API_URL} />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div
            data-theme={darkMode ? 'dark' : 'light'}
            style={{
                display: 'flex',
                minHeight: '100vh',
                // Removed explicit background color here to let CSS vars handle it safely
                backgroundColor: 'var(--slate-900)',
                color: 'var(--slate-50)',
                transition: 'background-color 0.3s ease, color 0.3s ease'
            }}
        >
            {/* Sidebar */}
            <Sidebar
                activePage={currentPage}
                onNavigate={setCurrentPage}
                darkMode={darkMode}
                onToggleTheme={() => setDarkMode(!darkMode)}
            />

            {/* Main Content Area */}
            <main style={{
                marginLeft: '280px',
                flex: 1,
                minHeight: '100vh',
                position: 'relative'
            }}>
                {renderPage()}
            </main>
        </div>
    );
}

export default App;