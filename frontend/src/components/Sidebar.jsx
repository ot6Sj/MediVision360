/* Copyright (c) 2025 ot6_j. All Rights Reserved. */

import Icon from './Icon';

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', path: '/' },
    { id: 'neuro', label: 'Neuro-Radiology', icon: 'brain', path: '/neuro' },
    { id: 'derma', label: 'Dermatology', icon: 'dna', path: '/derma' },
    { id: 'surgery', label: 'Surgery', icon: 'surgery', path: '/surgery' },
    { id: 'pharma', label: 'Pharmacy', icon: 'pill', path: '/pharma' }
];

export default function Sidebar({ activePage = 'dashboard', onNavigate, darkMode, onToggleTheme }) {
    return (
        <div className="sidebar-container" style={{
            width: '280px',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            background: darkMode ? '#0a0f1a' : '#f8fafc',
            borderRight: `1px solid ${darkMode ? '#1e293b' : '#cbd5e1'}`,
            display: 'flex',
            flexDirection: 'column',
            padding: '24px 20px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: darkMode ? '2px 0 10px rgba(0, 0, 0, 0.3)' : '2px 0 10px rgba(0, 0, 0, 0.05)'
        }}>
            {/* Logo & Theme Toggle */}
            <div style={{
                marginBottom: '32px',
                paddingBottom: '24px',
                borderBottom: `1px solid ${darkMode ? 'var(--slate-800)' : '#e2e8f0'}`
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: darkMode ? 'var(--slate-50)' : '#0f172a',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            background: 'linear-gradient(135deg, var(--sky-500), var(--sky-600))',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '1.125rem'
                        }}>
                            M
                        </div>
                        MediVision
                    </h1>

                    {/* Theme Toggle */}
                    <button
                        onClick={onToggleTheme}
                        style={{
                            width: '40px',
                            height: '24px',
                            background: darkMode ? 'var(--slate-700)' : '#cbd5e1',
                            borderRadius: '12px',
                            border: 'none',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <div style={{
                            width: '18px',
                            height: '18px',
                            background: 'var(--sky-500)',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: '3px',
                            left: darkMode ? '19px' : '3px',
                            transition: 'left 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                        }}>
                            <Icon name={darkMode ? 'moon' : 'sun'} className="w-3 h-3" />
                        </div>
                    </button>
                </div>
                <p style={{
                    fontSize: '0.75rem',
                    color: darkMode ? 'var(--slate-400)' : '#64748b',
                    marginLeft: '40px',
                    fontFamily: 'var(--font-mono)'
                }}>
                    v3.6.0 • AI Platform
                </p>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav" style={{ flex: 1 }}>
                {menuItems.map(item => (
                    <button
                        className="sidebar-link"
                        key={item.id}
                        onClick={() => onNavigate && onNavigate(item.id)}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '14px 18px',
                            border: 'none',
                            background: activePage === item.id
                                ? (darkMode ? 'rgba(14, 165, 233, 0.15)' : 'rgba(14, 165, 233, 0.1)')
                                : 'transparent',
                            color: activePage === item.id
                                ? 'var(--sky-500)'
                                : (darkMode ? 'var(--slate-400)' : '#64748b'),
                            borderRadius: 'var(--radius-md)',
                            cursor: 'pointer',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            fontSize: '0.9375rem',
                            fontWeight: activePage === item.id ? 600 : 500,
                            marginBottom: '6px',
                            textAlign: 'left',
                            fontFamily: 'var(--font-sans)',
                            borderLeft: activePage === item.id ? '4px solid var(--sky-500)' : '4px solid transparent',
                            transform: activePage === item.id ? 'translateX(2px)' : 'translateX(0)'
                        }}
                        onMouseEnter={(e) => {
                            if (activePage !== item.id) {
                                e.currentTarget.style.background = darkMode ? 'var(--slate-800)' : '#f1f5f9';
                                e.currentTarget.style.color = darkMode ? 'var(--slate-200)' : '#334155';
                                e.currentTarget.style.transform = 'translateX(4px)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (activePage !== item.id) {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = darkMode ? 'var(--slate-400)' : '#64748b';
                                e.currentTarget.style.transform = 'translateX(0)';
                            }
                        }}
                    >
                        <Icon name={item.icon} className="w-5 h-5" />
                        {item.label}
                    </button>
                ))}
            </nav>

            {/* Subtle Developer Signature */}
            <div style={{
                paddingTop: '16px',
                borderTop: `1px solid ${darkMode ? 'rgba(100, 116, 139, 0.1)' : 'rgba(203, 213, 225, 0.3)'}`,
                textAlign: 'center'
            }}>
                <span style={{
                    fontSize: '0.625rem',
                    color: darkMode ? 'rgba(100, 116, 139, 0.3)' : 'rgba(100, 116, 139, 0.4)',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.05em',
                    opacity: 0.4,
                    transition: 'opacity 0.3s ease'
                }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.4'}
                >
                    ot6_j
                </span>
            </div>
        </div >
    );
}
