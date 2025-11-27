import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Capsule, Cylinder, Box, RoundedBox, Environment, ContactShadows } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import './BodyWidget.css';

// --- 2D UI COMPONENTS (TURBINES) ---

const TurbineGauge = ({ label, value, color, onClick }) => {
    // Speed: Lower value = Slower rotation (higher duration)
    // 0% = 20s duration, 100% = 2s duration
    const speed = 20 - (value * 18);
    const isCritical = value < 0.3;

    return (
        <div className="turbine-container" onClick={onClick}>
            {/* Rotating Ring */}
            <motion.div
                className="turbine-ring"
                style={{ borderTopColor: color, borderRightColor: color }}
                animate={{ rotate: 360 }}
                transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
            />
            {/* Inner Static Ring */}
            <div className="turbine-inner" style={{ borderColor: `${color}40` }}>
                <div className="turbine-value" style={{ color: color }}>
                    {Math.round(value * 100)}%
                </div>
                <div className="turbine-label">{label}</div>
            </div>
            {/* Critical Warning */}
            {isCritical && (
                <motion.div
                    className="turbine-warning"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                />
            )}
        </div>
    );
};

const EnergyCable = ({ startX, startY, endX, endY, color, intensity }) => {
    // Path definition
    const controlY = endY + 50; // Curve control point
    const d = `M ${startX} ${startY} C ${startX} ${controlY}, ${endX} ${controlY}, ${endX} ${endY}`;

    return (
        <svg className="energy-cable-svg">
            {/* Background Path (Dim) */}
            <path d={d} stroke={color} strokeWidth="2" strokeOpacity="0.2" fill="none" />

            {/* Flowing Energy (Bright) */}
            {intensity > 0 && (
                <motion.path
                    d={d}
                    stroke={color}
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="10, 20"
                    animate={{ strokeDashoffset: [0, -30] }}
                    transition={{ duration: 1 / (intensity + 0.1), repeat: Infinity, ease: "linear" }}
                />
            )}
        </svg>
    );
};

// --- 3D AVATAR COMPONENTS ---

const MuscleGroup = ({ position, rotation, scale = [1, 1, 1], pump, baseSize, color, geometry = 'capsule', intensity = 0 }) => {
    const growth = 1 + (pump * 0.3);
    const finalScale = [scale[0] * growth, scale[1] * growth, scale[2] * growth];

    const Material = (
        <meshPhysicalMaterial
            color={intensity > 0 ? color : "#444444"}
            roughness={0.4}
            metalness={0.7}
            clearcoat={0.5}
            clearcoatRoughness={0.1}
            emissive={color}
            emissiveIntensity={intensity * 2}
        />
    );

    if (geometry === 'box') return <group position={position} rotation={rotation} scale={finalScale}><RoundedBox args={baseSize} radius={0.05} smoothness={4}>{Material}</RoundedBox></group>;
    if (geometry === 'sphere') return <group position={position} rotation={rotation} scale={finalScale}><Sphere args={[baseSize[0], 16, 16]}>{Material}</Sphere></group>;
    return <group position={position} rotation={rotation} scale={finalScale}><Capsule args={[baseSize[0], baseSize[1], 8, 16]}>{Material}</Capsule></group>;
};

const SyntheticHuman = ({ stats, isCritical, isOverdrive }) => {
    const group = useRef();

    // Stats Normalization
    const training = stats.training || 0;
    const nutrition = stats.nutrition || 0;
    const recovery = stats.recovery || 0;
    const knowledge = (stats.know || 0) / 100;

    // Colors
    const colTraining = "#ff3333";
    const colNutrition = "#39FF14";
    const colRecovery = "#33ccff";
    const colKnowledge = "#9D00FF";

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (group.current) {
            // Base Animation
            let yPos = -1.2 + Math.sin(t * 0.5) * 0.05;
            let rotY = Math.sin(t * 0.2) * 0.15;

            // Critical State: Shaking
            if (isCritical) {
                group.current.position.x = (Math.random() - 0.5) * 0.02;
                group.current.position.z = (Math.random() - 0.5) * 0.02;
            } else {
                group.current.position.x = 0;
                group.current.position.z = 0;
            }

            // Overdrive State: Levitation
            if (isOverdrive) {
                yPos = -1.0 + Math.sin(t * 2) * 0.1; // Higher and faster float
                rotY += t * 0.5; // Spin
            }

            group.current.position.y = yPos;
            group.current.rotation.y = rotY;
        }
    });

    return (
        <group ref={group}>
            {/* Brain */}
            <MuscleGroup position={[0, 1.75, 0]} baseSize={[0.22]} geometry="sphere" pump={0} color={colKnowledge} intensity={knowledge} />
            {/* Core */}
            <MuscleGroup position={[0, 1.1, 0.14]} scale={[1, 0.6, 0.3]} baseSize={[0.1]} geometry="sphere" pump={training} color={colNutrition} intensity={nutrition} />
            {/* Spine */}
            <MuscleGroup position={[0, 1.5, 0]} baseSize={[0.12, 0.3]} geometry="capsule" pump={training} color={colRecovery} intensity={recovery} />
            {/* Muscles */}
            <MuscleGroup position={[-0.55, 1.5, 0]} baseSize={[0.24]} geometry="sphere" pump={training} color={colTraining} intensity={training} />
            <MuscleGroup position={[0.55, 1.5, 0]} baseSize={[0.24]} geometry="sphere" pump={training} color={colTraining} intensity={training} />
            <MuscleGroup position={[-0.18, 1.35, 0.12]} scale={[1, 0.8, 0.5]} baseSize={[0.22]} geometry="sphere" pump={training} color={colTraining} intensity={training} />
            <MuscleGroup position={[0.18, 1.35, 0.12]} scale={[1, 0.8, 0.5]} baseSize={[0.22]} geometry="sphere" pump={training} color={colTraining} intensity={training} />
        </group>
    );
};

const BodyWidget = ({ stats, userLevel = 1 }) => {
    if (!stats) return null;

    // Derived Stats
    const str = stats.str / 100 || 0;
    const rec = stats.rec / 100 || 0;
    const know = stats.know / 100 || 0;

    const isCritical = str < 0.2 || rec < 0.2 || know < 0.2;
    const isOverdrive = str > 0.9 && rec > 0.9 && know > 0.9;

    // Colors
    const colStr = "#ff3333";
    const colRec = "#33ccff";
    const colKnow = "#9D00FF";

    return (
        <div className="bio-monitor-container">

            {/* 3D AVATAR LAYER */}
            <div className="avatar-layer">
                <Canvas camera={{ position: [0, 0.5, 5.5], fov: 35 }} gl={{ antialias: true, alpha: true }}>
                    <Environment preset="city" />
                    <ambientLight intensity={0.5} />
                    <spotLight position={[0, 2, -5]} intensity={5} color="#ffffff" distance={10} /> {/* Rim Light */}
                    <pointLight position={[5, 5, 5]} intensity={1} />

                    <SyntheticHuman stats={stats} isCritical={isCritical} isOverdrive={isOverdrive} />

                    <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={10} blur={2.5} far={4} />
                    <OrbitControls enableZoom={false} enablePan={false} autoRotate={!isCritical} autoRotateSpeed={0.8} />
                </Canvas>
            </div>

            {/* CABLE LAYER (SVG Overlay) */}
            <div className="cable-layer">
                {/* Cables connecting bottom turbines to center chest (approx 50% width, 40% height) */}
                <EnergyCable startX="15%" startY="100%" endX="50%" endY="40%" color={colStr} intensity={str} />
                <EnergyCable startX="50%" startY="100%" endX="50%" endY="40%" color={colRec} intensity={rec} />
                <EnergyCable startX="85%" startY="100%" endX="50%" endY="40%" color={colKnow} intensity={know} />
            </div>

            {/* TURBINE GAUGE LAYER */}
            <div className="turbine-layer">
                <TurbineGauge label="STR" value={str} color={colStr} onClick={() => navigator.vibrate && navigator.vibrate(20)} />
                <TurbineGauge label="REC" value={rec} color={colRec} onClick={() => navigator.vibrate && navigator.vibrate(20)} />
                <TurbineGauge label="KNOW" value={know} color={colKnow} onClick={() => navigator.vibrate && navigator.vibrate(20)} />
            </div>

            {/* Level Badge */}
            <div className="level-badge">LVL {userLevel}</div>
        </div>
    );
};

export default BodyWidget;
