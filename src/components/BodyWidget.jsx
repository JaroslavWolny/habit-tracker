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
                    <defs>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                        <linearGradient id="scan-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="transparent" />
                            <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                    </defs>

                    {/* Scanner Effect */}
                    <motion.rect
                        x="0" y="0" width="200" height="10"
                        fill="url(#scan-gradient)"
                        initial={{ y: 0, opacity: 0 }}
                        animate={{ y: [0, 400, 0], opacity: [0, 0.5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Base Skeleton / Frame */}
                    <path
                        d="M100,40 L100,160 M100,160 L60,220 M100,160 L140,220 M60,220 L60,360 M140,220 L140,360 M40,80 L160,80 M40,80 L30,180 M160,80 L170,180"
                        stroke="#222"
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                    />

                    {/* Head (Knowledge) */}
                    <motion.path
                        d="M85,30 L115,30 L120,50 L110,70 L90,70 L80,50 Z"
                        fill={stats.know > 0 ? "var(--primary)" : "#1a1a1a"}
                        stroke="var(--primary)"
                        strokeWidth="2"
                        initial={{ opacity: 0.5 }}
                        animate={{
                            opacity: stats.know > 0 ? 1 : 0.5,
                            filter: stats.know > 0 ? "url(#glow)" : "none"
                        }}
                    />

                    {/* Chest/Core (Nutrition) */}
                    <motion.path
                        d="M70,80 L130,80 L120,150 L80,150 Z"
                        fill={stats.nutrition > 0 ? "var(--primary)" : "#1a1a1a"}
                        stroke="var(--primary)"
                        strokeWidth="2"
                        animate={{
                            fillOpacity: 0.2 + (stats.nutrition * 0.8),
                            filter: stats.nutrition > 0.8 ? "url(#glow)" : "none"
                        }}
                    />

                    {/* Abs (Nutrition Detail) */}
                    <path d="M90,150 L110,150 L105,180 L95,180 Z"
                        fill={stats.nutrition > 0.5 ? "var(--primary)" : "#111"}
                        stroke="var(--primary)" strokeWidth="1" opacity="0.8" />

                    {/* Shoulders (Training) */}
                    <motion.circle cx="40" cy="80" r="12" fill={stats.training > 0 ? "var(--primary)" : "#1a1a1a"} stroke="var(--primary)" strokeWidth="2" />
                    <motion.circle cx="160" cy="80" r="12" fill={stats.training > 0 ? "var(--primary)" : "#1a1a1a"} stroke="var(--primary)" strokeWidth="2" />

                    {/* Arms (Training) */}
                    <motion.path
                        d="M35,95 L25,160 L45,160 L55,95 Z"
                        fill={stats.training > 0 ? "var(--primary)" : "#1a1a1a"}
                        stroke="var(--primary)"
                        strokeWidth="2"
                        animate={{ opacity: 0.3 + (stats.training * 0.7) }}
                    />
                    <motion.path
                        d="M165,95 L175,160 L155,160 L145,95 Z"
                        fill={stats.training > 0 ? "var(--primary)" : "#1a1a1a"}
                        stroke="var(--primary)"
                        strokeWidth="2"
                        animate={{ opacity: 0.3 + (stats.training * 0.7) }}
                    />

                    {/* Legs (Training/Recovery) */}
                    <motion.path
                        d="M65,220 L55,360 L85,360 L95,220 Z"
                        fill={stats.training > 0 ? "var(--primary)" : "#1a1a1a"}
                        stroke="var(--primary)"
                        strokeWidth="2"
                        animate={{ opacity: 0.3 + (stats.training * 0.7) }}
                    />
                    <motion.path
                        d="M135,220 L145,360 L115,360 L105,220 Z"
                        fill={stats.training > 0 ? "var(--primary)" : "#1a1a1a"}
                        stroke="var(--primary)"
                        strokeWidth="2"
                        animate={{ opacity: 0.3 + (stats.training * 0.7) }}
                    />

                    {/* Energy Field (Recovery) */}
                    <motion.ellipse
                        cx="100" cy="200" rx="90" ry="180"
                        fill="none"
                        stroke="var(--primary)"
                        strokeWidth="2"
                        strokeDasharray="10 20"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{
                            opacity: stats.recovery > 0 ? 0.4 : 0.1,
                            scale: stats.recovery > 0 ? [1, 1.02, 1] : 1,
                            rotate: 360
                        }}
                        transition={{
                            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                            scale: { duration: 2, repeat: Infinity }
                        }}
                    />
                </svg>
            </div>

            <div className="body-status-labels">
                <div className="status-label">
                    <span className="label-dot" style={{ background: stats.training > 0 ? 'var(--primary)' : '#333', boxShadow: stats.training > 0 ? '0 0 10px var(--primary)' : 'none' }}></span>
                    SYSTEM
                </div>
                <div className="status-label">
                    <span className="label-dot" style={{ background: stats.nutrition > 0 ? 'var(--primary)' : '#333', boxShadow: stats.nutrition > 0 ? '0 0 10px var(--primary)' : 'none' }}></span>
                    FUEL
                </div>
                <div className="status-label">
                    <span className="label-dot" style={{ background: stats.recovery > 0 ? 'var(--primary)' : '#333', boxShadow: stats.recovery > 0 ? '0 0 10px var(--primary)' : 'none' }}></span>
                    ENERGY
                </div>
            </div>
        </div>
    );
};

export default BodyWidget;
