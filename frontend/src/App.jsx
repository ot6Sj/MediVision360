/* Copyright (c) 2025 ot6_j. All Rights Reserved. */

import React, { useState, useEffect } from 'react';

// --- 1. CONFIGURATION API (BACKEND) ---
// C'est ici que l'on connecte le Frontend au Cerveau (Hugging Face)
export const API_URL = "https://ot6jj-medivision-backend.hf.space";

// --- 2. COMPOSANTS UTILITAIRES (Pour remplacer les imports manquants) ---

// Remplacement de 'react-countup' pour éviter l'erreur de dépendance
const CountUp = ({ end, duration = 2, decimals = 0, suffix = "" }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let startTime;
        let animationFrame;
        const animate = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / (duration * 1000), 1);
            const ease = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);
            setCount(end * ease);
            if (percentage < 1) animationFrame = requestAnimationFrame(animate);
        };
        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration]);
    return <span>{count.toFixed(decimals)}{suffix}</span>;
};

// Remplacement de './components/Icon'
const Icon = ({ name, className = "w-6 h-6" }) => {
    const icons = {
        brain: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
        dna: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
        pill: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 13.5L13.5 10.5M16.5 16.5L19.5 13.5M7.5 7.5L4.5 10.5M10.5 4.5L13.5 7.5M16.5 4.5L19.5 7.5M4.5 16.5L7.5 13.5M12 12L12 12" /></svg>,
        surgery: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>,
        upload: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>,
        dashboard: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
    };
    return icons[name] || null;
};

// --- 3. COMPOSANTS MÉTIER (Pages des Départements) ---
// Notez l'utilisation de la prop `apiUrl` pour les appels backend

const NeuroRadiology = ({ apiUrl }) => (
    <div style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'white', marginBottom: '1.5rem' }}>🧠 Neuro-Radiologie</h2>
        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '1rem', padding: '2rem', textAlign: 'center' }}>
            <div style={{ marginBottom: '1.5rem', display: 'inline-flex', padding: '1rem', backgroundColor: '#0f172a', borderRadius: '9999px', color: '#64748b' }}>
                <Icon name="upload" className="w-8 h-8" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '500', color: 'white', marginBottom: '0.5rem' }}>Charger une IRM Cérébrale</h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Glissez votre fichier DICOM ou JPG ici pour l'analyse ResNet50.</p>
            <p style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#06b6d4', backgroundColor: 'rgba(8, 51, 68, 0.5)', padding: '0.5rem 1rem', borderRadius: '0.25rem', display: 'inline-block' }}>
                Target API: {apiUrl}/predict/neuro
            </p>
        </div>
    </div>
);

const Dermatology = ({ apiUrl }) => (
    <div style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'white', marginBottom: '1.5rem' }}>🧬 Dermatologie</h2>
        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '1rem', padding: '2rem', textAlign: 'center' }}>
            <div style={{ marginBottom: '1.5rem', display: 'inline-flex', padding: '1rem', backgroundColor: '#0f172a', borderRadius: '9999px', color: '#64748b' }}>
                <Icon name="upload" className="w-8 h-8" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '500', color: 'white', marginBottom: '0.5rem' }}>Analyser une lésion</h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Détection multi-modale (Cancer, Brûlure) via CLIP.</p>
            <p style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#10b981', backgroundColor: 'rgba(2, 44, 34, 0.5)', padding: '0.5rem 1rem', borderRadius: '0.25rem', display: 'inline-block' }}>
                Target API: {apiUrl}/predict/derma
            </p>
        </div>
    </div>
);

const Surgery = ({ apiUrl }) => (
    <div style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'white', marginBottom: '1.5rem' }}>🤖 Chirurgie</h2>
        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '1rem', padding: '2rem', textAlign: 'center' }}>
            <div style={{ marginBottom: '1.5rem', display: 'inline-flex', padding: '1rem', backgroundColor: '#0f172a', borderRadius: '9999px', color: '#64748b' }}>
                <Icon name="upload" className="w-8 h-8" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '500', color: 'white', marginBottom: '0.5rem' }}>Monitoring Vidéo</h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Flux vidéo temps réel pour détection d'instruments.</p>
            <p style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#f59e0b', backgroundColor: 'rgba(69, 26, 3, 0.5)', padding: '0.5rem 1rem', borderRadius: '0.25rem', display: 'inline-block' }}>
                Target API: {apiUrl}/predict/surgery
            </p>
        </div>
    </div>
);

const Pharmacy = ({ apiUrl }) => (
    <div style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'white', marginBottom: '1.5rem' }}>💊 Pharmacie</h2>
        <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '1rem', padding: '2rem', textAlign: 'center' }}>
            <div style={{ marginBottom: '1.5rem', display: 'inline-flex', padding: '1rem', backgroundColor: '#0f172a', borderRadius: '9999px', color: '#64748b' }}>
                <Icon name="upload" className="w-8 h-8" />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '500', color: 'white', marginBottom: '0.5rem' }}>Scan Médicament</h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Reconnaissance par Code-Barres ou OCR + API Gouv.</p>
            <p style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#8b5cf6', backgroundColor: 'rgba(46, 16, 101, 0.5)', padding: '0.5rem 1rem', borderRadius: '0.25rem', display: 'inline-block' }}>
                Target API: {apiUrl}/predict/pharma
            </p>
        </div>
    </div>
);

// --- 4. COMPOSANT SIDEBAR ---
const Sidebar = ({ activePage, onNavigate }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { id: 'neuro', label: 'Neuro-Radio', icon: 'brain' },
        { id: 'derma', label: 'Dermatologie', icon: 'dna' },
        { id: 'surgery', label: 'Chirurgie', icon: 'surgery' },
        { id: 'pharma', label: 'Pharmacie', icon: 'pill' },
    ];

    return (
        <div style={{ width: '280px', height: '100vh', position: 'fixed', left: 0, top: 0, backgroundColor: '#0f172a', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column', zIndex: 50 }}>
            <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', borderRadius: '8px' }}></div>
                <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', letterSpacing: '-0.025em' }}>MediVision<span style={{ color: '#06b6d4' }}>360</span></h1>
            </div>
            <nav style={{ flex: 1, padding: '0 1rem' }}>
                {menuItems.map((item) => (
                    <button key={item.id} onClick={() => onNavigate(item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', marginBottom: '0.5rem', borderRadius: '12px', transition: 'all 0.2s', backgroundColor: activePage === item.id ? 'rgba(6, 182, 212, 0.1)' : 'transparent', color: activePage === item.id ? '#06b6d4' : '#94a3b8', border: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem', fontWeight: activePage === item.id ? '600' : '500' }}>
                        <Icon name={item.icon} className={activePage === item.id ? "w-5 h-5 text-cyan-400" : "w-5 h-5"} />
                        {item.label}
                    </button>
                ))}
            </nav>
        </div>
    );
};

// --- 5. COMPOSANT DASHBOARD (Accueil) ---
const Dashboard = ({ onNavigate }) => {
    return (
        <div style={{ padding: '0', maxWidth: '100%', margin: '0 auto', overflowX: 'hidden' }}>
            <div className="fade-in" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)', padding: '4rem 2rem 8rem 2rem', borderRadius: '0 0 24px 24px', color: 'white', marginBottom: '-4rem', position: 'relative', zIndex: 1 }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ maxWidth: '600px' }}>
                        <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '1.5rem', letterSpacing: '-0.02em', textShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>MediVision <span style={{ color: '#bae6fd' }}>360</span></h1>
                        <p style={{ fontSize: '1.1rem', color: '#e0f2fe', lineHeight: '1.6', marginBottom: '2rem', maxWidth: '90%' }}>Plateforme d'analyse médicale unifiée assistée par IA.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', backgroundColor: 'rgba(255,255,255,0.1)', padding: '24px', borderRadius: '24px', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div><div style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.8 }}>Analyses</div><div style={{ fontSize: '2.5rem', fontWeight: '800' }}><CountUp end={1284} duration={2.5} /></div></div>
                        <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
                        <div><div style={{ fontSize: '0.75rem', textTransform: 'uppercase', opacity: 0.8 }}>Précision</div><div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#86efac' }}><CountUp end={98.5} decimals={1} suffix="%" duration={3} /></div></div>
                    </div>
                </div>
            </div>
            
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
                    {[
                        { id: 'neuro', title: 'Neuro-Radiologie', desc: 'ResNet50 & U-Net.', icon: 'brain', color: '#0ea5e9' },
                        { id: 'derma', title: 'Dermatologie', desc: 'Analyse de lésions via CLIP.', icon: 'dna', color: '#10b981' },
                        { id: 'surgery', title: 'Chirurgie', desc: 'Monitoring vidéo temps réel.', icon: 'surgery', color: '#f59e0b' },
                        { id: 'pharma', title: 'Pharmacie', desc: 'Scan Code-Barres & OCR.', icon: 'pill', color: '#8b5cf6' },
                    ].map((feature, idx) => (
                        <div key={idx} onClick={() => onNavigate(feature.id)} style={{ padding: '2rem', borderRadius: '24px', background: '#1e293b', border: '1px solid #334155', cursor: 'pointer', transition: 'transform 0.2s ease' }} className="hover:scale-105">
                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: `${feature.color}20`, color: feature.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}><Icon name={feature.icon} className="w-8 h-8" /></div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem', color: '#f1f5f9' }}>{feature.title}</h3>
                            <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- APP ROOT ---
function App() {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [darkMode, setDarkMode] = useState(true);

    const renderPage = () => {
        switch (currentPage) {
            case 'neuro': return <NeuroRadiology apiUrl={API_URL} />;
            case 'derma': return <Dermatology apiUrl={API_URL} />;
            case 'pharma': return <Pharmacy apiUrl={API_URL} />;
            case 'surgery': return <Surgery apiUrl={API_URL} />;
            default: return <Dashboard onNavigate={setCurrentPage} />;
        }
    };

    return (
        <div data-theme={darkMode ? 'dark' : 'light'} style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'sans-serif' }}>
            <Sidebar activePage={currentPage} onNavigate={setCurrentPage} darkMode={darkMode} onToggleTheme={() => setDarkMode(!darkMode)} />
            <main style={{ marginLeft: '280px', flex: 1, minHeight: '100vh', position: 'relative' }}>
                {renderPage()}
            </main>
        </div>
    );
}

export default App;