import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LevelUpModal = ({ show, level, onClose }) => {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="level-up-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="level-up-card"
                        initial={{ scale: 0.5, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.5, opacity: 0, y: 50 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="level-up-header">
                            <span className="level-up-icon">🎉</span>
                            <h2>Level Up!</h2>
                        </div>
                        <div className="level-up-content">
                            <p>Congratulations! You've reached</p>
                            <div className="new-level-badge">
                                Level {level}
                            </div>
                            <p>Keep up the great work!</p>
                        </div>
                        <button className="glass-button level-up-btn" onClick={onClose}>
                            Awesome!
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LevelUpModal;
