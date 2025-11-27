import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import './BodyWidget.css';

// --- SVG PATHS (Unchanged geometry, organized for component splitting) ---
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
    },
    wiring: "M100,85 C120,85 120,160 100,160 C80,160 80,85 100,85 M50,105 C60,130 40,130 50,160 M150,105 C140,130 160,130 150,160"
};

const BodyWidget = ({ stats, isAllDone = false, streak = 0 }) => {
    // --- STATE & LOGIC ---
    const [activePart, setActivePart] = useState(null);
    const [isCharging, setIsCharging] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);
    const chargeTimerRef = useRef(null);
    const controls = useAnimation();

    // 1. Calculate "Needs" State
    // Critical: Any stat < 30%
    const isCritical = stats.training < 0.3 || stats.nutrition < 0.3 || stats.recovery < 0.3;
    // Optimal: All stats > 80%
    const isOptimal = stats.training > 0.8 && stats.nutrition > 0.8 && stats.recovery > 0.8;
    // Overdrive (God Mode): All Done + High Streak
    const isGodMode = isAllDone && streak > 7;

    // 2. Evolution System (Based on Streak/Level)
    // Level 1-5: Skeleton, 6-15: Synthetic (Muscles), 16+: Armored
    const userLevel = Math.max(1, streak); // Simple level mapping
    const showMuscles = userLevel >= 5 || isGodMode;
    const showArmor = userLevel >= 15 || isGodMode;

    // --- INTERACTION HANDLERS ---

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / 20; // Normalize -10 to 10
        const y = (e.clientY - rect.top - rect.height / 2) / 20;
        setMousePos({ x, y });
    };

    const handlePartTap = (partName, value) => {
        if (navigator.vibrate) navigator.vibrate(15);
        setActivePart({ name: partName, value: value });
        setTimeout(() => setActivePart(null), 3000);
    };

    // Recharge Mechanic (Hold to Charge)
    const startRecharge = () => {
        setIsCharging(true);
        if (navigator.vibrate) navigator.vibrate([10]); // Initial feedback

        let chargeTime = 0;
        chargeTimerRef.current = setInterval(() => {
            chargeTime += 100;
            // Ramp up vibration intensity
            if (chargeTime % 500 === 0 && navigator.vibrate) {
                navigator.vibrate(20 + (chargeTime / 100));
            }

            if (chargeTime >= 2000) {
                // SUCCESS
                completeRecharge();
            }
        }, 100);
    };

    const stopRecharge = () => {
        setIsCharging(false);
        if (chargeTimerRef.current) clearInterval(chargeTimerRef.current);
    };

    const completeRecharge = () => {
        stopRecharge();
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]); // Success pattern
        // Trigger Shockwave Animation
        controls.start({
            scale: [1, 1.2, 1],
            filter: ["brightness(1)", "brightness(2)", "brightness(1)"],
            transition: { duration: 0.5 }
        });
        // In a real app, this would update state/backend
        handlePartTap("SYSTEM RECHARGED", 100);
    };

    // --- ANIMATION VARIANTS ---

    const breatheAnim = {
        scale: isCritical ? [1, 1.05, 1] : [1, 1.02, 1],
        transition: {
            duration: isCritical ? 1 : 4,
            repeat: Infinity,
            ease: "easeInOut"
        }
    };

    const floatAnim = {
        y: isCritical ? [0, 2, -2, 0] : [-5, 5, -5], // Shiver if critical, float if normal
        x: isCritical ? [-2, 2, -2, 2, 0] : 0, // Shiver x
        transition: {
            duration: isCritical ? 0.2 : 6,
            repeat: Infinity,
            ease: "easeInOut"
        }
    };

    // --- RENDER HELPERS ---

    const getStatusColor = () => {
        if (isGodMode) return "#FFD700"; // Gold
        if (isCritical) return "#ff003c"; // Red
        if (isOptimal) return "#39FF14"; // Green
        return "var(--primary)"; // Default
    };

    const statusColor = getStatusColor();

    return (
        <div
            className={`body-widget-container ${isCritical ? 'status-critical' : ''} ${isOptimal ? 'status-optimal' : ''}`}
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
        >
            {/* 1. Background Effects */}
            <div className="medical-grid-bg" />
            {isCritical && <div className="cracked-overlay" />}
            {isOptimal && <div className="particles-container" />} {/* CSS Particles */}

            {/* 2. The Living Construct */}
            <motion.div
                className="body-silhouette-wrapper"
                animate={floatAnim}
            >
                <svg viewBox="0 0 200 400" className="body-svg">
                    <defs>
                        <filter id="glow-soft" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                        <pattern id="hex-mesh" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                            <path d="M4 0 L8 2 L8 6 L4 8 L0 6 L0 2 Z" fill="none" stroke={statusColor} strokeWidth="0.5" opacity="0.3" />
                        </pattern>
                    </defs>

                    {/* GROUP: HEAD (Gaze Tracking) */}
                    <motion.g
                        style={{ originX: "100px", originY: "50px" }}
                        animate={{ rotateX: mousePos.y, rotateY: mousePos.x }}
                    >
                        <path d={PATHS.skeleton.head} stroke={statusColor} strokeWidth="2" fill="rgba(0,0,0,0.8)" />
                        {/* Eyes / Visor */}
                        <motion.path
                            d="M90,45 L110,45"
                            stroke={isCritical ? "#ff003c" : (isOptimal ? "#FFF" : statusColor)}
                            strokeWidth={isOptimal ? 3 : 1}
                            style={{ filter: isOptimal ? "url(#glow-soft)" : "none" }}
                        />
                    </motion.g>

                    {/* GROUP: TORSO (Breathing) */}
                    <motion.g
                        style={{ originX: "100px", originY: "120px" }}
                        animate={breatheAnim}
                    >
                        <path d={PATHS.skeleton.spine} stroke="#333" strokeWidth="2" />
                        <path d={PATHS.skeleton.ribs} stroke="#333" strokeWidth="2" opacity="0.5" />

                        {/* Muscles Layer */}
                        {showMuscles && (
                            <motion.path
                                d={PATHS.muscles.torso}
                                fill="url(#hex-mesh)"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={() => handlePartTap("CORE MUSCULATURE", Math.round(stats.training * 100))}
                            />
                        )}

                        {/* Armor Layer */}
                        {showArmor && (
                            <motion.path
                                d={PATHS.armor.chest}
                                fill={statusColor}
                                fillOpacity={isGodMode ? 0.8 : 0.2}
                                stroke={statusColor}
                                strokeWidth="1"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                onClick={() => handlePartTap("CHEST PLATING", 100)}
                            />
                        )}

                        {/* CORE REACTOR (Recharge Interaction) */}
                        <motion.circle
                            cx="100" cy="110" r={isGodMode ? 12 : 8}
                            fill={isCharging ? "#FFF" : statusColor}
                            animate={controls}
                            style={{
                                cursor: 'pointer',
                                filter: `drop-shadow(0 0 ${isCharging ? 20 : 10}px ${statusColor})`
                            }}
                            onPointerDown={startRecharge}
                            onPointerUp={stopRecharge}
                            onPointerLeave={stopRecharge}
                        />
                        {/* Charge Ring */}
                        {isCharging && (
                            <motion.circle
                                cx="100" cy="110" r="20"
                                stroke={statusColor} strokeWidth="2" fill="none"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1.5, opacity: 0 }}
                                transition={{ duration: 1, repeat: Infinity }}
                            />
                        )}
                    </motion.g>

                    {/* GROUP: ARMS (Independent Movement potential) */}
                    <g>
                        {/* Left Arm */}
                        <path d={PATHS.skeleton.armsLeft} stroke="#333" strokeWidth="2" />
                        {showMuscles && (
                            <>
                                <path d={PATHS.muscles.upperArmLeft} fill="url(#hex-mesh)" onClick={() => handlePartTap("BICEP L", Math.round(stats.training * 100))} />
                                <path d={PATHS.muscles.lowerArmLeft} fill="url(#hex-mesh)" />
                            </>
                        )}
                        {showArmor && (
                            <path d={PATHS.armor.shoulderLeft} fill={statusColor} fillOpacity="0.2" stroke={statusColor} />
                        )}

                        {/* Right Arm */}
                        <path d={PATHS.skeleton.armsRight} stroke="#333" strokeWidth="2" />
                        {showMuscles && (
                            <>
                                <path d={PATHS.muscles.upperArmRight} fill="url(#hex-mesh)" onClick={() => handlePartTap("BICEP R", Math.round(stats.training * 100))} />
                                <path d={PATHS.muscles.lowerArmRight} fill="url(#hex-mesh)" />
                            </>
                        )}
                        {showArmor && (
                            <path d={PATHS.armor.shoulderRight} fill={statusColor} fillOpacity="0.2" stroke={statusColor} />
                        )}
                    </g>

                    {/* GROUP: LEGS */}
                    <g>
                        <path d={PATHS.skeleton.hips} stroke="#333" strokeWidth="2" />
                        <path d={PATHS.skeleton.legsLeft} stroke="#333" strokeWidth="2" />
                        <path d={PATHS.skeleton.legsRight} stroke="#333" strokeWidth="2" />

                        {showMuscles && (
                            <>
                                <path d={PATHS.muscles.thighLeft} fill="url(#hex-mesh)" onClick={() => handlePartTap("QUAD L", Math.round(stats.training * 100))} />
                                <path d={PATHS.muscles.thighRight} fill="url(#hex-mesh)" onClick={() => handlePartTap("QUAD R", Math.round(stats.training * 100))} />
                                <path d={PATHS.muscles.calfLeft} fill="url(#hex-mesh)" />
                                <path d={PATHS.muscles.calfRight} fill="url(#hex-mesh)" />
                            </>
                        )}
                        {showArmor && (
                            <>
                                <path d={PATHS.armor.thighLeft} fill={statusColor} fillOpacity="0.2" stroke={statusColor} />
                                <path d={PATHS.armor.thighRight} fill={statusColor} fillOpacity="0.2" stroke={statusColor} />
                            </>
                        )}
                    </g>

                    {/* Energy Shield (Recovery) */}
                    <motion.ellipse
                        cx="100" cy="200" rx="90" ry="190"
                        fill="none"
                        stroke={statusColor}
                        strokeWidth="1"
                        strokeDasharray="10 50"
                        animate={{
                            opacity: stats.recovery * 0.5,
                            rotate: 360
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        style={{ pointerEvents: 'none' }}
                    />

                </svg>
            </motion.div>

            {/* Diagnostic Overlay (Dynamic Status Bar) */}
            <AnimatePresence>
                {activePart && (
                    <motion.div
                        className="diagnostic-overlay"
                        initial={{ opacity: 0, y: 20, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 10, x: "-50%" }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="diag-header">SCANNING: <span style={{ color: statusColor }}>{activePart.name}</span></div>
                        <div className="diag-value">INTEGRITY: {activePart.value}%</div>
                        <div className="scan-line-anim" style={{ background: statusColor, boxShadow: `0 0 10px ${statusColor}` }}></div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Recharge Hint Overlay (Only if Critical and not charging) */}
            {isCritical && !isCharging && !activePart && (
                <motion.div
                    className="recharge-hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    HOLD CORE TO RECHARGE
                </motion.div>
            )}
        </div>
    );
};

export default BodyWidget;
