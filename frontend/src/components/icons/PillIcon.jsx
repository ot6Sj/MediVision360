/* Copyright (c) 2025 ot6_j. All Rights Reserved. */

import { motion } from 'framer-motion';

const PillIcon = ({ className = "", size = 40 }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Professional capsule pill */}
            <rect
                x="20"
                y="16"
                width="24"
                height="32"
                rx="12"
                stroke="currentColor"
                strokeWidth="3"
            />
            {/* Clean divider */}
            <path
                d="M20 32 L44 32"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
            />
            {/* Minimal fill for depth */}
            <path
                d="M 20 29 Q 20 16 32 16 Q 44 16 44 29 L 44 32 L 20 32 Z"
                fill="currentColor"
                opacity="0.12"
            />
        </svg>
    );
};

export default PillIcon;
