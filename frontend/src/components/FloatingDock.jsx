/* Copyright (c) 2025 ot6_j. All Rights Reserved. */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BrainIcon from './icons/BrainIcon';
import SkinIcon from './icons/SkinIcon';
import PillIcon from './icons/PillIcon';
import ScalpelIcon from './icons/ScalpelIcon';

const FloatingDock = ({ onNavigate }) => {
    const [hoveredDept, setHoveredDept] = useState(null);

    const departments = [
        {
            id: 'neuro',
            name: 'Neuro-Radiology',
            description: 'Brain Tumor Detection & MRI Analysis',
            icon: BrainIcon,
            color: '#06b6d4',
            gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)'
        },
        {
            id: 'derma',
            name: 'Dermatology',
            description: 'Skin Lesion Classification & Analysis',
            icon: SkinIcon,
            color: '#ec4899',
            gradient: 'linear-gradient(135deg, #ec4899, #db2777)'
        },
        {
            id: 'pharma',
            name: 'Pharmacy',
            description: 'Prescription OCR & Drug Information',
            icon: PillIcon,
            color: '#8b5cf6',
            gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
        },
        {
            id: 'surgery',
            name: 'Surgery',
            description: 'Real-time Surgical Tool Detection',
            icon: ScalpelIcon,
            color: '#f43f5e',
            gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)'
        }
    ];

    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6, type: 'spring' }}
            style={{
                position: 'fixed',
                left: '2rem',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                padding: '1.5rem 1rem',
                background: 'rgba(15, 23, 42, 0.7)',
                backdropFilter: 'blur(20px)',
                borderRadius: '28px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
                zIndex: 100
            }}
        >
            {departments.map((dept, index) => {
                const IconComponent = dept.icon;
                const isHovered = hoveredDept === dept.id;

                return (
                    <div key={dept.id} style={{ position: 'relative' }}>
                        <motion.button
                            onClick={() => onNavigate(dept.id)}
                            onMouseEnter={() => setHoveredDept(dept.id)}
                            onMouseLeave={() => setHoveredDept(null)}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{
                                delay: 0.7 + index * 0.1,
                                type: 'spring',
                                stiffness: 260,
                                damping: 20
                            }}
                            whileHover={{
                                scale: 1.15,
                                transition: { duration: 0.2, type: 'spring', stiffness: 400 }
                            }}
                            whileTap={{
                                scale: 0.95,
                                transition: { duration: 0.1 }
                            }}
                            style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '18px',
                                border: `2px solid ${isHovered ? dept.color : 'rgba(255, 255, 255, 0.1)'}`,
                                background: isHovered ? dept.gradient : 'rgba(255, 255, 255, 0.03)',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: isHovered ? '#fff' : dept.color,
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: isHovered
                                    ? `0 0 30px ${dept.color}66, 0 0 60px ${dept.color}33`
                                    : '0 4px 6px rgba(0, 0, 0, 0.1)',
                                padding: '12px'
                            }}
                        >
                            {/* Animated background pulse */}
                            <motion.div
                                style={{
                                    position: 'absolute',
                                    inset: '-50%',
                                    background: `radial-gradient(circle, ${dept.color}44, transparent 70%)`,
                                    opacity: 0
                                }}
                                animate={{
                                    opacity: isHovered ? [0, 0.6, 0] : 0,
                                    scale: isHovered ? [0.8, 1.5, 2] : 1
                                }}
                                transition={{
                                    duration: 1.5,
                                    repeat: isHovered ? Infinity : 0,
                                    ease: 'easeOut'
                                }}
                            />

                            {/* SVG Icon Component */}
                            <motion.div
                                style={{ position: 'relative', zIndex: 1 }}
                                animate={{
                                    rotate: isHovered ? [0, 5, -5, 0] : 0
                                }}
                                transition={{
                                    duration: 0.5,
                                    ease: 'easeInOut'
                                }}
                            >
                                <IconComponent size={40} />
                            </motion.div>
                        </motion.button>

                        {/* Tooltip */}
                        <AnimatePresence>
                            {isHovered && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10, scale: 0.9 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: -10, scale: 0.9 }}
                                    transition={{
                                        duration: 0.2,
                                        type: 'spring',
                                        stiffness: 400,
                                        damping: 25
                                    }}
                                    style={{
                                        position: 'absolute',
                                        left: '100%',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        marginLeft: '1.5rem',
                                        padding: '1rem 1.5rem',
                                        background: 'rgba(15, 23, 42, 0.95)',
                                        backdropFilter: 'blur(16px)',
                                        borderRadius: '16px',
                                        border: `1px solid ${dept.color}`,
                                        boxShadow: `0 8px 24px rgba(0, 0, 0, 0.5), 0 0 20px ${dept.color}33`,
                                        pointerEvents: 'none',
                                        minWidth: '280px',
                                        zIndex: 1000
                                    }}
                                >
                                    <div style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.95rem',
                                        fontWeight: 'bold',
                                        color: dept.color,
                                        marginBottom: '0.5rem',
                                        letterSpacing: '0.5px'
                                    }}>
                                        {dept.name}
                                    </div>
                                    <div style={{
                                        fontFamily: 'var(--font-sans)',
                                        fontSize: '0.85rem',
                                        color: 'rgba(255, 255, 255, 0.7)',
                                        lineHeight: '1.5'
                                    }}>
                                        {dept.description}
                                    </div>

                                    {/* Tooltip arrow */}
                                    <div style={{
                                        position: 'absolute',
                                        left: '-6px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '12px',
                                        height: '12px',
                                        background: dept.color,
                                        clipPath: 'polygon(100% 0, 0 50%, 100% 100%)',
                                        opacity: 0.8
                                    }} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}

            {/* Dock indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ delay: 1.5 }}
                style={{
                    width: '40px',
                    height: '4px',
                    background: 'linear-gradient(90deg, transparent, var(--electric-cyan), transparent)',
                    borderRadius: '2px',
                    margin: '0.5rem auto 0',
                    boxShadow: '0 0 10px var(--electric-cyan)'
                }}
            />
        </motion.div>
    );
};

export default FloatingDock;
