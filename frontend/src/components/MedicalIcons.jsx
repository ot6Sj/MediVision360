// Medical SVG Icon Components for MediVision 360
// Redesigned for clarity and professional appearance
import React from 'react';

export const BrainIcon = ({ className = "w-6 h-6", style = {} }) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3C8.5 3 6 5.5 6 8.5c0 1.5.5 2.5 1 3.5-.5.5-1 1.5-1 2.5 0 2 1.5 3.5 3.5 3.5.5 0 1-.5 1.5-.5.5.5 1 1 2 1s1.5-.5 2-1c.5 0 1 .5 1.5.5 2 0 3.5-1.5 3.5-3.5 0-1-.5-2-1-2.5.5-1 1-2 1-3.5C18 5.5 15.5 3 12 3z" />
        <circle cx="10" cy="10" r="1" fill="currentColor" />
        <circle cx="14" cy="10" r="1" fill="currentColor" />
        <path d="M10 14c.5.5 1 1 2 1s1.5-.5 2-1" />
    </svg>
);

export const MicroscopeIcon = ({ className = "w-6 h-6", style = {} }) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3v3m0 12v3m9-9h-3M6 12H3" />
        <path d="M16.24 7.76l-2.12 2.12M9.88 14.12l-2.12 2.12M16.24 16.24l-2.12-2.12M9.88 9.88L7.76 7.76" />
    </svg>
);

export const ScalpelIcon = ({ className = "w-6 h-6", style = {} }) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 4L4 20" />
        <circle cx="18" cy="6" r="2" />
        <path d="M8 16l-4 4" />
    </svg>
);

export const PillsIcon = ({ className = "w-6 h-6", style = {} }) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="3" width="8" height="18" rx="4" />
        <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
);

export const CameraIcon = ({ className = "w-6 h-6", style = {} }) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        <circle cx="12" cy="13" r="3" />
    </svg>
);

export const UploadIcon = ({ className = "w-6 h-6", style = {} }) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

export const DNAIcon = ({ className = "w-6 h-6", style = {} }) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4c2 0 4 2 6 2s4-2 6-2 4 2 6 2" />
        <path d="M4 12c2 0 4 2 6 2s4-2 6-2 4 2 6 2" />
        <path d="M4 20c2 0 4-2 6-2s4 2 6 2 4-2 6-2" />
    </svg>
);

export const HeartPulseIcon = ({ className = "w-6 h-6", style = {} }) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
        <path d="M3.5 12h6l2-4 2 8 2-4h5.5" />
    </svg>
);
