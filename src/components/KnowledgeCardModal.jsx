import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const KnowledgeCardModal = ({ show, onClose }) => {
    const [tip, setTip] = useState(null);

    useEffect(() => {
        if (show) {
            // In a real app, fetch from DB or config
            const tips = [
                { title: "Full Range of Motion", text: "Training through a full ROM stimulates hypertrophy by stretching muscle fibers under load. Don't cheat the stretch.", icon: "🏋️" },
                { title: "Protein Timing", text: "Total daily intake matters more than the anabolic window. Aim for 1.6g-2.2g per kg of bodyweight.", icon: "🍗" },
                { title: "Sleep Hygiene", text: "Blue light blocks melatonin. Stop screens 60 mins before bed to optimize deep sleep cycles.", icon: "💤" },
                { title: "Cold Exposure", text: "Cold showers increase dopamine by 250% and reduce inflammation. Start with 30s.", icon: "❄️" },
                { title: "Zone 2 Cardio", text: "Building your aerobic base improves recovery between sets and overall mitochondrial efficiency.", icon: "🫀" }
            ];
            setTip(tips[Math.floor(Math.random() * tips.length)]);
        }
    }, [show]);

    if (!tip) return null;

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="knowledge-modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="knowledge-card"
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    >
                        <div className="card-inner">
                            <div className="card-header">
                                <span className="classified-stamp">DECLASSIFIED</span>
                                <span className="card-icon">{tip.icon}</span>
                            </div>
                            <div className="card-content">
                                <h3>{tip.title}</h3>
                                <p>{tip.text}</p>
                            </div>
                            <div className="card-action">
                                <button className="ack-btn" onClick={onClose}>
                                    ACKNOWLEDGE
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default KnowledgeCardModal;
