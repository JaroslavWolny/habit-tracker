import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Capsule, Cylinder, useCursor } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import './BodyWidget.css';

// --- 3D AVATAR COMPONENT ---
const HologramAvatar = ({ stats, statusColor, isCritical, isGodMode }) => {
    const group = useRef();
    const [hovered, setHover] = useState(false);
    useCursor(hovered);

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

    // Material for the Hologram
    const materialProps = useMemo(() => ({
        color: "#000000",
        emissive: statusColor,
        emissiveIntensity: isGodMode ? 2 : (isCritical ? 3 : 1.5),
        roughness: 0.2,
        metalness: 0.8,
        wireframe: false,
        transparent: true,
        opacity: 0.9,
    }), [statusColor, isCritical, isGodMode]);

    return (
        <group ref={group} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
            {/* HEAD */}
            <Sphere args={[0.35, 32, 32]} position={[0, 1.6, 0]}>
                <meshStandardMaterial {...materialProps} />
            </Sphere>
            {/* Eyes (Visor) */}
            <Box args={[0.4, 0.1, 0.2]} position={[0, 1.6, 0.25]}>
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2} />
            </Box>

            {/* TORSO */}
            <Cylinder args={[0.3, 0.2, 1, 32]} position={[0, 0.9, 0]}>
                <meshStandardMaterial {...materialProps} />
            </Cylinder>

            {/* CORE REACTOR */}
            <Sphere args={[0.15, 32, 32]} position={[0, 1.0, 0.25]}>
                <meshStandardMaterial
                    color={statusColor}
                    emissive={statusColor}
                    emissiveIntensity={3}
                    toneMapped={false}
                />
            </Sphere>

            {/* SHOULDERS */}
            <Sphere args={[0.25, 32, 32]} position={[-0.5, 1.3, 0]}>
                <meshStandardMaterial {...materialProps} />
            </Sphere>
            <Sphere args={[0.25, 32, 32]} position={[0.5, 1.3, 0]}>
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
            <Cylinder args={[0.2, 0.25, 0.4, 32]} position={[0, 0.2, 0]}>
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

// Helper for Box geometry since 'Box' isn't exported directly sometimes
const Box = (props) => {
    return (
        <mesh {...props}>
            <boxGeometry args={props.args} />
            {props.children}
        </mesh>
    )
}


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
            <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }} gl={{ antialias: false }}>
                <color attach="background" args={['#050505']} />
                <fog attach="fog" args={['#050505', 5, 15]} />

                {/* LIGHTING */}
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color={statusColor} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#0000ff" />

                {/* AVATAR */}
                <HologramAvatar
                    stats={stats}
                    statusColor={statusColor}
                    isCritical={isCritical}
                    isGodMode={isGodMode}
                />

                {/* POST PROCESSING (The Glow) */}
                <EffectComposer disableNormalPass>
                    <Bloom luminanceThreshold={0} mipmapBlur intensity={1.5} radius={0.6} />
                    <Noise opacity={0.05} />
                    <Vignette eskil={false} offset={0.1} darkness={1.1} />
                </EffectComposer>

                {/* CONTROLS */}
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    minPolarAngle={Math.PI / 2.5}
                    maxPolarAngle={Math.PI / 1.5}
                    autoRotate={true}
                    autoRotateSpeed={0.5}
                />
            </Canvas>

            {/* Level Badge */}
            <div className="level-badge" style={{ bottom: '20px' }}>LVL {userLevel}</div>
        </div>
    );
};

export default BodyWidget;
