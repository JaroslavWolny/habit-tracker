import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Glitch, Noise } from '@react-three/postprocessing';
import { GlitchMode } from 'postprocessing';
import * as THREE from 'three';
import './BodyWidget.css';

// --- GEOMETRY PARTS (The Body) ---
// Místo teček skládáme postavu z "hard-light" geometrie

const CyberPwrt = ({ position, args, type = "box", color, speed = 1, wireframe = true }) => {
    const mesh = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        // Jemné dýchání / pohyb částí
        mesh.current.position.y = position[1] + Math.sin(t * speed) * 0.02;
        mesh.current.rotation.z = Math.sin(t * 0.5) * 0.02;
    });

    return (
        <mesh ref={mesh} position={position}>
            {type === "box" && <boxGeometry args={args} />}
            {type === "sphere" && <icosahedronGeometry args={args} />}
            {type === "capsule" && <capsuleGeometry args={args} />}

            {/* Vnitřní jádro (plné) */}
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={2}
                transparent
                opacity={0.15}
                roughness={0.2}
                metalness={1}
            />

            {/* Vnější Wireframe (Hologram efekt) */}
            <lineSegments>
                <edgesGeometry args={[type === "box" ? new THREE.BoxGeometry(...args) : (type === "sphere" ? new THREE.IcosahedronGeometry(...args) : new THREE.CapsuleGeometry(...args))]} />
                <lineBasicMaterial color={color} opacity={0.6} transparent />
            </lineSegments>
        </mesh>
    );
};

const CyborgModel = ({ stats, integrity }) => {
    // Dynamická barva podle dominantního statu
    const baseColor = useMemo(() => {
        if (stats.training > stats.recovery && stats.training > stats.know) return '#39FF14'; // Neon Green (Power)
        if (stats.recovery > stats.training && stats.recovery > stats.know) return '#39D1FF'; // Cyber Blue (Recovery)
        if (stats.know > stats.training && stats.know > stats.recovery) return '#FFD139'; // Gold (Knowledge)
        return '#ffffff'; // Neutral
    }, [stats]);

    // Pokud je integrita nízká, barva rudne
    const finalColor = integrity < 0.4 ? '#ff003c' : baseColor;

    return (
        <group>
            {/* HEAD - Brain Core */}
            <CyberPwrt position={[0, 1.6, 0]} args={[0.25, 1]} type="sphere" color={finalColor} speed={2} />

            {/* TORSO - Main Reactor */}
            <CyberPwrt position={[0, 0.8, 0]} args={[0.4, 0.6, 0.3]} type="box" color={finalColor} speed={1.5} />

            {/* ARMS */}
            <CyberPwrt position={[-0.5, 0.8, 0]} args={[0.1, 0.6, 4, 8]} type="capsule" color={finalColor} speed={1.2} />
            <CyberPwrt position={[0.5, 0.8, 0]} args={[0.1, 0.6, 4, 8]} type="capsule" color={finalColor} speed={1.2} />

            {/* LEGS */}
            <CyberPwrt position={[-0.2, 0, 0]} args={[0.12, 0.8, 4, 8]} type="capsule" color={finalColor} speed={0.8} />
            <CyberPwrt position={[0.2, 0, 0]} args={[0.12, 0.8, 4, 8]} type="capsule" color={finalColor} speed={0.8} />
        </group>
    );
};

const BodyWidget = ({ stats, userLevel = 1 }) => {
    // Výpočet "zdraví" hologramu
    const integrity = stats ? (stats.training + stats.nutrition + stats.recovery + stats.know) / 4 : 0; // Průměr

    // Zprávy systému (Tamagotchi element)
    const [message, setMessage] = useState("SYSTEM ONLINE");

    useEffect(() => {
        if (integrity < 0.3) setMessage("CRITICAL ERROR. FEED ME DATA.");
        else if (integrity < 0.6) setMessage("SYSTEMS STABILIZING...");
        else if (integrity < 0.9) setMessage("OPTIMAL PERFORMANCE.");
        else setMessage("GOD MODE ENGAGED.");
    }, [integrity]);

    // Barva světla pro scénu
    const glowColor = integrity < 0.4 ? '#ff003c' : '#39FF14';

    return (
        <div className="body-widget-container" style={{ position: 'relative', overflow: 'hidden' }}>

            {/* UI Overlay */}
            <div className="cyber-overlay">
                <div className="status-line">
                    <span className="blink-dot" style={{ background: glowColor }}></span>
                    {message}
                </div>
                <div className="energy-bar-wrapper">
                    <div className="energy-label">SYNC RATE</div>
                    <div className="energy-bar">
                        <div className="energy-fill" style={{ width: `${integrity * 100}%`, background: glowColor }}></div>
                    </div>
                </div>
            </div>

            {/* 3D Scene */}
            <Canvas
                camera={{ position: [0, 0, 4.5], fov: 45 }} // Fixnutá kamera, aby se vešel
                dpr={[1, 2]} // Optimalizace pro retina displeje
                gl={{ antialias: false, alpha: true }}
            >
                {/* Osvětlení */}
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color={glowColor} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="blue" />

                {/* The Character - Floating Animation */}
                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                    <CyborgModel stats={stats || { training: 0, nutrition: 0, recovery: 0, know: 0 }} integrity={integrity} />
                </Float>

                {/* Particles around */}
                <Sparkles count={50} scale={3} size={2} speed={0.4} opacity={0.5} color={glowColor} />

                {/* Post Processing Effects */}
                <EffectComposer disableNormalPass>
                    {/* Bloom - Zářící efekt */}
                    <Bloom
                        luminanceThreshold={0.2}
                        mipmapBlur
                        intensity={1.5}
                        radius={0.6}
                    />

                    {/* Noise - Filmové zrno pro realismus */}
                    <Noise opacity={0.1} />

                    {/* Glitch - Jen když je integrity nízko */}
                    <Glitch
                        delay={[1.5, 3.5]}
                        duration={[0.1, 0.3]}
                        strength={[0.2, 0.4]}
                        mode={GlitchMode.CONSTANT_MILD}
                        active={integrity < 0.4}
                        ratio={0.85}
                    />
                </EffectComposer>

                {/* Controls - User can rotate but limited vertical to keep him in frame */}
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    minPolarAngle={Math.PI / 3}
                    maxPolarAngle={Math.PI / 1.5}
                    autoRotate
                    autoRotateSpeed={1.0}
                />
            </Canvas>
        </div>
    );
};

export default BodyWidget;
