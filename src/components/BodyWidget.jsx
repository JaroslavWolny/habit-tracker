import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Capsule, Cylinder, Box } from '@react-three/drei';
import * as THREE from 'three';
import './BodyWidget.css';

// --- PROCEDURAL MUSCLE COMPONENT ---
// A muscle that grows based on the 'pump' value (0 to 1)
const Muscle = ({ position, args, pump, rotation = [0, 0, 0], color, mirror = false }) => {
    const mesh = useRef();

    // Base size + Pump growth
    // args[0] is radius. We scale it up by 2x at max pump.
    const radius = args[0] * (1 + pump * 1.5);
    const length = args[1];

    return (
        <group position={position} rotation={rotation}>
            <Capsule args={[radius, length, 8, 16]}>
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.5 + (pump * 2)} // Glows brighter when pumped
                    roughness={0.3}
                    metalness={0.8}
                    wireframe={pump < 0.1} // Skeleton mode at low pump
                    transparent={true}
                    opacity={0.8}
                />
            </Capsule>
        </group>
    );
};

// --- THE TITAN AVATAR ---
const TitanAvatar = ({ completionRate, statusColor }) => {
    const group = useRef();

    // Idle Animation (Breathing + Floating)
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (group.current) {
            group.current.position.y = Math.sin(t * 0.5) * 0.1; // Float
            group.current.rotation.y = Math.sin(t * 0.2) * 0.15; // Rotate

            // Heavy Breathing (Scales with mass)
            const breathe = 1 + Math.sin(t * 1.5) * 0.02;
            group.current.scale.set(breathe, breathe, breathe);
        }
    });

    return (
        <group ref={group}>
            {/* HEAD (Helmet) */}
            <Sphere args={[0.35, 32, 32]} position={[0, 1.7, 0]}>
                <meshStandardMaterial color={statusColor} emissive={statusColor} emissiveIntensity={0.5} wireframe={true} />
            </Sphere>
            {/* Eyes */}
            <Box args={[0.4, 0.05, 0.2]} position={[0, 1.7, 0.25]}>
                <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={2} />
            </Box>

            {/* NECK (Traps grow huge) */}
            <Muscle position={[0, 1.45, 0]} args={[0.15, 0.2]} pump={completionRate} color={statusColor} />

            {/* TORSO (Pecs & Abs) */}
            {/* Spine/Core */}
            <Cylinder args={[0.2, 0.2, 1, 16]} position={[0, 0.9, 0]}>
                <meshStandardMaterial color="#333" wireframe={true} />
            </Cylinder>
            {/* Chest (Pecs) */}
            <Muscle position={[-0.2, 1.3, 0.15]} args={[0.25, 0.3]} pump={completionRate} rotation={[0, 0, -0.2]} color={statusColor} />
            <Muscle position={[0.2, 1.3, 0.15]} args={[0.25, 0.3]} pump={completionRate} rotation={[0, 0, 0.2]} color={statusColor} />
            {/* Abs (Six Pack) */}
            <Muscle position={[0, 0.9, 0.12]} args={[0.2, 0.5]} pump={completionRate * 0.8} color={statusColor} />

            {/* SHOULDERS (Delts) */}
            <Muscle position={[-0.6, 1.45, 0]} args={[0.28, 0.3]} pump={completionRate} color={statusColor} />
            <Muscle position={[0.6, 1.45, 0]} args={[0.28, 0.3]} pump={completionRate} color={statusColor} />

            {/* ARMS (Biceps/Triceps) */}
            <Muscle position={[-0.65, 1.0, 0]} args={[0.18, 0.5]} pump={completionRate} color={statusColor} />
            <Muscle position={[0.65, 1.0, 0]} args={[0.18, 0.5]} pump={completionRate} color={statusColor} />

            {/* FOREARMS */}
            <Muscle position={[-0.65, 0.4, 0]} args={[0.14, 0.5]} pump={completionRate} color={statusColor} />
            <Muscle position={[0.65, 0.4, 0]} args={[0.14, 0.5]} pump={completionRate} color={statusColor} />

            {/* LEGS (Quads) */}
            <Muscle position={[-0.25, 0.1, 0]} args={[0.22, 0.7]} pump={completionRate} color={statusColor} />
            <Muscle position={[0.25, 0.1, 0]} args={[0.22, 0.7]} pump={completionRate} color={statusColor} />

            {/* CALVES */}
            <Muscle position={[-0.25, -0.7, 0]} args={[0.16, 0.7]} pump={completionRate} color={statusColor} />
            <Muscle position={[0.25, -0.7, 0]} args={[0.16, 0.7]} pump={completionRate} color={statusColor} />
        </group>
    );
};

const BodyWidget = ({ stats, userLevel = 1 }) => {
    if (!stats) return null;

    // Calculate "Pump" (Completion Rate 0-1)
    // We average the stats to get a global 'mass' factor
    const completionRate = (stats.training + stats.nutrition + stats.recovery) / 3;

    // Determine State
    const isCritical = completionRate < 0.3;
    const isGodMode = completionRate > 0.9;
    const statusColor = isGodMode ? "#FFD700" : (isCritical ? "#ff003c" : "#39FF14");

    // Dynamic Text Logic
    const [message, setMessage] = useState("SYSTEM ONLINE");

    useEffect(() => {
        let text = "SYSTEM IDLE";
        if (completionRate < 0.2) text = "ATROPHY DETECTED. INITIATE TRAINING.";
        else if (completionRate < 0.5) text = `MUSCLE DENSITY: ${Math.round(completionRate * 100)}%`;
        else if (completionRate < 0.8) text = "HYPERTROPHY ACTIVE. GROWING.";
        else if (completionRate < 1.0) text = "OPTIMAL PHYSIQUE ACHIEVED.";
        else text = "GOD MODE ENGAGED. LIMITS BROKEN.";

        setMessage(text);
    }, [completionRate]);

    return (
        <div className="body-widget-container" style={{ height: '50vh', minHeight: '400px', width: '100%', position: 'relative' }}>

            {/* Chat Bubble Overlay */}
            <div className="cyber-chat-bubble" style={{ top: '20px', right: '20px', pointerEvents: 'none' }}>
                <span className="typing-text">{message}</span>
                <div style={{ fontSize: '0.6rem', color: '#888', marginTop: '4px' }}>
                    PUMP LEVEL: {Math.round(completionRate * 100)}%
                </div>
            </div>

            {/* 3D SCENE */}
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }} gl={{ antialias: true }}>
                <color attach="background" args={['#050505']} />

                {/* LIGHTING */}
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={2} color={statusColor} />
                <pointLight position={[-10, 5, 5]} intensity={1} color="#00ffff" />
                <pointLight position={[0, -5, 2]} intensity={0.5} color="#ff00ff" />

                {/* THE TITAN */}
                <TitanAvatar
                    completionRate={completionRate}
                    statusColor={statusColor}
                />

                {/* CONTROLS */}
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate={true}
                    autoRotateSpeed={0.5}
                    minPolarAngle={Math.PI / 2.5}
                    maxPolarAngle={Math.PI / 1.5}
                />
            </Canvas>

            {/* Level Badge */}
            <div className="level-badge" style={{ bottom: '20px' }}>LVL {userLevel}</div>
        </div>
    );
};

export default BodyWidget;
