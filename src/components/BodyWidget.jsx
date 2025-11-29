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

const CyborgModel = ({ stats, integrity, isGodMode }) => {
    // Dynamická barva podle dominantního statu
    const baseColor = useMemo(() => {
        if (isGodMode) return '#FFD700'; // GOLD for God Mode
        if (stats.training > stats.recovery && stats.training > stats.knowledge) return '#39FF14'; // Neon Green (Power)
        if (stats.recovery > stats.training && stats.recovery > stats.knowledge) return '#39D1FF'; // Cyber Blue (Recovery)
        if (stats.knowledge > stats.training && stats.knowledge > stats.recovery) return '#FFD139'; // Gold (Knowledge)
        return '#ffffff'; // Neutral
    }, [stats, isGodMode]);

    // Pokud je integrita nízká, barva rudne
    const finalColor = integrity < 0.4 ? '#ff003c' : baseColor;

    return (
        <group position={[0, -0.8, 0]}>
            {/* HEAD - Brain Core */}
            <CyberPwrt position={[0, 1.6, 0]} args={[0.25, 1]} type="sphere" color={finalColor} speed={isGodMode ? 5 : 2} />

            {/* TORSO - Main Reactor */}
            <CyberPwrt position={[0, 0.8, 0]} args={[0.4, 0.6, 0.3]} type="box" color={finalColor} speed={isGodMode ? 4 : 1.5} />

            {/* ARMS */}
            <CyberPwrt position={[-0.5, 0.8, 0]} args={[0.1, 0.6, 4, 8]} type="capsule" color={finalColor} speed={isGodMode ? 3 : 1.2} />
            <CyberPwrt position={[0.5, 0.8, 0]} args={[0.1, 0.6, 4, 8]} type="capsule" color={finalColor} speed={isGodMode ? 3 : 1.2} />

            {/* LEGS */}
            <CyberPwrt position={[-0.2, 0, 0]} args={[0.12, 0.8, 4, 8]} type="capsule" color={finalColor} speed={isGodMode ? 2 : 0.8} />
            <CyberPwrt position={[0.2, 0, 0]} args={[0.12, 0.8, 4, 8]} type="capsule" color={finalColor} speed={isGodMode ? 2 : 0.8} />
        </group>
    );
};

const BodyWidget = ({ stats, userLevel = 1 }) => {
    // Výpočet "zdraví" hologramu - nyní používáme správné klíče (0-1)
    const integrity = stats ? (stats.training + stats.nutrition + stats.recovery + stats.knowledge) / 4 : 0;
    const isGodMode = integrity >= 0.9;

    // Zprávy systému (Tamagotchi element)
    const [message, setMessage] = useState("SYSTEM ONLINE");
    const [surge, setSurge] = useState(false);
    const prevIntegrity = useRef(integrity);

    // Detekce změny integrity pro efekt "Power Surge"
    useEffect(() => {
        if (integrity > prevIntegrity.current) {
            setSurge(true);
            setTimeout(() => setSurge(false), 1000); // 1s surge
        }
        prevIntegrity.current = integrity;

        if (integrity < 0.3) setMessage("CRITICAL ERROR. FEED ME DATA.");
        else if (integrity < 0.6) setMessage("SYSTEMS STABILIZING...");
        else if (integrity < 0.9) setMessage("OPTIMAL PERFORMANCE.");
        else setMessage("GOD MODE ENGAGED.");
    }, [integrity]);

    // Barva světla pro scénu
    let glowColor = '#39FF14';
    if (integrity < 0.4) glowColor = '#ff003c';
    if (isGodMode) glowColor = '#FFD700'; // Golden Glow

    return (
        <div className="body-widget-container" style={{ position: 'relative', overflow: 'hidden' }}>

            {/* UI Overlay */}
            <div className="cyber-overlay">
                <div className="status-line">
                    <span className="blink-dot" style={{ background: glowColor, boxShadow: isGodMode ? `0 0 10px ${glowColor}` : 'none' }}></span>
                    {message}
                </div>
                <div className="energy-bar-wrapper">
                    <div className="energy-label">SYNC RATE</div>
                    <div className="energy-bar">
                        <div className="energy-fill" style={{ width: `${integrity * 100}%`, background: glowColor, boxShadow: isGodMode ? `0 0 20px ${glowColor}` : 'none' }}></div>
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
                <ambientLight intensity={isGodMode ? 1.5 : 0.5} />
                <pointLight position={[10, 10, 10]} intensity={isGodMode ? 5 : (surge ? 3 : 1)} color={glowColor} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="blue" />

                {/* The Character - Floating Animation */}
                <Float
                    speed={isGodMode ? 3 : (surge ? 5 : 2)}
                    rotationIntensity={isGodMode ? 1.5 : (surge ? 0.5 : 0.2)}
                    floatIntensity={isGodMode ? 1.5 : 0.5}
                    floatingRange={isGodMode ? [-0.2, 0.2] : [-0.1, 0.1]}
                >
                    <CyborgModel stats={stats || { training: 0, nutrition: 0, recovery: 0, knowledge: 0 }} integrity={integrity} isGodMode={isGodMode} />
                </Float>

                {/* Particles around */}
                <Sparkles
                    key={isGodMode ? 'god-mode-sparkles' : 'normal-sparkles'} // Force re-render on mode switch
                    count={isGodMode ? 150 : (surge ? 100 : 50)}
                    scale={isGodMode ? 3.5 : 3}
                    size={isGodMode ? 6 : (surge ? 4 : 2)}
                    speed={isGodMode ? 0.4 : (surge ? 2 : 0.4)}
                    opacity={isGodMode ? 1 : 0.5}
                    color={glowColor}
                />

                {/* Post Processing Effects */}
                <EffectComposer disableNormalPass>
                    {/* Bloom - Zářící efekt */}
                    <Bloom
                        luminanceThreshold={0.1}
                        mipmapBlur
                        intensity={isGodMode ? 2.5 : (surge ? 3 : 1.5)}
                        radius={isGodMode ? 0.8 : 0.6}
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
                    autoRotateSpeed={isGodMode ? 2.0 : (surge ? 5 : 1.0)}
                />
            </Canvas>
        </div>
    );
};

export default BodyWidget;
