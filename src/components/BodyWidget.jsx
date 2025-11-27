import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './BodyWidget.css';

// --- SVG PATHS DEFINITION ---
const PATHS = {
    skeleton: {
        head: "M85,30 L115,30 L125,50 L115,75 L85,75 L75,50 Z",
        spine: "M100,75 L100,160",
        hips: "M75,160 L125,160 L120,190 L80,190 Z",
        legs: "M90,190 L90,380 M110,190 L110,380",
        arms: "M50,85 L50,220 M150,85 L150,220",
        ribs: "M80,100 L120,100 M85,120 L115,120 M90,140 L110,140"
    },
    muscles: {
        torso: "M70,85 L130,85 L120,160 L80,160 Z",
        upperArmsLeft: "M35,105 L65,105 L60,160 L40,160 Z",
        upperArmsRight: "M135,105 L165,105 L160,160 L140,160 Z",
        lowerArmsLeft: "M40,160 L60,160 L55,220 L45,220 Z",
        lowerArmsRight: "M140,160 L160,160 L155,220 L145,220 Z",
        thighsLeft: "M80,190 L100,190 L95,280 L85,280 Z",
        thighsRight: "M100,190 L120,190 L115,280 L105,280 Z",
        calvesLeft: "M85,280 L95,280 L90,380 L80,380 Z",
        calvesRight: "M105,280 L115,280 L110,380 L100,380 Z"
    },
    armor: {
        chest: "M65,85 L135,85 L130,130 L100,150 L70,130 Z",
        shouldersLeft: "M20,80 L70,80 L65,115 L25,110 Z",
        shouldersRight: "M130,80 L180,80 L175,110 L135,115 Z",
        thighsLeft: "M75,190 L100,190 L95,250 L80,250 Z",
        thighsRight: "M100,190 L125,190 L120,250 L105,250 Z"
    },
    wiring: "M100,85 C120,85 120,160 100,160 C80,160 80,85 100,85 M50,105 C60,130 40,130 50,160 M150,105 C140,130 160,130 150,160"
};

const BodyWidget = ({ stats, isAllDone = false }) => {
    // stats: { training: 0-1, nutrition: 0-1, recovery: 0-1, know: 0-100 }
    const [hoveredPart, setHoveredPart] = useState(null);
    const [scanLine, setScanLine] = useState(false);

    // Normalize knowledge if it's 0-100
    const knowledgeLevel = stats.know > 1 ? stats.know / 100 : stats.know;

    // Calculate average for Glitch Mode
    const avgStats = (stats.training + stats.nutrition + stats.recovery + knowledgeLevel) / 4;
    const isGlitch = avgStats < 0.2;
    const isGodMode = isAllDone || (stats.training >= 1 && stats.nutrition >= 1 && stats.recovery >= 1 && knowledgeLevel >= 1);

    // --- HELPER FUNCTIONS ---
    const getReactorStatus = (level) => {
        if (isGodMode) return { color: "#FFD700", glow: "#FFFFFF", animate: { scale: [1, 1.2, 1], filter: "brightness(1.5)" }, t: 3 };
        if (level < 0.3) return { color: "#ff003c", glow: "#ff003c", animate: { scale: [1, 0.9, 1], opacity: [0.8, 1, 0.8] }, t: 0.2 }; // Critical
        if (level > 0.8) return { color: "#39FF14", glow: "#39FF14", animate: { scale: [1, 1.05, 1] }, t: 2 };   // Optimal
        return { color: "#facc15", glow: "#facc15", animate: { opacity: [0.8, 1, 0.8] }, t: 1 };                // Normal
    };

    const reactor = getReactorStatus(stats.nutrition);

    const handleClick = () => {
        setScanLine(true);
        // Play sound here if possible
        setTimeout(() => setScanLine(false), 2000);
    };

    // --- SUB-COMPONENTS ---
    const Tooltip = ({ x, y, text }) => (
        <motion.div
            className="body-tooltip"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{ left: x, top: y }}
        >
            {text}
        </motion.div>
    );

    const AvatarLayer = ({ isGhost = false, offset = { x: 0, y: 0 }, colorOverride = null }) => (
        <svg viewBox="0 0 200 400" className="body-svg" style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}>
            <defs>
                <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="scan-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="50%" stopColor={isGodMode ? "#FFD700" : "var(--primary)"} stopOpacity="0.8" />
                    <stop offset="100%" stopColor="transparent" />
                </linearGradient>
            </defs>

            {/* 1. BASE SKELETON (Always visible, dark) */}
            <g stroke={colorOverride || "#333"} strokeWidth="2" fill="none" opacity={0.6}>
                {Object.values(PATHS.skeleton).map((d, i) => <path key={i} d={d} />)}
            </g>

            {/* 2. INTERNAL WIRING (Visible if low health/training) */}
            {(stats.training < 0.4 || isGlitch) && (
                <motion.path
                    d={PATHS.wiring}
                    stroke={isGlitch ? "#ff003c" : "#facc15"}
                    strokeWidth="1"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.8 }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                />
            )}

            {/* 3. NANO MUSCLES (Opacity based on Training) */}
            <g fill={colorOverride || "var(--primary)"} stroke="none">
                {Object.entries(PATHS.muscles).map(([key, d]) => (
                    <motion.path
                        key={key}
                        d={d}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.1 + (stats.training * 0.6) }}
                        onMouseEnter={(e) => setHoveredPart({ x: e.clientX, y: e.clientY - 40, text: `Muscles: ${Math.round(stats.training * 100)}%` })}
                        onMouseLeave={() => setHoveredPart(null)}
                    />
                ))}
            </g>

            {/* 4. ARMOR PLATING (Visible if Training > 0.5 or God Mode) */}
            {(stats.training > 0.5 || isGodMode) && (
                <g fill={isGodMode ? "#FFD700" : (colorOverride || "var(--primary)")} stroke={isGodMode ? "#FFF" : "none"} strokeWidth="1">
                    {Object.entries(PATHS.armor).map(([key, d]) => (
                        <motion.path
                            key={key}
                            d={d}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: isGodMode ? 0.9 : 0.4 + (stats.training * 0.4) }}
                            transition={{ duration: 0.5 }}
                            style={{ filter: isGodMode ? "url(#glow-strong)" : "none" }}
                            onMouseEnter={(e) => setHoveredPart({ x: e.clientX, y: e.clientY - 40, text: `Armor: ${isGodMode ? 'GOD' : 'Active'}` })}
                            onMouseLeave={() => setHoveredPart(null)}
                        />
                    ))}
                </g>
            )}

            {/* 5. CORE REACTOR (Nutrition) */}
            <motion.circle
                cx="100" cy="110" r={isGodMode ? 12 : 8}
                fill={reactor.color}
                animate={reactor.animate}
                transition={{ duration: reactor.t, repeat: Infinity }}
                style={{ filter: `drop-shadow(0 0 ${isGodMode ? 20 : 10}px ${reactor.glow})` }}
                onMouseEnter={(e) => setHoveredPart({ x: e.clientX, y: e.clientY - 40, text: `Core: ${Math.round(stats.nutrition * 100)}%` })}
                onMouseLeave={() => setHoveredPart(null)}
            />

            {/* 6. DATA HALO (Knowledge) */}
            <motion.ellipse
                cx="100" cy="50" rx="40" ry="10"
                fill="none"
                stroke={isGodMode ? "#00FFFF" : "var(--primary)"}
                strokeWidth="1"
                strokeDasharray="5 5"
                animate={{
                    opacity: knowledgeLevel,
                    rotateX: [0, 70, 0],
                    rotateZ: [0, 360]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                style={{ filter: `drop-shadow(0 0 5px ${isGodMode ? "#00FFFF" : "var(--primary)"})` }}
            />

            {/* 7. ENERGY SHIELD (Recovery) */}
            <motion.ellipse
                cx="100" cy="200" rx="90" ry="190"
                fill="none"
                stroke={isGodMode ? "#FFF" : "var(--primary)"}
                strokeWidth="2"
                strokeDasharray="20 40"
                initial={{ opacity: 0 }}
                animate={{
                    opacity: stats.recovery * 0.5,
                    scale: [1, 1.02, 1],
                    rotate: 360
                }}
                transition={{
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity }
                }}
            />

            {/* Scan Line Effect */}
            {scanLine && (
                <motion.rect
                    x="0" y="0" width="200" height="20"
                    fill="url(#scan-gradient)"
                    initial={{ y: 0, opacity: 0.8 }}
                    animate={{ y: 400, opacity: 0 }}
                    transition={{ duration: 1.5, ease: "linear" }}
                />
            )}
        </svg>
    );

    return (
        <div className={`body-widget-container ${isGlitch ? 'glitch-active' : ''}`} onClick={handleClick}>
            {/* God Mode Background Geometry */}
            {isGodMode && <div className="god-mode-bg" />}

            {/* Glitch Layers (RGB Split) */}
            {isGlitch && (
                <>
                    <div className="glitch-layer red">
                        <AvatarLayer isGhost={true} offset={{ x: -2, y: 0 }} colorOverride="#ff003c" />
                    </div>
                    <div className="glitch-layer blue">
                        <AvatarLayer isGhost={true} offset={{ x: 2, y: 0 }} colorOverride="#00FFFF" />
                    </div>
                </>
            )}

            {/* Main Avatar */}
            <motion.div
                className="body-silhouette-wrapper"
                animate={isGodMode ? { y: [0, -20, 0] } : { y: 0 }}
                transition={isGodMode ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : {}}
            >
                <AvatarLayer />
            </motion.div>

            {/* Tooltip Portal */}
            <AnimatePresence>
                {hoveredPart && (
                    <Tooltip x={hoveredPart.x} y={hoveredPart.y} text={hoveredPart.text} />
                )}
            </AnimatePresence>

            {/* Status Labels (Optional, kept for context) */}
            <div className="body-status-labels" style={{ marginTop: '1rem', opacity: 0.8 }}>
                <div className="status-label">
                    <span className="label-dot" style={{ background: reactor.color, boxShadow: `0 0 10px ${reactor.color}` }}></span>
                    {isGodMode ? 'GOD MODE' : (isGlitch ? 'CRITICAL' : 'SYSTEM ONLINE')}
                </div>
            </div>
        </div>
    );
};

export default BodyWidget;
