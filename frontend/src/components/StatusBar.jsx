import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const StatusBar = () => {
    const [latency, setLatency] = useState(12);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        // Update time every second
        const timer = setInterval(() => setTime(new Date()), 1000);

        // Simulate latency variation
        const latencyTimer = setInterval(() => {
            setLatency(Math.floor(Math.random() * 8) + 10); // 10-18ms
        }, 2000);

        return () => {
            clearInterval(timer);
            clearInterval(latencyTimer);
        };
    }, []);

    return (
        <motion.div
            className="status-bar"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
        >
            <div className="status-bar-left">
                <div className="status-item">
                    <span className="neon-text" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                        MEDIVISION v1.0
                    </span>
                </div>
            </div>

            <div className="status-bar-right">
                <div className="status-item">
                    <div className="status-indicator"></div>
                    <span>SYS: ONLINE</span>
                </div>
                <div className="status-item">
                    <span>LATENCY: {latency}ms</span>
                </div>
                <div className="status-item">
                    <span>GPU: ACTIVE</span>
                </div>
                <div className="status-item">
                    <span>{time.toLocaleTimeString('en-US', { hour12: false })}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default StatusBar;
