/* Copyright (c) 2025 ot6_j. All Rights Reserved. */

import { motion } from 'framer-motion';

const SkinIcon = ({ className = "", size = 40 }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Professional magnifying glass */}
            <circle
                cx="26"
                cy="26"
                r="13"
                stroke="currentColor"
                strokeWidth="3"
            />
            <path
                d="M36 36 L48 48"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
            />
            {/* Clean skin pattern - simplified */}
            <circle cx="26" cy="26" r="5" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
            <circle cx="26" cy="26" r="2.5" fill="currentColor" opacity="0.3" />
        </svg>
    );
};

export default SkinIcon;
