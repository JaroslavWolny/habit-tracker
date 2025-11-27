import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Capsule, Cylinder } from '@react-three/drei';
// import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing'; // Temporarily disabled
import * as THREE from 'three';
import './BodyWidget.css';

// --- 3D AVATAR COMPONENT ---
const HologramAvatar = ({ stats, statusColor, isCritical, isGodMode }) => {
    const group = useRef();

    // Breathing & Floating Animation
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (group.current) {
            // Float
            group.current.position.y = Math.sin(t * 0.5) * 0.1;
            // Rotate
            group.current.rotation.y = Math.sin(t * 0.2) * 0.1;
            // Breathe (Scale Chest)
            const breathe = 1 + Math.sin(t * 2) * 0.02;
            group.current.scale.set(breathe, breathe, breathe);
        }
    });

    // Material for the Hologram (Simplified for debugging)
    const materialProps = useMemo(() => ({
        color: statusColor, // Use direct color for visibility
        emissive: statusColor,
        emissiveIntensity: 0.5,
        roughness: 0.2,
        metalness: 0.8,
        wireframe: true, // Wireframe is often safer/cooler for holograms
        transparent: true,
        opacity: 0.8,
    }), [statusColor]);

    return (
        <group ref={group}>
            {/* HEAD */}
            <Sphere args={[0.35, 16, 16]} position={[0, 1.6, 0]}>
                <meshStandardMaterial {...materialProps} />
            </Sphere>

            {/* TORSO */}
            <Cylinder args={[0.3, 0.2, 1, 16]} position={[0, 0.9, 0]}>
                <meshStandardMaterial {...materialProps} />
            </Cylinder>

            {/* CORE REACTOR */}
            <Sphere args={[0.15, 16, 16]} position={[0, 1.0, 0.25]}>
                <meshStandardMaterial
                    color="#ffffff"
                    emissive={statusColor}
                    emissiveIntensity={1}
                />
            </Sphere>

            {/* SHOULDERS */}
            <Sphere args={[0.25, 16, 16]} position={[-0.5, 1.3, 0]}>
                <meshStandardMaterial {...materialProps} />
            </Sphere>
            <Sphere args={[0.25, 16, 16]} position={[0.5, 1.3, 0]}>
                <meshStandardMaterial {...materialProps} />
            </Sphere>

            {/* ARMS */}
            <Capsule args={[0.12, 0.6, 4, 8]} position={[-0.55, 0.8, 0]}>
                <meshStandardMaterial {...materialProps} />
            </Capsule>
            <Capsule args={[0.12, 0.6, 4, 8]} position={[0.55, 0.8, 0]}>
                <meshStandardMaterial {...materialProps} />
            </Capsule>

            {/* HIPS */}
            <Cylinder args={[0.2, 0.25, 0.4, 16]} position={[0, 0.2, 0]}>
                <meshStandardMaterial {...materialProps} />
            </Cylinder>

            {/* LEGS */}
            <Capsule args={[0.13, 0.9, 4, 8]} position={[-0.25, -0.6, 0]}>
                <meshStandardMaterial {...materialProps} />
            </Capsule>
            <Capsule args={[0.13, 0.9, 4, 8]} position={[0.25, -0.6, 0]}>
                <meshStandardMaterial {...materialProps} />
            </Capsule>
        </group>
    );
};

const BodyWidget = ({ stats, userLevel = 1 }) => {
    if (!stats) return null;

    const [message, setMessage] = useState("SYSTEM ONLINE");

    // Derived State
    const isCritical = (stats.training < 0.3 || stats.nutrition < 0.3 || stats.recovery < 0.3);
    const isGodMode = stats.training > 0.9 && stats.nutrition > 0.9;
    const statusColor = isGodMode ? "#FFD700" : (isCritical ? "#ff003c" : "#39FF14");

    useEffect(() => {
        const phrases = ["SYSTEM OPTIMAL", "ANALYZING BIOMETRICS", "SYNCING...", "AWAITING INPUT"];
        const interval = setInterval(() => {
            setMessage(phrases[Math.floor(Math.random() * phrases.length)]);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="body-widget-container" style={{ height: '50vh', minHeight: '400px', width: '100%', position: 'relative' }}>

            {/* Chat Bubble Overlay */}
            <div className="cyber-chat-bubble" style={{ top: '20px', right: '20px', pointerEvents: 'none' }}>
                <span className="typing-text">{message}</span>
            </div>

            {/* 3D SCENE */}
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }} gl={{ antialias: true }}>
                {/* Background Color to verify Canvas is rendering */}
                <color attach="background" args={['#111']} />

                {/* LIGHTING */}
                <ambientLight intensity={1} />
                <pointLight position={[10, 10, 10]} intensity={2} color={statusColor} />
                <pointLight position={[-10, -10, -10]} intensity={1} color="blue" />

                {/* AVATAR */}
                <HologramAvatar
                    stats={stats}
                    statusColor={statusColor}
                    isCritical={isCritical}
                    isGodMode={isGodMode}
                />

                {/* CONTROLS */}
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate={true}
                    autoRotateSpeed={1}
                />
            </Canvas>

            {/* Level Badge */}
            <div className="level-badge" style={{ bottom: '20px' }}>LVL {userLevel}</div>
        </div>
    );
};

export default BodyWidget;
