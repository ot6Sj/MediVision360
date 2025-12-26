/* Copyright (c) 2025 ot6_j. All Rights Reserved. */

import { motion } from 'framer-motion';

const HUDBrackets = () => {
    return (
        <>
            <motion.div
                className="hud-bracket top-left"
                initial={{ opacity: 0, x: -20, y: -20 }}
                animate={{ opacity: 0.3, x: 0, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
            >
                [
            </motion.div>
            <motion.div
                className="hud-bracket top-right"
                initial={{ opacity: 0, x: 20, y: -20 }}
                animate={{ opacity: 0.3, x: 0, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
            >
                ]
            </motion.div>
            <motion.div
                className="hud-bracket bottom-left"
                initial={{ opacity: 0, x: -20, y: 20 }}
                animate={{ opacity: 0.3, x: 0, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
            >
                [
            </motion.div>
            <motion.div
                className="hud-bracket bottom-right"
                initial={{ opacity: 0, x: 20, y: 20 }}
                animate={{ opacity: 0.3, x: 0, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
            >
                ]
            </motion.div>
        </>
    );
};

export default HUDBrackets;
