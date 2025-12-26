/* Copyright (c) 2025 ot6_j. All Rights Reserved. */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard';

const SmartReport = ({ result }) => {
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState(0);

    const reportMessages = [
        {
            text: `Hello Doctor. Analysis complete.`,
            delay: 0
        },
        {
            text: `Confidence Level: ${(result.confidence * 100).toFixed(1)}%`,
            delay: 800
        },
        {
            text: result.diagnosis,
            delay: 1600
        },
        {
            text: result.recommendation,
            delay: 2400
        }
    ];

    useEffect(() => {
        // Reset messages when result changes
        setMessages([]);
        setCurrentMessage(0);

        const timeouts = reportMessages.map((msg, index) =>
            setTimeout(() => {
                setCurrentMessage(index + 1);
                setMessages(prev => [...prev, msg.text]);
            }, msg.delay)
        );

        // Cleanup timeouts on unmount or result change
        return () => timeouts.forEach(timeout => clearTimeout(timeout));
    }, [result]);

    const handleDownload = () => {
        const reportText = messages.join('\n\n');
        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `medivision-report-${Date.now()}.txt`;
        a.click();
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(messages.join('\n\n'));
        alert('Report copied to clipboard!');
    };

    return (
        <GlassCard className="flex-col gap-2" style={{ maxWidth: '500px', margin: '2rem auto' }}>
            <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{
                    fontSize: '1.5rem',
                    color: 'var(--electric-cyan)',
                    fontFamily: 'var(--font-mono)'
                }}>
                    🤖 AI Analysis Report
                </h3>
            </div>

            {/* Chat-style messages */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                maxHeight: '400px',
                overflowY: 'auto',
                padding: '1rem',
                background: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '12px'
            }}>
                {messages.map((msg, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                        style={{
                            padding: '1rem',
                            background: 'rgba(6, 182, 212, 0.1)',
                            borderLeft: '3px solid var(--electric-cyan)',
                            borderRadius: '8px',
                            fontFamily: index === 0 ? 'var(--font-sans)' : 'var(--font-mono)',
                            fontSize: index === 0 ? '1rem' : '0.875rem',
                            lineHeight: '1.6'
                        }}
                    >
                        {msg}
                    </motion.div>
                ))}

                {/* Typing indicator */}
                {currentMessage < reportMessages.length && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        style={{
                            display: 'flex',
                            gap: '0.5rem',
                            padding: '1rem'
                        }}
                    >
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: 'var(--electric-cyan)'
                                }}
                            />
                        ))}
                    </motion.div>
                )}
            </div>

            {/* Action Buttons */}
            {currentMessage >= reportMessages.length && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2"
                    style={{ marginTop: '1rem' }}
                >
                    <button className="btn" onClick={handleCopy} style={{ flex: 1 }}>
                        📋 Copy
                    </button>
                    <button className="btn" onClick={handleDownload} style={{ flex: 1 }}>
                        📥 Download PDF
                    </button>
                </motion.div>
            )}
        </GlassCard>
    );
};

export default SmartReport;
