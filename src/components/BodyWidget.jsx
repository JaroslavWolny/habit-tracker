import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
// import { useDrag } from '@use-gesture/react'; // Temporarily disabled
import './BodyWidget.css';

// --- SVG PATHS ---
const PATHS = {
    skeleton: {
        head: "M85,30 L115,30 L125,50 L115,75 L85,75 L75,50 Z",
        spine: "M100,75 L100,160",
        hips: "M75,160 L125,160 L120,190 L80,190 Z",
        legsLeft: "M90,190 L90,380",
        legsRight: "M110,190 L110,380",
        armsLeft: "M50,85 L50,220",
        armsRight: "M150,85 L150,220",
        ribs: "M80,100 L120,100 M85,120 L115,120 M90,140 L110,140"
    },
    muscles: {
        torso: "M70,85 L130,85 L120,160 L80,160 Z",
        upperArmLeft: "M35,105 L65,105 L60,160 L40,160 Z",
        upperArmRight: "M135,105 L165,105 L160,160 L140,160 Z",
        lowerArmLeft: "M40,160 L60,160 L55,220 L45,220 Z",
        lowerArmRight: "M140,160 L160,160 L155,220 L145,220 Z",
        thighLeft: "M80,190 L100,190 L95,280 L85,280 Z",
        thighRight: "M100,190 L120,190 L115,280 L105,280 Z",
        calfLeft: "M85,280 L95,280 L90,380 L80,380 Z",
        calfRight: "M105,280 L115,280 L110,380 L100,380 Z"
    },
    armor: {
        chest: "M65,85 L135,85 L130,130 L100,150 L70,130 Z",
        shoulderLeft: "M20,80 L70,80 L65,115 L25,110 Z",
        shoulderRight: "M130,80 L180,80 L175,110 L135,115 Z",
        thighLeft: "M75,190 L100,190 L95,250 L80,250 Z",
        thighRight: "M100,190 L125,190 L120,250 L105,250 Z"
    }
};

// --- SUB-COMPONENTS ---

const ChatBubble = ({ status, level }) => {
    const [text, setText] = useState("");
    const fullText = useMemo(() => {
        if (status === 'critical') return "SYSTEM CRITICAL. INTEGRITY FAILING.";
        if (status === 'god') return "I AM EFFICIENT. I AM UNSTOPPABLE.";
        return "SYSTEM ONLINE. AWAITING INPUT.";
    }, [status]);

    useEffect(() => {
        let i = 0;
        setText("");
        const interval = setInterval(() => {
            setText(fullText.slice(0, i + 1));
            i++;
            if (i > fullText.length) clearInterval(interval);
        }, 50);
        return () => clearInterval(interval);
    }, [fullText]);

    return (
        <motion.div
            className="chat-bubble"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={status}
        >
            <div className="chat-text">{text}<span className="cursor-blink">_</span></div>
            <div className="chat-line"></div>
        </motion.div>
    );
};

const AvatarConstruct = ({ stats, statusColor, isCritical, isOptimal, showMuscles, showArmor, onPartTap, isGhost = false }) => {
    return (
        <svg viewBox="0 0 200 400" className="body-svg" style={{ opacity: isGhost ? 0.3 : 1 }}>
            <defs>
                <filter id="plasma-flow">
                    <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" />
                    {/* Removed animate tag to prevent React crashes */}
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" />
                </filter>
                <pattern id="hex-mesh-organic" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                    <path d="M4 0 L8 2 L8 6 L4 8 L0 6 L0 2 Z" fill="none" stroke={statusColor} strokeWidth="0.5" opacity="0.3" />
                    <rect width="8" height="8" fill={statusColor} opacity="0.1" />
                </pattern>
            </defs>

            {/* SKELETON */}
            <g stroke={isGhost ? statusColor : "#333"} strokeWidth="2" fill="none">
                {Object.values(PATHS.skeleton).map((d, i) => <path key={i} d={d} />)}
            </g>

            {/* MUSCLES (With Plasma Filter) */}
            {showMuscles && (
                <g filter={isOptimal ? "url(#plasma-flow)" : "none"}>
                    {Object.entries(PATHS.muscles).map(([key, d]) => (
                        <motion.path
                            key={key}
                            d={d}
                            fill={isGhost ? "none" : "url(#hex-mesh-organic)"}
                            stroke={isGhost ? statusColor : "none"}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => !isGhost && onPartTap(key, Math.round(stats.training * 100))}
                            style={{ cursor: 'pointer' }}
                        />
                    ))}
                </g>
            )}

            {/* ARMOR */}
            {showArmor && (
                <g>
                    {Object.entries(PATHS.armor).map(([key, d]) => (
                        <motion.path
                            key={key}
                            d={d}
                            fill={isGhost ? "none" : statusColor}
                            fillOpacity={isGhost ? 0 : 0.2}
                            stroke={statusColor}
                            strokeWidth="1"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            onClick={() => !isGhost && onPartTap(key, 100)}
                            style={{ cursor: 'pointer' }}
                        />
                    ))}
                </g>
            )}

            {/* EYES */}
            <motion.path
                d="M90,45 L110,45"
                stroke={isCritical ? "#ff003c" : (isOptimal ? "#FFF" : statusColor)}
                strokeWidth={isOptimal ? 3 : 1}
            />
        </svg>
    );
};

const BodyWidget = ({ stats, isAllDone = false, streak = 0 }) => {
    // Safety check
    if (!stats) return null;

    // --- STATE ---
    const [activePart, setActivePart] = useState(null);
    // const [dirtLevel, setDirtLevel] = useState(stats.training < 0.3 ? 1 : 0); // Disabled for safety
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    // --- DERIVED STATE ---
    const isCritical = stats.training < 0.3 || stats.nutrition < 0.3 || stats.recovery < 0.3;
    const isOptimal = stats.training > 0.8 && stats.nutrition > 0.8 && stats.recovery > 0.8;
    const isGodMode = isAllDone && streak > 7;
    const userLevel = Math.max(1, streak);
    const showMuscles = userLevel >= 5 || isGodMode;
    const showArmor = userLevel >= 15 || isGodMode;

    const statusColor = isGodMode ? "#FFD700" : (isCritical ? "#ff003c" : (isOptimal ? "#39FF14" : "var(--primary)"));
    const statusType = isGodMode ? 'god' : (isCritical ? 'critical' : 'normal');

    // --- ANIMATIONS ---
    const floatAnim = {
        y: isCritical ? [0, 2, -2, 0] : [-5, 5, -5],
        transition: { duration: isCritical ? 0.2 : 6, repeat: Infinity, ease: "easeInOut" }
    };

    // Heartbeat Effect (Global Pulse)
    const heartbeat = {
        scale: [1, 1.02, 1],
        transition: { duration: 1, repeat: Infinity, ease: "easeInOut" } // 60 BPM
    };

    // --- INTERACTION ---
    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / 20;
        const y = (e.clientY - rect.top - rect.height / 2) / 20;
        setMousePos({ x, y });
    };

    const handlePartTap = (partName, value) => {
        if (navigator.vibrate) navigator.vibrate(15);
        setActivePart({ name: partName, value: value });
        setTimeout(() => setActivePart(null), 3000);
    };

    // Cleaning Gesture - Disabled for safety
    /*
    const bindClean = useDrag(({ movement: [mx, my], velocity: [vx, vy], down }) => {
        if (down && dirtLevel > 0) {
            const speed = Math.abs(vx) + Math.abs(vy);
            if (speed > 0.5) {
                setDirtLevel(prev => Math.max(0, prev - 0.02));
                if (navigator.vibrate && Math.random() > 0.7) navigator.vibrate(5);
            }
        }
    });
    */

    return (
        <div
            className={`body-widget-container ${isCritical ? 'status-critical' : ''} ${isOptimal ? 'status-optimal' : ''}`}
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
            // {...bindClean()} 
            style={{ touchAction: 'none' }}
        >
            {/* Backgrounds */}
            <div className="medical-grid-bg" />
            {isOptimal && <div className="particles-container" />}

            {/* Chat Bubble */}
            <ChatBubble status={statusType} level={userLevel} />

            {/* Ghost Trails (Motion Blur) */}
            {isOptimal && (
                <>
                    <motion.div className="body-silhouette-wrapper ghost-layer" animate={floatAnim} style={{ opacity: 0.3, filter: 'blur(2px)', transform: 'translate(-5px, 0)' }}>
                        <AvatarConstruct {...{ stats, statusColor, isCritical, isOptimal, showMuscles, showArmor, onPartTap }} isGhost={true} />
                    </motion.div>
                    <motion.div className="body-silhouette-wrapper ghost-layer" animate={floatAnim} style={{ opacity: 0.2, filter: 'blur(4px)', transform: 'translate(5px, 0)' }}>
                        <AvatarConstruct {...{ stats, statusColor, isCritical, isOptimal, showMuscles, showArmor, onPartTap }} isGhost={true} />
                    </motion.div>
                </>
            )}

            {/* Main Avatar */}
            <motion.div
                className="body-silhouette-wrapper"
                animate={{ ...floatAnim, ...heartbeat }}
            >
                <AvatarConstruct {...{ stats, statusColor, isCritical, isOptimal, showMuscles, showArmor, onPartTap }} />
            </motion.div>

            {/* Dirt Overlay (Cleaning Mechanic) - Disabled */}
            {/*
            {dirtLevel > 0 && (
                <div 
                    className="dirt-overlay" 
                    style={{ opacity: dirtLevel }}
                >
                    <div className="dirt-noise"></div>
                    <div className="clean-hint">SWIPE TO CLEAN SYSTEM</div>
                </div>
            )}
            */}

            {/* Diagnostic Overlay */}
            <AnimatePresence>
                {activePart && (
                    <motion.div
                        className="diagnostic-overlay"
                        initial={{ opacity: 0, y: 20, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 10, x: "-50%" }}
                    >
                        <div className="diag-header">SCANNING: <span style={{ color: statusColor }}>{activePart.name}</span></div>
                        <div className="diag-value">INTEGRITY: {activePart.value}%</div>
                        <div className="scan-line-anim" style={{ background: statusColor, boxShadow: `0 0 10px ${statusColor}` }}></div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BodyWidget;
