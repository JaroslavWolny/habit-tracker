import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './BodyWidget.css';

// Bezpečné varianty pro animace (žádné složité výpočty)
const breathingVariant = {
    idle: {
        scale: [1, 1.02, 1],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

const pulseVariant = {
    idle: {
        opacity: [0.4, 0.8, 0.4],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    },
    active: {
        opacity: [0.4, 1, 0.4],
        scale: [1, 1.1, 1],
        transition: { duration: 0.5 }
    }
};

const BodyWidget = ({ stats, userLevel = 1 }) => {
    // Safety check
    if (!stats) return null;

    const [reaction, setReaction] = useState(false);
    const [message, setMessage] = useState("SYSTEM ONLINE");

    // Reakce na změnu statistik (splnění úkolu)
    useEffect(() => {
        // Spustí vizuální "Power Surge"
        setReaction(true);

        // Náhodná hláška při aktivitě
        const phrases = [
            "ENERGY SPIKE DETECTED",
            "OPTIMIZING SYSTEMS...",
            "DOPAMINE RECEIVED",
            "MUSCLE DENSITY INCREASING",
            "SYNC COMPLETE"
        ];
        setMessage(phrases[Math.floor(Math.random() * phrases.length)]);

        // Reset reakce po chvíli
        const timer = setTimeout(() => {
            setReaction(false);
            setMessage("AWAITING INPUT..."); // Návrat do idle stavu
        }, 2000);

        return () => clearTimeout(timer);
    }, [stats]); // Reaguje kdykoliv se změní stats

    // Výpočet barvy jádra podle zdraví
    const coreColor = stats.nutrition > 0.8 ? "#39FF14" : (stats.nutrition > 0.3 ? "#FACC15" : "#FF003C");

    return (
        <div className="body-widget-container">
            {/* Chat Bubble - Reaktivní */}
            <div className="cyber-chat-bubble">
                <span className="typing-text">{message}</span>
            </div>

            <div className="avatar-wrapper">
                {/* Pozadí - Rotující mřížka (čisté CSS/SVG) */}
                <motion.div
                    className="grid-bg"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                />

                {/* Hlavní postava - SVG */}
                <svg viewBox="0 0 200 400" className="cyber-avatar-svg">
                    <defs>
                        <linearGradient id="muscleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#1a1a1a" />
                            <stop offset="50%" stopColor={reaction ? "#fff" : "#39FF14"} stopOpacity={stats.training || 0.5} /> {/* Blesk při reakci */}
                            <stop offset="100%" stopColor="#1a1a1a" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* SKELETON (Základ) */}
                    <path d="M100 50 L100 350 M70 100 L130 100 M60 350 L100 250 L140 350" stroke="#333" strokeWidth="4" fill="none" />

                    {/* HRUDNÍK (Dýchání) */}
                    <motion.g variants={breathingVariant} animate="idle" style={{ transformOrigin: "100px 150px" }}>
                        {/* Brnění / Svaly */}
                        <path
                            d="M70 120 Q100 180 130 120 Q130 80 100 80 Q70 80 70 120 Z"
                            fill="url(#muscleGradient)"
                            stroke={coreColor}
                            strokeWidth="2"
                        />

                        {/* JÁDRO (Reaktor - Tep) */}
                        <motion.circle
                            cx="100" cy="120" r={reaction ? 12 : 8}
                            fill={coreColor}
                            filter="url(#glow)"
                            variants={pulseVariant}
                            animate={reaction ? "active" : "idle"}
                        />
                    </motion.g>

                    {/* HLAVA (Oči) */}
                    <g transform="translate(0, -5)">
                        <path d="M85 40 Q100 20 115 40 Q115 70 85 70 Q70 55 85 40 Z" fill="#111" stroke="#555" strokeWidth="2" />

                        {/* Oči - Mrkání (Jednoduchá opacita) */}
                        <motion.g
                            animate={{ opacity: [1, 1, 0, 1] }} // Mrk
                            transition={{ duration: 4, times: [0, 0.9, 0.95, 1], repeat: Infinity }}
                        >
                            <circle cx="92" cy="50" r="2" fill="#fff" filter="url(#glow)" />
                            <circle cx="108" cy="50" r="2" fill="#fff" filter="url(#glow)" />
                        </motion.g>
                    </g>

                    {/* PAŽE (Zobrazení síly) */}
                    {stats.training > 0.2 && (
                        <motion.path
                            d="M60 120 Q40 180 50 220"
                            stroke="#39FF14"
                            strokeWidth={4 + (stats.training * 10)} // Tloustnutí svalů
                            strokeLinecap="round"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1 }}
                        />
                    )}
                    {stats.training > 0.2 && (
                        <motion.path
                            d="M140 120 Q160 180 150 220"
                            stroke="#39FF14"
                            strokeWidth={4 + (stats.training * 10)}
                            strokeLinecap="round"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1 }}
                        />
                    )}

                </svg>

                {/* Level Indicator */}
                <div className="level-badge">LVL {userLevel}</div>
            </div>
        </div>
    );
};

export default BodyWidget;
