/* Copyright (c) 2025 ot6_j. All Rights Reserved. */

import { motion } from 'framer-motion';

const ComparerSlider = ({ originalImage, heatmapImage }) => {
    return (
        <div style={{
            maxWidth: '1200px',
            margin: '2rem auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '2rem',
            padding: '0 1rem'
        }}>
            {/* Original Image */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                    position: 'relative',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: '2px solid var(--electric-cyan)',
                    boxShadow: '0 0 40px rgba(6, 182, 212, 0.3)'
                }}
            >
                <img
                    src={originalImage}
                    alt="Original MRI Scan"
                    style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block'
                    }}
                />
                <div style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(0, 0, 0, 0.7)',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.875rem',
                    color: 'white',
                    border: '1px solid var(--electric-cyan)'
                }}>
                    📊 ORIGINAL MRI
                </div>
            </motion.div>

            {/* AI Heatmap */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{
                    position: 'relative',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    border: '2px solid var(--neon-magenta)',
                    boxShadow: '0 0 40px rgba(255, 42, 109, 0.3)'
                }}
            >
                <img
                    src={heatmapImage}
                    alt="AI Heatmap Analysis"
                    style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block'
                    }}
                />
                <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    padding: '0.5rem 1rem',
                    background: 'rgba(0, 0, 0, 0.7)',
                    borderRadius: '8px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.875rem',
                    color: 'white',
                    border: '1px solid var(--neon-magenta)'
                }}>
                    🔥 AI HEATMAP
                </div>
            </motion.div>
        </div>
    );
};

export default ComparerSlider;
