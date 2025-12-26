/* Copyright (c) 2025 ot6_j. All Rights Reserved. */

import { motion } from 'framer-motion';

const BrainIcon = ({ className = "", size = 40 }) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Simplified professional brain outline */}
            <path
                d="M32 18C26 18 22 21 20 24C19 24 17 26 17 28C17 30 18 32 20 33C19 34 18 36 18 38C18 40 19 42 21 43C21 45 22 47 24 48C25 50 27 52 30 53C31 54 32 54 33 53C36 52 38 50 39 48C41 47 42 45 42 43C44 42 45 40 45 38C45 36 44 34 43 33C45 32 46 30 46 28C46 26 44 24 42 24C40 21 36 18 32 18Z"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Simple neural nodes */}
            <circle cx="27" cy="30" r="2" fill="currentColor" opacity="0.6" />
            <circle cx="37" cy="30" r="2" fill="currentColor" opacity="0.6" />
            <circle cx="32" cy="38" r="2" fill="currentColor" opacity="0.6" />
        </svg>
    );
};

export default BrainIcon;
