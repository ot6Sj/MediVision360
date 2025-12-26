/* Copyright (c) 2025 ot6_j. All Rights Reserved. */

import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', style = {}, neon = false, alert = false }) => {
    const borderColor = alert ? '#FF2A6D' : (neon ? '#00F0FF' : 'rgba(255, 255, 255, 0.1)');
    const glowColor = alert ? 'rgba(255, 42, 109, 0.3)' : (neon ? 'rgba(0, 240, 255, 0.2)' : 'rgba(0, 240, 255, 0.1)');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass-panel ${className}`}
            style={{
                ...style,
                borderColor,
                boxShadow: `0 0 20px ${glowColor}, 0 8px 32px rgba(0, 0, 0, 0.5)`
            }}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;
