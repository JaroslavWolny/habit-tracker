import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Capsule, Cylinder, Box, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import './BodyWidget.css';

// --- ADVANCED ANATOMY COMPONENTS ---

// A muscle group that scales based on pump
const MuscleGroup = ({ position, rotation, scale = [1, 1, 1], pump, baseSize, color, geometry = 'capsule' }) => {
    // Calculate growth: Base + (Pump * GrowthFactor)
    const growth = 1 + (pump * 0.5); // Max 50% growth
    const finalScale = [
        scale[0] * growth,
        scale[1] * growth,
        scale[2] * growth
    ];

    const Material = (
        <meshStandardMaterial
            color={color}
            roughness={0.4} // Clay-like finish
            metalness={0.3 + (pump * 0.5)} // Becomes more metallic/shiny as you level up
            emissive={color}
            emissiveIntensity={0.1 + (pump * 0.2)}
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

    // Default Capsule
    return (
        <group position={position} rotation={rotation} scale={finalScale}>
            <Capsule args={[baseSize[0], baseSize[1], 8, 16]}>
                {Material}
            </Capsule>
        </group>
    );
};

const SyntheticHuman = ({ completionRate, statusColor }) => {
    const group = useRef();
    const scanLine = useRef();

    // Animation: Breathing, Floating, Scanning
    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (group.current) {
            group.current.position.y = Math.sin(t * 0.5) * 0.05; // Subtle float
            group.current.rotation.y = Math.sin(t * 0.2) * 0.1; // Subtle turn

            // Breathing
            const breathe = 1 + Math.sin(t * 1.5) * 0.01;
            group.current.scale.set(breathe, breathe, breathe);
        }
        if (scanLine.current) {
            // Scan line moves up and down
            scanLine.current.position.y = -2 + (Math.sin(t) + 1) * 2;
        }
    });

    // Base Color: Grey Clay (like reference)
    const baseColor = "#808080";

    return (
        <group ref={group}>
            {/* --- HEAD & NECK --- */}
            {/* Skull */}
            <MuscleGroup position={[0, 1.75, 0]} baseSize={[0.22]} geometry="sphere" pump={0} color={baseColor} />
            {/* Jaw/Face */}
            <MuscleGroup position={[0, 1.65, 0.05]} baseSize={[0.2, 0.25, 0.22]} geometry="box" pump={0} color={baseColor} />
            {/* Neck */}
            <MuscleGroup position={[0, 1.5, 0]} baseSize={[0.12, 0.3]} geometry="capsule" pump={completionRate} color={baseColor} />
            {/* Traps (Connection to shoulders) */}
            <MuscleGroup position={[0, 1.5, -0.05]} scale={[1.5, 0.5, 0.8]} baseSize={[0.2]} geometry="sphere" pump={completionRate} color={baseColor} />

            {/* --- TORSO --- */}
            {/* Pecs (Chest) - Flattened Spheres */}
            <MuscleGroup position={[-0.18, 1.35, 0.12]} scale={[1, 0.8, 0.5]} baseSize={[0.22]} geometry="sphere" pump={completionRate} color={baseColor} />
            <MuscleGroup position={[0.18, 1.35, 0.12]} scale={[1, 0.8, 0.5]} baseSize={[0.22]} geometry="sphere" pump={completionRate} color={baseColor} />

            {/* Abs (Six Pack) - Grid of small spheres */}
            <MuscleGroup position={[-0.08, 1.1, 0.14]} scale={[1, 0.6, 0.3]} baseSize={[0.1]} geometry="sphere" pump={completionRate} color={baseColor} />
            <MuscleGroup position={[0.08, 1.1, 0.14]} scale={[1, 0.6, 0.3]} baseSize={[0.1]} geometry="sphere" pump={completionRate} color={baseColor} />
            <MuscleGroup position={[-0.08, 1.0, 0.14]} scale={[1, 0.6, 0.3]} baseSize={[0.09]} geometry="sphere" pump={completionRate} color={baseColor} />
            <MuscleGroup position={[0.08, 1.0, 0.14]} scale={[1, 0.6, 0.3]} baseSize={[0.09]} geometry="sphere" pump={completionRate} color={baseColor} />

            {/* Lats (Back/Side Wings) - Giving the V-Taper */}
            <MuscleGroup position={[-0.35, 1.2, -0.1]} scale={[0.5, 1.5, 0.5]} baseSize={[0.3]} geometry="sphere" pump={completionRate} color={baseColor} />
            <MuscleGroup position={[0.35, 1.2, -0.1]} scale={[0.5, 1.5, 0.5]} baseSize={[0.3]} geometry="sphere" pump={completionRate} color={baseColor} />

            {/* Spine/Core */}
            <MuscleGroup position={[0, 1.1, 0]} baseSize={[0.18, 0.6]} geometry="capsule" pump={0} color={baseColor} />

            {/* --- ARMS --- */}
            {/* Delts (Shoulders) - Large Spheres */}
            <MuscleGroup position={[-0.55, 1.5, 0]} baseSize={[0.24]} geometry="sphere" pump={completionRate} color={baseColor} />
            <MuscleGroup position={[0.55, 1.5, 0]} baseSize={[0.24]} geometry="sphere" pump={completionRate} color={baseColor} />

            {/* Biceps/Triceps */}
            <MuscleGroup position={[-0.6, 1.15, 0]} baseSize={[0.14, 0.4]} geometry="capsule" pump={completionRate} color={baseColor} />
            <MuscleGroup position={[0.6, 1.15, 0]} baseSize={[0.14, 0.4]} geometry="capsule" pump={completionRate} color={baseColor} />

            {/* Forearms */}
            <MuscleGroup position={[-0.6, 0.6, 0]} baseSize={[0.11, 0.45]} geometry="capsule" pump={completionRate} color={baseColor} />
            <MuscleGroup position={[0.6, 0.6, 0]} baseSize={[0.11, 0.45]} geometry="capsule" pump={completionRate} color={baseColor} />

            {/* Hands */}
            <MuscleGroup position={[-0.6, 0.3, 0]} baseSize={[0.1, 0.12, 0.05]} geometry="box" pump={0} color={baseColor} />
            <MuscleGroup position={[0.6, 0.3, 0]} baseSize={[0.1, 0.12, 0.05]} geometry="box" pump={0} color={baseColor} />

            {/* --- LEGS --- */}
            {/* Hips/Glutes */}
            <MuscleGroup position={[0, 0.8, 0]} baseSize={[0.4, 0.2, 0.25]} geometry="box" pump={completionRate * 0.5} color={baseColor} />

            {/* Quads (Thighs) - Large Capsules */}
            <MuscleGroup position={[-0.2, 0.3, 0]} baseSize={[0.19, 0.7]} geometry="capsule" pump={completionRate} color={baseColor} />
            <MuscleGroup position={[0.2, 0.3, 0]} baseSize={[0.19, 0.7]} geometry="capsule" pump={completionRate} color={baseColor} />

            {/* Knees */}
            <MuscleGroup position={[-0.2, -0.1, 0]} baseSize={[0.14]} geometry="sphere" pump={0} color={baseColor} />
            <MuscleGroup position={[0.2, -0.1, 0]} baseSize={[0.14]} geometry="sphere" pump={0} color={baseColor} />

            {/* Calves */}
            <MuscleGroup position={[-0.2, -0.5, -0.05]} baseSize={[0.13, 0.6]} geometry="capsule" pump={completionRate} color={baseColor} />
            <MuscleGroup position={[0.2, -0.5, -0.05]} baseSize={[0.13, 0.6]} geometry="capsule" pump={completionRate} color={baseColor} />

            {/* Feet */}
            <MuscleGroup position={[-0.2, -0.9, 0.1]} baseSize={[0.12, 0.08, 0.25]} geometry="box" pump={0} color={baseColor} />
            <MuscleGroup position={[0.2, -0.9, 0.1]} baseSize={[0.12, 0.08, 0.25]} geometry="box" pump={0} color={baseColor} />

            {/* --- SCANNING EFFECT --- */}
            <mesh ref={scanLine} rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.8, 0.85, 32]} />
                <meshBasicMaterial color={statusColor} transparent opacity={0.5} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
};

const BodyWidget = ({ stats, userLevel = 1 }) => {
    if (!stats) return null;

    // Calculate "Pump" (Completion Rate 0-1)
    const completionRate = (stats.training + stats.nutrition + stats.recovery) / 3;

    // Determine State
    const isCritical = completionRate < 0.3;
    const isGodMode = completionRate > 0.9;
    const statusColor = isGodMode ? "#FFD700" : (isCritical ? "#ff003c" : "#39FF14");

    // Dynamic Text Logic
    const [message, setMessage] = useState("SYSTEM ONLINE");

    useEffect(() => {
        let text = "SYSTEM IDLE";
        if (completionRate < 0.2) text = "ATROPHY DETECTED.";
        else if (completionRate < 0.5) text = `MUSCLE DENSITY: ${Math.round(completionRate * 100)}%`;
        else if (completionRate < 0.8) text = "HYPERTROPHY ACTIVE.";
        else if (completionRate < 1.0) text = "OPTIMAL PHYSIQUE.";
        else text = "GOD MODE ENGAGED.";

        setMessage(text);
    }, [completionRate]);

    return (
        <div className="body-widget-container" style={{ height: '50vh', minHeight: '400px', width: '100%', position: 'relative' }}>

            {/* Chat Bubble Overlay */}
            <div className="cyber-chat-bubble" style={{ top: '20px', right: '20px', pointerEvents: 'none' }}>
                <span className="typing-text">{message}</span>
                <div style={{ fontSize: '0.6rem', color: '#888', marginTop: '4px' }}>
                    MASS INDEX: {Math.round(completionRate * 100)}
                </div>
            </div>

            {/* 3D SCENE */}
            <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }} gl={{ antialias: true }}>
                {/* Dark Grey Background for Premium Look */}
                <color attach="background" args={['#1a1a1a']} />

                {/* LIGHTING - Studio Setup */}
                <ambientLight intensity={0.4} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color={statusColor} />
                {/* Rim Light for definition */}
                <pointLight position={[0, 5, -5]} intensity={1} color="#fff" />

                {/* THE SYNTHETIC HUMAN */}
                <SyntheticHuman
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
