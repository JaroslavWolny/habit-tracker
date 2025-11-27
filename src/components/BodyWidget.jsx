import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Capsule, Cylinder, Box, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import './BodyWidget.css';

// --- ADVANCED ANATOMY COMPONENTS ---

const MuscleGroup = ({ position, rotation, scale = [1, 1, 1], pump, baseSize, color, geometry = 'capsule', intensity = 0 }) => {
    // Growth based on global pump (training)
    const growth = 1 + (pump * 0.3);
    const finalScale = [
        scale[0] * growth,
        scale[1] * growth,
        scale[2] * growth
    ];

    // Dynamic Emissive Material
    // If intensity > 0, it glows with the specific category color.
    // Otherwise, it's a sleek dark matte material.
    const Material = (
        <meshStandardMaterial
            color={intensity > 0 ? color : "#2a2a2a"} // Dark grey base
            roughness={0.5}
            metalness={0.6}
            emissive={color}
            emissiveIntensity={intensity * 2} // Glow brightness
        />
    );

    if (geometry === 'box') {
        return (
            <group position={position} rotation={rotation} scale={finalScale}>
                <RoundedBox args={baseSize} radius={0.05} smoothness={4}>
                    {Material}
                </RoundedBox>
            </group>
        );
    }

    if (geometry === 'sphere') {
        return (
            <group position={position} rotation={rotation} scale={finalScale}>
                <Sphere args={[baseSize[0], 16, 16]}>
                    {Material}
                </Sphere>
            </group>
        );
    }

    return (
        <group position={position} rotation={rotation} scale={finalScale}>
            <Capsule args={[baseSize[0], baseSize[1], 8, 16]}>
                {Material}
            </Capsule>
        </group>
    );
};

const SyntheticHuman = ({ stats }) => {
    const group = useRef();
    const scanLine = useRef();

    // Stats Normalization (0-1)
    const training = stats.training || 0;
    const nutrition = stats.nutrition || 0;
    const recovery = stats.recovery || 0;
    const knowledge = (stats.know || 0) / 100;

    // Colors
    const colTraining = "#ff3333"; // Red
    const colNutrition = "#39FF14"; // Green
    const colRecovery = "#33ccff"; // Blue
    const colKnowledge = "#9D00FF"; // Purple

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (group.current) {
            group.current.position.y = Math.sin(t * 0.5) * 0.05;
            group.current.rotation.y = Math.sin(t * 0.2) * 0.1;
        }
        if (scanLine.current) {
            scanLine.current.position.y = -2 + (Math.sin(t * 0.5) + 1) * 2;
            scanLine.current.rotation.z += 0.01;
        }
    });

    return (
        <group ref={group} position={[0, -0.5, 0]}> {/* Shifted down for better framing */}

            {/* --- BRAIN (Knowledge) --- */}
            {/* Skull/Head */}
            <MuscleGroup position={[0, 1.75, 0]} baseSize={[0.22]} geometry="sphere" pump={0} color={colKnowledge} intensity={knowledge} />
            <MuscleGroup position={[0, 1.65, 0.05]} baseSize={[0.2, 0.25, 0.22]} geometry="box" pump={0} color={colKnowledge} intensity={knowledge * 0.5} />

            {/* --- CORE (Nutrition) --- */}
            {/* Abs (Six Pack) */}
            <MuscleGroup position={[-0.08, 1.1, 0.14]} scale={[1, 0.6, 0.3]} baseSize={[0.1]} geometry="sphere" pump={training} color={colNutrition} intensity={nutrition} />
            <MuscleGroup position={[0.08, 1.1, 0.14]} scale={[1, 0.6, 0.3]} baseSize={[0.1]} geometry="sphere" pump={training} color={colNutrition} intensity={nutrition} />
            <MuscleGroup position={[-0.08, 1.0, 0.14]} scale={[1, 0.6, 0.3]} baseSize={[0.09]} geometry="sphere" pump={training} color={colNutrition} intensity={nutrition} />
            <MuscleGroup position={[0.08, 1.0, 0.14]} scale={[1, 0.6, 0.3]} baseSize={[0.09]} geometry="sphere" pump={training} color={colNutrition} intensity={nutrition} />

            {/* --- SPINE (Recovery) --- */}
            {/* Neck */}
            <MuscleGroup position={[0, 1.5, 0]} baseSize={[0.12, 0.3]} geometry="capsule" pump={training} color={colRecovery} intensity={recovery} />
            {/* Spine Column */}
            <MuscleGroup position={[0, 1.1, 0]} baseSize={[0.18, 0.6]} geometry="capsule" pump={0} color={colRecovery} intensity={recovery} />

            {/* --- MUSCLES (Training) --- */}
            {/* Traps */}
            <MuscleGroup position={[0, 1.5, -0.05]} scale={[1.5, 0.5, 0.8]} baseSize={[0.2]} geometry="sphere" pump={training} color={colTraining} intensity={training} />

            {/* Pecs */}
            <MuscleGroup position={[-0.18, 1.35, 0.12]} scale={[1, 0.8, 0.5]} baseSize={[0.22]} geometry="sphere" pump={training} color={colTraining} intensity={training} />
            <MuscleGroup position={[0.18, 1.35, 0.12]} scale={[1, 0.8, 0.5]} baseSize={[0.22]} geometry="sphere" pump={training} color={colTraining} intensity={training} />

            {/* Lats */}
            <MuscleGroup position={[-0.35, 1.2, -0.1]} scale={[0.5, 1.5, 0.5]} baseSize={[0.3]} geometry="sphere" pump={training} color={colTraining} intensity={training} />
            <MuscleGroup position={[0.35, 1.2, -0.1]} scale={[0.5, 1.5, 0.5]} baseSize={[0.3]} geometry="sphere" pump={training} color={colTraining} intensity={training} />

            {/* Delts */}
            <MuscleGroup position={[-0.55, 1.5, 0]} baseSize={[0.24]} geometry="sphere" pump={training} color={colTraining} intensity={training} />
            <MuscleGroup position={[0.55, 1.5, 0]} baseSize={[0.24]} geometry="sphere" pump={training} color={colTraining} intensity={training} />

            {/* Arms */}
            <MuscleGroup position={[-0.6, 1.15, 0]} baseSize={[0.14, 0.4]} geometry="capsule" pump={training} color={colTraining} intensity={training} />
            <MuscleGroup position={[0.6, 1.15, 0]} baseSize={[0.14, 0.4]} geometry="capsule" pump={training} color={colTraining} intensity={training} />
            <MuscleGroup position={[-0.6, 0.6, 0]} baseSize={[0.11, 0.45]} geometry="capsule" pump={training} color={colTraining} intensity={training} />
            <MuscleGroup position={[0.6, 0.6, 0]} baseSize={[0.11, 0.45]} geometry="capsule" pump={training} color={colTraining} intensity={training} />

            {/* Hands */}
            <MuscleGroup position={[-0.6, 0.3, 0]} baseSize={[0.1, 0.12, 0.05]} geometry="box" pump={0} color={colTraining} intensity={training * 0.5} />
            <MuscleGroup position={[0.6, 0.3, 0]} baseSize={[0.1, 0.12, 0.05]} geometry="box" pump={0} color={colTraining} intensity={training * 0.5} />

            {/* Legs */}
            <MuscleGroup position={[-0.2, 0.3, 0]} baseSize={[0.19, 0.7]} geometry="capsule" pump={training} color={colTraining} intensity={training} />
            <MuscleGroup position={[0.2, 0.3, 0]} baseSize={[0.19, 0.7]} geometry="capsule" pump={training} color={colTraining} intensity={training} />
            <MuscleGroup position={[-0.2, -0.5, -0.05]} baseSize={[0.13, 0.6]} geometry="capsule" pump={training} color={colTraining} intensity={training} />
            <MuscleGroup position={[0.2, -0.5, -0.05]} baseSize={[0.13, 0.6]} geometry="capsule" pump={training} color={colTraining} intensity={training} />

            {/* --- SCANNING RING --- */}
            <mesh ref={scanLine} rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.9, 0.92, 64]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.3} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
};

const BodyWidget = ({ stats, userLevel = 1 }) => {
    if (!stats) return null;

    // Dynamic Text Logic
    const [message, setMessage] = useState("SYSTEM ONLINE");

    useEffect(() => {
        const phrases = ["ANALYZING...", "OPTIMIZING...", "SYNCING..."];
        const interval = setInterval(() => {
            setMessage(phrases[Math.floor(Math.random() * phrases.length)]);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="body-widget-container" style={{ height: '45vh', minHeight: '350px', width: '100%', position: 'relative', overflow: 'visible' }}>

            {/* Chat Bubble Overlay */}
            <div className="cyber-chat-bubble" style={{ top: '10px', right: '10px', pointerEvents: 'none' }}>
                <span className="typing-text">{message}</span>
            </div>

            {/* 3D SCENE */}
            <Canvas camera={{ position: [0, 0, 4], fov: 40 }} gl={{ antialias: true, alpha: true }}>
                {/* NO BACKGROUND COLOR - Transparent Canvas */}

                {/* LIGHTING */}
                <ambientLight intensity={0.3} />
                <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={1} />
                <pointLight position={[-5, -5, -5]} intensity={0.5} color="#ffffff" />
                <pointLight position={[0, 2, 3]} intensity={0.5} color="#ffffff" />

                {/* THE SYNTHETIC HUMAN */}
                <SyntheticHuman stats={stats} />

                {/* CONTROLS */}
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate={true}
                    autoRotateSpeed={1}
                    minPolarAngle={Math.PI / 2.5}
                    maxPolarAngle={Math.PI / 1.5}
                />
            </Canvas>

            {/* Level Badge */}
            <div className="level-badge" style={{ bottom: '10px' }}>LVL {userLevel}</div>
        </div>
    );
};

export default BodyWidget;
