import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Award = ({ show }) => {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="award-container"
                    initial={{ opacity: 0, y: -20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    <div className="trophy">🏆</div>
                    <h3>Daily Champion!</h3>
                    <p>All habits completed today.</p>
                    <div className="glow-effect"></div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Award;
