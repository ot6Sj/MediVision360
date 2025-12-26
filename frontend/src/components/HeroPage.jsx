/* Copyright (c) 2025 ot6_j. All Rights Reserved. */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StatusBar from './StatusBar';
import HUDBrackets from './HUDBrackets';
import LivingGrid from './LivingGrid';

const HeroPage = ({ onNavigate }) => {
    const [bootComplete, setBootComplete] = useState(false);
    const [bootStage, setBootStage] = useState(0);

    const bootSequence = [
        "INITIALIZING NEURAL NETS...",
        "LOADING RESNET50 WEIGHTS...",
        "CALIBRATING YOLO SENSORS...",
        "SYSTEM READY."
    ];

    useEffect(() => {
        const timers = bootSequence.map((_, index) =>
            setTimeout(() => {
                setBootStage(index);
                if (index === bootSequence.length - 1) {
                    setTimeout(() => setBootComplete(true), 800);
                }
            }, index * 600)
        );

        return () => timers.forEach(t => clearTimeout(t));
    }, []);

    const departments = [
        {
            id: 'neuro',
            name: 'Neuro-Radiology',
            desc: 'Brain Tumor Detection & MRI Analysis',
            icon: '🧠',
            color: '#00F0FF'
        },
        {
            id: 'derma',
            name: 'Dermatology',
            desc: 'Skin Lesion Classification & Analysis',
            icon: '🧬',
            color: '#ec4899'
        },
        {
            id: 'pharma',
            name: 'Pharmacy',
            desc: 'Prescription OCR & Drug Information',
            icon: '💊',
            color: '#8b5cf6'
        },
        {
            id: 'surgery',
            name: 'Surgery',
            desc: 'Real-time Surgical Tool Detection',
            icon: '🤖',
            color: '#FF2A6D'
        }
    ];

    return (
        <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
            <LivingGrid />
            <StatusBar />
            <HUDBrackets />

            {/* Boot Sequence */}
            <AnimatePresence>
                {!bootComplete && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            background: 'linear-gradient(135deg, #050505 0%, #0B1021 100%)',
                            zIndex: 9999
                        }}
                    >
                        {/* Wireframe Brain */}
                        <motion.div
                            animate={{ rotateY: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                            style={{
                                fontSize: '8rem',
                                marginBottom: '3rem',
                                filter: 'drop-shadow(0 0 20px #00F0FF)'
                            }}
                        >
                            🧠
                        </motion.div>

                        {/* Boot Text */}
                        <motion.div
                            key={bootStage}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            style={{
                                fontFamily: 'Share Tech Mono, monospace',
                                fontSize: '1.2rem',
                                color: '#00F0FF',
                                textShadow: '0 0 10px rgba(0, 240, 255, 0.8)'
                            }}
                        >
                            {bootSequence[bootStage]}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            {bootComplete && (
                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '6rem 2rem 2rem',
                    position: 'relative',
                    zIndex: 1
                }}>
                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="neon-text"
                        style={{
                            fontFamily: 'Orbitron, sans-serif',
                            fontSize: '5rem',
                            fontWeight: 900,
                            marginBottom: '1rem',
                            textAlign: 'center',
                            letterSpacing: '4px'
                        }}
                    >
                        MEDIVISION 360
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.6 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        style={{
                            fontFamily: 'Rajdhani, sans-serif',
                            fontSize: '1.5rem',
                            color: '#E0E6ED',
                            marginBottom: '4rem',
                            textAlign: 'center',
                            letterSpacing: '2px',
                            textTransform: 'uppercase'
                        }}
                    >
                        AI-POWERED MEDICAL IMAGING ANALYSIS
                    </motion.p>

                    {/* Holocards */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '2rem',
                            maxWidth: '1400px',
                            width: '100%'
                        }}
                    >
                        {departments.map((dept, index) => (
                            <motion.div
                                key={dept.id}
                                className="holocard"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 + index * 0.1, duration: 0.6 }}
                                onClick={() => onNavigate(dept.id)}
                                whileHover={{ scale: 1.02 }}
                                style={{
                                    borderColor: `rgba(${parseInt(dept.color.slice(1, 3), 16)}, ${parseInt(dept.color.slice(3, 5), 16)}, ${parseInt(dept.color.slice(5, 7), 16)}, 0.3)`
                                }}
                            >
                                <div className="holocard-icon" style={{ color: dept.color }}>
                                    {dept.icon}
                                </div>
                                <h3 className="holocard-title" style={{ color: dept.color }}>
                                    {dept.name}
                                </h3>
                                <p className="holocard-desc">
                                    {dept.desc}
                                </p>

                                {/* Status Indicator */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '1.5rem',
                                    left: '2rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontFamily: 'Share Tech Mono',
                                    fontSize: '0.75rem',
                                    color: dept.color,
                                    opacity: 0.7
                                }}>
                                    <div style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        background: dept.color,
                                        boxShadow: `0 0 10px ${dept.color}`
                                    }} />
                                    <span>ONLINE</span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default HeroPage;
