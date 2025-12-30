/* Copyright (c) 2025 ot6_j. All Rights Reserved. */

import { useState } from 'react';
import Sidebar from './components/Sidebar';
import NeuroRadiology from './components/departments/NeuroRadiology';
import Dermatology from './components/departments/Dermatology';
import Pharmacy from './components/departments/Pharmacy';
import Surgery from './components/departments/Surgery';
import Icon from './components/Icon';
import CountUp from 'react-countup';

function Dashboard() {
    return (
        <div style={{ padding: '0', maxWidth: '100%', margin: '0 auto', overflowX: 'hidden' }}>
            {/* HER0 SECTION */}
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
                            background: 'rgba(255, 255, 255, 0.2)',
                            padding: '6px 16px',
                            borderRadius: '9999px',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            marginBottom: '1.5rem',
                            backdropFilter: 'blur(4px)'
                        }}>
                            <Icon name="activity" className="w-4 h-4" />
                            All Systems Operational
                        </div>
                        <h1 style={{
                            fontSize: '3.5rem',
                            fontWeight: 800,
                            lineHeight: 1.1,
                            marginBottom: '1.5rem',
                            letterSpacing: '-0.02em'
                        }}>
                            MediVision 360 <br />
                            <span style={{ opacity: 0.9 }}>Advanced Medical AI Platform</span>
                        </h1>
                        <p style={{
                            fontSize: '1.125rem',
                            lineHeight: 1.6,
                            opacity: 0.9,
                            marginBottom: '2rem',
                            maxWidth: '500px'
                        }}>
                            Powered by ResNet50, YOLOv8, CLIP, and MobileNetV2 neural networks for real-time medical image analysis across Neuro-Radiology, Dermatology, and Surgical monitoring.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn" style={{
                                background: 'white',
                                color: 'var(--sky-600)',
                                padding: '12px 24px',
                                fontSize: '1rem'
                            }}>
                                View Analysis Modules
                            </button>
                            <button className="btn" style={{
                                background: 'rgba(255,255,255,0.1)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.3)',
                                padding: '12px 24px',
                                fontSize: '1rem'
                            }}>
                                Documentation
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* LIVE STATS CARDS (Overlapping) */}
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem', position: 'relative', zIndex: 10 }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '4rem'
                }}>
                    {/* Card 1: Neuro-Radiology Status */}
                    <div className="medical-card reveal-delay-1" style={{ borderTop: '4px solid var(--sky-500)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{
                                width: '40px', height: '40px',
                                background: 'rgba(14, 165, 233, 0.1)',
                                borderRadius: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--sky-500)'
                            }}>
                                <Icon name="brain" className="w-6 h-6" />
                            </div>
                            <span className="badge badge-success">Active</span>
                        </div>
                        <h3 className="medical-card-title">NeuroRadiology</h3>
                        <p className="medical-card-subtitle">ResNet50 Brain Tumor Detection</p>
                        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--slate-700)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span style={{ color: 'var(--slate-400)' }}>Model</span>
                                <span style={{ fontWeight: 600, color: 'var(--slate-50)' }}>ResNet50 (101MB)</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Total Scans */}
                    <div className="medical-card reveal-delay-2" style={{ borderTop: '4px solid var(--emerald-500)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{
                                width: '40px', height: '40px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                borderRadius: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--emerald-500)'
                            }}>
                                <Icon name="dna" className="w-6 h-6" />
                            </div>
                            <span className="badge badge-success">Active</span>
                        </div>
                        <h3 className="medical-card-title">Dermatology</h3>
                        <p className="medical-card-subtitle">CLIP + MobileNetV2 Skin Analysis</p>
                        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--slate-700)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span style={{ color: 'var(--slate-400)' }}>Models</span>
                                <span style={{ fontWeight: 600, color: 'var(--slate-50)' }}>CLIP (605MB) + MobileNetV2</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: System Status */}
                    <div className="medical-card reveal-delay-3" style={{ borderTop: '4px solid var(--amber-500)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <div style={{
                                width: '40px', height: '40px',
                                background: 'rgba(245, 158, 11, 0.1)',
                                borderRadius: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--amber-500)'
                            }}>
                                <Icon name="surgery" className="w-6 h-6" />
                            </div>
                            <span className="badge badge-success">Active</span>
                        </div>
                        <h3 className="medical-card-title">Surgery</h3>
                        <p className="medical-card-subtitle">YOLOv8n Object Detection</p>
                        <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--slate-700)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span style={{ color: 'var(--slate-400)' }}>Model</span>
                                <span style={{ fontWeight: 600, color: 'var(--slate-50)' }}>YOLOv8n (6.5MB)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PROJECT DESCRIPTION SECTION */}
                <div className="grid-2 reveal" style={{ marginBottom: '4rem' }}>
                    <div className="medical-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                            <div style={{
                                width: '32px', height: '32px',
                                background: 'rgba(14, 165, 233, 0.1)',
                                borderRadius: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--sky-500)'
                            }}>
                                <Icon name="info" className="w-5 h-5" />
                            </div>
                            <h3 className="medical-card-title" style={{ marginBottom: 0 }}>About the Platform</h3>
                        </div>
                        <p style={{ color: 'var(--slate-400)', marginBottom: '1rem' }}>
                            MediVision 360 is a comprehensive medical AI platform integrating state-of-the-art deep learning models for real-time diagnostics. Powered by TensorFlow, PyTorch, and Transformers, the platform delivers production-ready analysis across multiple medical specialties.
                        </p>
                        <p style={{ color: 'var(--slate-400)' }}>
                            <strong style={{ color: 'var(--slate-300)' }}>Technology Stack:</strong> ResNet50 (NeuroRadiology), YOLOv8n (Surgery), CLIP + MobileNetV2 (Dermatology). All models optimized for medical imaging with custom preprocessing pipelines.
                        </p>
                    </div>

                    <div className="medical-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                            <div style={{
                                width: '32px', height: '32px',
                                background: 'rgba(16, 185, 129, 0.1)',
                                borderRadius: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--emerald-500)'
                            }}>
                                <Icon name="layers" className="w-5 h-5" />
                            </div>
                            <h3 className="medical-card-title" style={{ marginBottom: 0 }}>Active Modules</h3>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.75rem', background: 'rgba(15, 23, 42, 0.3)', borderRadius: '8px' }}>
                                <Icon name="brain" className="w-4 h-4" style={{ color: 'var(--sky-500)', flexShrink: 0 }} />
                                <strong style={{ color: 'var(--slate-200)', flex: 1, fontSize: '0.875rem' }}>NeuroRadiology</strong>
                                <span className="badge badge-success" style={{ fontSize: '0.625rem' }}>Active</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.75rem', background: 'rgba(15, 23, 42, 0.3)', borderRadius: '8px' }}>
                                <Icon name="dna" className="w-4 h-4" style={{ color: 'var(--emerald-500)', flexShrink: 0 }} />
                                <strong style={{ color: 'var(--slate-200)', flex: 1, fontSize: '0.875rem' }}>Dermatology</strong>
                                <span className="badge badge-success" style={{ fontSize: '0.625rem' }}>Active</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.75rem', background: 'rgba(15, 23, 42, 0.3)', borderRadius: '8px' }}>
                                <Icon name="surgery" className="w-4 h-4" style={{ color: 'var(--amber-500)', flexShrink: 0 }} />
                                <strong style={{ color: 'var(--slate-200)', flex: 1, fontSize: '0.875rem' }}>Surgery Monitoring</strong>
                                <span className="badge badge-success" style={{ fontSize: '0.625rem' }}>Active</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.75rem', background: 'rgba(15, 23, 42, 0.3)', borderRadius: '8px' }}>
                                <Icon name="pill" className="w-4 h-4" style={{ color: 'var(--violet-500)', flexShrink: 0 }} />
                                <strong style={{ color: 'var(--slate-200)', flex: 1, fontSize: '0.875rem' }}>Pharmacy Scanner</strong>
                                <span className="badge badge-success" style={{ fontSize: '0.625rem' }}>Active</span>
                            </div>
                        </div>
                    </div>
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
                return <NeuroRadiology />;
            case 'derma':
                return <Dermatology />;
            case 'pharma':
                return <Pharmacy />;
            case 'surgery':
                return <Surgery />;
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