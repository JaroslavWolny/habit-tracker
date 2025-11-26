import React from 'react';
import { motion } from 'framer-motion';

const BodyWidget = ({ stats }) => {
    // stats: { training: 0-1, nutrition: 0-1, recovery: 0-1 }

    const muscleOpacity = 0.2 + (stats.training * 0.8);
    const coreOpacity = 0.2 + (stats.nutrition * 0.8);
    const auraOpacity = stats.recovery;

    return (
        <div className="body-widget-container">
            <div className="body-silhouette-wrapper">
                <svg viewBox="0 0 200 400" className="body-svg">
                    {/* Aura / Shield (Recovery) */}
                    <motion.path
                        d="M100,10 C150,10 190,50 190,200 C190,350 150,390 100,390 C50,390 10,350 10,200 C10,50 50,10 100,10 Z"
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="2"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{
                            opacity: auraOpacity > 0 ? 0.3 + (auraOpacity * 0.5) : 0,
                            scale: auraOpacity > 0 ? [1, 1.05, 1] : 1
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        style={{ filter: 'blur(8px)' }}
                    />

                    {/* Base Body Outline */}
                    <path
                        d="M100,30 C115,30 125,40 125,55 C125,65 120,75 110,80 L135,110 L160,100 L170,140 L140,150 L140,220 L160,380 L130,380 L115,250 L100,250 L85,250 L70,380 L40,380 L60,220 L60,150 L30,140 L40,100 L65,110 L90,80 C80,75 75,65 75,55 C75,40 85,30 100,30 Z"
                        fill="#111"
                        stroke="#333"
                        strokeWidth="2"
                    />

                    {/* Muscles (Training) - Arms, Legs, Chest */}
                    <motion.path
                        d="M65,110 L40,100 L30,140 L60,150 Z M135,110 L160,100 L170,140 L140,150 Z M70,380 L40,380 L60,220 L85,250 Z M130,380 L160,380 L140,220 L115,250 Z M60,150 L140,150 L115,250 L85,250 Z"
                        fill="var(--primary)"
                        initial={{ opacity: 0.1 }}
                        animate={{ opacity: muscleOpacity }}
                        transition={{ duration: 1 }}
                    />

                    {/* Core (Nutrition) - Stomach/Torso Center */}
                    <motion.circle
                        cx="100" cy="180" r="20"
                        fill="var(--primary)"
                        initial={{ opacity: 0.1 }}
                        animate={{ opacity: coreOpacity }}
                        transition={{ duration: 1 }}
                        style={{ filter: 'blur(10px)' }}
                    />

                    {/* Brain/Head (Knowledge - Optional addition for completeness) */}
                    <motion.circle
                        cx="100" cy="55" r="15"
                        fill="var(--primary)"
                        initial={{ opacity: 0.1 }}
                        animate={{ opacity: 0.2 }} // Static for now or link to knowledge
                    />

                </svg>
            </div>

            <div className="body-status-labels">
                <div className="status-label">
                    <span className="label-dot" style={{ background: stats.training > 0 ? 'var(--primary)' : '#333' }}></span>
                    MUSCLES
                </div>
                <div className="status-label">
                    <span className="label-dot" style={{ background: stats.nutrition > 0 ? 'var(--primary)' : '#333' }}></span>
                    FUEL
                </div>
                <div className="status-label">
                    <span className="label-dot" style={{ background: stats.recovery > 0 ? 'var(--primary)' : '#333' }}></span>
                    ENERGY
                </div>
            </div>
        </div>
    );
};

export default BodyWidget;
