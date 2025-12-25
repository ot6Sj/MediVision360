import { motion } from 'framer-motion';

const ScalpelIcon = ({ className = "", size = 40 }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Professional surgical scalpel - clean design */}
            {/* Blade */}
            <path
                d="M18 46 L32 32"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
            {/* Sharp tip */}
            <path
                d="M16 48 L18 46 L20 48 Z"
                fill="currentColor"
            />
            {/* Medical handle */}
            <rect
                x="30"
                y="27"
                width="18"
                height="7"
                rx="3.5"
                stroke="currentColor"
                strokeWidth="2.5"
            />
            {/* Handle detail lines - minimal */}
            <path d="M34 27 L34 34" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
            <path d="M38 27 L38 34" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
            <path d="M42 27 L42 34" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
        </svg>
    );
};

export default ScalpelIcon;
