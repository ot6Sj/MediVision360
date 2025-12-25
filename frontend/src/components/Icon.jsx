// Professional Medical Icon System - BULLETPROOF VERSION
// Uses inline styles to guarantee rendering

export default function Icon({ name, className = "w-6 h-6" }) {
    // Extract width/height from Tailwind class (e.g., "w-5 h-5" -> 20px)
    const sizeMap = {
        'w-4 h-4': '16px',
        'w-5 h-5': '20px',
        'w-6 h-6': '24px',
        'w-8 h-8': '32px',
        'w-10 h-10': '40px'
    };

    const size = sizeMap[className] || '24px';

    const iconStyle = {
        width: size,
        height: size,
        display: 'inline-block',
        flexShrink: 0
    };

    const getIcon = () => {
        const svgProps = {
            width: size,
            height: size,
            fill: "none",
            viewBox: "0 0 24 24",
            stroke: "currentColor",
            strokeWidth: 1.5,
            style: { display: 'block' }
        };

        switch (name) {
            case 'brain':
                return (
                    <svg {...svgProps}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                );
            case 'dna':
                return (
                    <svg {...svgProps}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                );
            case 'pill':
                return (
                    <svg {...svgProps}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                );
            case 'surgery':
                return (
                    <svg {...svgProps}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                );
            case 'dashboard':
                return (
                    <svg {...svgProps}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                );
            case 'upload':
                return (
                    <svg {...svgProps}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                );
            case 'document':
                return (
                    <svg {...svgProps}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                );
            case 'check':
                return (
                    <svg {...svgProps}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                );
            case 'activity':
                return (
                    <svg {...svgProps}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                );
            case 'settings':
                return (
                    <svg {...svgProps}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                );
            case 'info':
                return (
                    <svg {...svgProps}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'layers':
                return (
                    <svg {...svgProps}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                );
            case 'moon':
                return (
                    <svg {...svgProps}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                );
            case 'sun':
                return (
                    <svg {...svgProps}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    return (
        <span style={iconStyle}>
            {getIcon()}
        </span>
    );
}
