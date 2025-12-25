import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ScannerEffect = ({ image, onComplete, confidence = 0 }) => {
    const [scanning, setScanning] = useState(true);
    const [binaryData, setBinaryData] = useState([]);
    const [heatmapOpacity, setHeatmapOpacity] = useState(0);

    useEffect(() => {
        // Generate random binary data for effect
        const interval = setInterval(() => {
            const newData = Array.from({ length: 10 }, () =>
                Math.random().toString(2).substring(2, 10)
            );
            setBinaryData(newData);
        }, 50);

        // Gradually reveal heatmap as laser scans
        const heatmapInterval = setInterval(() => {
            setHeatmapOpacity(prev => Math.min(prev + 0.02, 1));
        }, 60);

        // Complete scan after 3 seconds
        const timeout = setTimeout(() => {
            setScanning(false);
            clearInterval(interval);
            clearInterval(heatmapInterval);
            if (onComplete) onComplete();
        }, 3000);

        return () => {
            clearInterval(interval);
            clearInterval(heatmapInterval);
            clearTimeout(timeout);
        };
    }, [onComplete]);

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '600px',
            aspectRatio: '1/1',
            margin: '0 auto',
            borderRadius: '20px',
            overflow: 'hidden',
            border: `2px solid ${confidence > 0.75 ? '#00F0FF' : '#FF2A6D'}`,
            boxShadow: `0 0 40px ${confidence > 0.75 ? 'rgba(0, 240, 255, 0.5)' : 'rgba(255, 42, 109, 0.5)'}`
        }}>
            {/* Image */}
            <img
                src={image}
                alt="Scan"
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: scanning ? 'brightness(0.6) contrast(1.2)' : 'brightness(1)'
                }}
            />

            {/* Heatmap Overlay - Revealed by Laser */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(255, 42, 109, 0.3))',
                opacity: heatmapOpacity,
                mixBlendMode: 'screen',
                pointerEvents: 'none'
            }} />

            {/* Futuristic Laser Beam */}
            {scanning && (
                <>
                    {/* Main Laser Line */}
                    <motion.div
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            height: '3px',
                            background: 'linear-gradient(90deg, transparent, #00F0FF 20%, #00F0FF 80%, transparent)',
                            boxShadow: '0 0 30px #00F0FF, 0 0 60px rgba(0, 240, 255, 0.5)',
                            top: 0,
                            zIndex: 10
                        }}
                        animate={{
                            top: ['0%', '100%']
                        }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: 'linear'
                        }}
                    />

                    {/* Laser Glow Effect */}
                    <motion.div
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            height: '80px',
                            background: 'radial-gradient(ellipse, rgba(0, 240, 255, 0.3) 0%, transparent 70%)',
                            top: 0,
                            filter: 'blur(20px)',
                            zIndex: 9
                        }}
                        animate={{
                            top: ['0%', '100%']
                        }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: 'linear'
                        }}
                    />
                </>
            )}

            {/* Binary Data Overlay */}
            {scanning && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-around',
                    padding: '1rem',
                    fontFamily: 'Share Tech Mono, monospace',
                    fontSize: '0.65rem',
                    color: '#00F0FF',
                    opacity: 0.4,
                    overflow: 'hidden',
                    pointerEvents: 'none',
                    textShadow: '0 0 5px rgba(0, 240, 255, 0.8)'
                }}>
                    {binaryData.map((data, i) => (
                        <div key={i}>{data}</div>
                    ))}
                </div>
            )}

            {/* Scan Complete Status */}
            {!scanning && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    style={{
                        position: 'absolute',
                        top: '1.5rem',
                        right: '1.5rem',
                        padding: '0.75rem 1.5rem',
                        background: 'rgba(15, 23, 42, 0.9)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '12px',
                        border: `2px solid ${confidence > 0.75 ? '#00F0FF' : '#FF2A6D'}`,
                        boxShadow: `0 0 20px ${confidence > 0.75 ? 'rgba(0, 240, 255, 0.3)' : 'rgba(255, 42, 109, 0.3)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}
                >
                    {confidence > 0.75 ? (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <motion.path
                                d="M5 13l4 4L19 7"
                                stroke="#00F0FF"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.5 }}
                            />
                        </svg>
                    ) : (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                stroke="#FF2A6D"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    )}
                    <div style={{
                        fontFamily: 'Share Tech Mono, monospace',
                        fontSize: '0.875rem',
                        color: confidence > 0.75 ? '#00F0FF' : '#FF2A6D',
                        fontWeight: 'bold',
                        textShadow: `0 0 10px ${confidence > 0.75 ? 'rgba(0, 240, 255, 0.8)' : 'rgba(255, 42, 109, 0.8)'}`
                    }}>
                        SCAN COMPLETE
                    </div>
                </motion.div>
            )}

            {/* Confidence Display */}
            {!scanning && (
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{
                        position: 'absolute',
                        bottom: '1.5rem',
                        left: '1.5rem',
                        right: '1.5rem',
                        padding: '1rem',
                        background: 'rgba(15, 23, 42, 0.9)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontFamily: 'Share Tech Mono, monospace'
                    }}
                >
                    <div style={{
                        fontSize: '0.75rem',
                        color: '#E0E6ED',
                        marginBottom: '0.5rem',
                        opacity: 0.7
                    }}>
                        CONFIDENCE LEVEL
                    </div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <div style={{
                            flex: 1,
                            height: '8px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '4px',
                            overflow: 'hidden'
                        }}>
                            <motion.div
                                initial={{ width: '0%' }}
                                animate={{ width: `${confidence * 100}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                style={{
                                    height: '100%',
                                    background: confidence > 0.75
                                        ? 'linear-gradient(90deg, #00F0FF, #06b6d4)'
                                        : 'linear-gradient(90deg, #FF2A6D, #f43f5e)',
                                    boxShadow: confidence > 0.75
                                        ? '0 0 10px #00F0FF'
                                        : '0 0 10px #FF2A6D'
                                }}
                            />
                        </div>
                        <div style={{
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            color: confidence > 0.75 ? '#00F0FF' : '#FF2A6D',
                            textShadow: `0 0 10px ${confidence > 0.75 ? 'rgba(0, 240, 255, 0.8)' : 'rgba(255, 42, 109, 0.8)'}`
                        }}>
                            {(confidence * 100).toFixed(1)}%
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default ScannerEffect;
