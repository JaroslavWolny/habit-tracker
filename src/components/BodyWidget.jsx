import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import './BodyWidget.css';

// --- OPTIMIZED HOLOGRAPHIC SHADERS ---

const vertexShader = `
  uniform float uTime;
  uniform float uIntegrity;
  uniform float uHover;
  uniform float uPulse; // Shockwave effect (0.0 to 1.0)
  
  attribute float aRandom;
  
  varying vec3 vPos;
  varying float vAlpha;

  // Simplex Noise (Standard)
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
  float snoise(vec3 v) { 
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i); 
    vec4 p = permute( permute( permute( 
              i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 0.142857142857; 
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                  dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vec3 pos = position;
    vPos = pos;

    // Glitch / Noise Effect based on Integrity
    float glitchAmt = (1.0 - uIntegrity) * 0.3; // Reduced amplitude for performance
    
    // Simplified noise for performance
    float driftNoise = snoise(vec3(pos.x, pos.y, uTime * 0.5)) * glitchAmt;

    pos.x += driftNoise;
    pos.z += driftNoise;

    // Pulse / Shockwave Effect
    // Expands the particles momentarily when uPulse is high
    pos *= 1.0 + (uPulse * 0.2 * sin(pos.y * 10.0 - uTime * 20.0));

    // Hover Excitement
    if (uHover > 0.5) {
        pos *= 1.0 + (sin(uTime * 15.0) * 0.01);
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size: Optimized size calculation
    gl_PointSize = (5.0 + (glitchAmt * 3.0)) * (1.0 / -mvPosition.z);
    
    // Alpha: Always keep some visibility
    vAlpha = 0.6 + (uIntegrity * 0.4) + (uPulse * 0.5); // Pulse makes it brighter
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  uniform float uTime;
  varying float vAlpha;
  varying vec3 vPos;

  void main() {
    // 1. Circular Particle (Optimized: No discard if possible, but needed for circle)
    vec2 coord = gl_PointCoord - vec2(0.5);
    if (dot(coord, coord) > 0.25) discard; // Faster than length() > 0.5

    // 2. Hologram Scanlines
    float scanline = sin(vPos.y * 15.0 - uTime * 3.0);
    float scanlineEffect = smoothstep(0.0, 1.0, scanline);
    
    // 3. Core Glow
    float glow = 1.0 - (length(coord) * 2.0);

    // Combine
    vec3 finalColor = uColor + (vec3(1.0) * scanlineEffect * 0.3);
    
    gl_FragColor = vec4(finalColor, vAlpha * glow);
  }
`;

// --- PARTICLE GENERATION (Optimized Count) ---
const generateHologramParticles = (count) => {
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        let x, y, z;
        const r = Math.random();

        // Denser distribution for better visibility
        if (r < 0.2) {
            // HEAD
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const rad = 0.3;
            x = rad * Math.sin(phi) * Math.cos(theta);
            y = 1.7 + rad * Math.sin(phi) * Math.sin(theta);
            z = rad * Math.cos(phi);
        } else if (r < 0.55) {
            // TORSO (Denser)
            const theta = Math.random() * Math.PI * 2;
            const rad = 0.28 + Math.random() * 0.05;
            const h = Math.random() * 1.0;
            x = rad * Math.cos(theta) * 0.85;
            y = 0.7 + h;
            z = rad * Math.sin(theta) * 0.6;
        } else if (r < 0.8) {
            // ARMS
            const side = Math.random() > 0.5 ? 1 : -1;
            const h = Math.random() * 1.3;
            x = side * (0.45 + Math.random() * 0.1);
            y = 1.5 - h;
            z = (Math.random() - 0.5) * 0.25;
        } else {
            // LEGS
            const side = Math.random() > 0.5 ? 1 : -1;
            const h = Math.random() * 1.6;
            x = side * (0.22 + Math.random() * 0.1);
            y = 0.7 - h;
            z = (Math.random() - 0.5) * 0.3;
        }

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        randoms[i] = Math.random();
    }

    return { positions, randoms };
};

const HologramEntity = ({ stats }) => {
    const mesh = useRef();
    const [hovered, setHover] = useState(false);
    const [pulse, setPulse] = useState(0);

    // Integrity Calculation
    const integrity = (stats.training + stats.nutrition + stats.recovery) / 3;

    // Trigger Pulse on stats change
    useEffect(() => {
        setPulse(1.0); // Spike pulse
        const timer = setTimeout(() => setPulse(0), 500); // Decay
        return () => clearTimeout(timer);
    }, [integrity]);

    // Colors
    const baseColor = new THREE.Color();
    if (integrity > 0.8) baseColor.set('#39FF14');
    else if (integrity > 0.3) baseColor.set('#00eaff');
    else baseColor.set('#ff003c');

    // Optimized Particle Count: 4000 (Smooth on mobile)
    const particleCount = 4000;
    const { positions, randoms } = useMemo(() => generateHologramParticles(particleCount), []);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uIntegrity: { value: integrity },
        uColor: { value: baseColor },
        uHover: { value: 0 },
        uPulse: { value: 0 }
    }), []);

    useFrame((state) => {
        if (mesh.current) {
            const dt = state.clock.getDelta();
            mesh.current.material.uniforms.uTime.value = state.clock.getElapsedTime();

            // Smooth Interpolation
            mesh.current.material.uniforms.uIntegrity.value = THREE.MathUtils.lerp(
                mesh.current.material.uniforms.uIntegrity.value,
                integrity,
                0.1
            );

            // Pulse Decay
            mesh.current.material.uniforms.uPulse.value = THREE.MathUtils.lerp(
                mesh.current.material.uniforms.uPulse.value,
                pulse,
                0.1
            );

            mesh.current.material.uniforms.uColor.value.lerp(baseColor, 0.05);
            mesh.current.material.uniforms.uHover.value = THREE.MathUtils.lerp(
                mesh.current.material.uniforms.uHover.value,
                hovered ? 1.0 : 0.0,
                0.1
            );

            mesh.current.rotation.y += 0.005; // Slower, smoother rotation
        }
    });

    return (
        <points ref={mesh} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-aRandom" count={particleCount} array={randoms} itemSize={1} />
            </bufferGeometry>
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
};

const BodyWidget = ({ stats, userLevel = 1 }) => {
    if (!stats) return null;

    const integrity = (stats.training + stats.nutrition + stats.recovery) / 3;
    const [message, setMessage] = useState("SYSTEM ONLINE");

    useEffect(() => {
        if (integrity < 0.3) setMessage("SIGNAL WEAK. RECALIBRATE.");
        else if (integrity < 0.7) setMessage("HOLOGRAM STABLE.");
        else setMessage("PROJECTION OPTIMAL.");
    }, [integrity]);

    return (
        <div className="body-widget-container" style={{ height: '45vh', minHeight: '350px', width: '100%', position: 'relative' }}>

            {/* Holographic Chat Bubble */}
            <div className="cyber-chat-bubble">
                <span className="typing-text">{message}</span>
            </div>

            {/* 3D SCENE */}
            {/* Adjusted Camera: Further back (z: 6) to fit smaller avatar */}
            <Canvas camera={{ position: [0, 0.5, 6], fov: 35 }} gl={{ antialias: false, alpha: true }}>

                <HologramEntity stats={stats} />

                {/* POST PROCESSING: BLOOM (Optimized) */}
                <EffectComposer disableNormalPass>
                    <Bloom
                        luminanceThreshold={0.2} // Only bloom bright parts
                        mipmapBlur
                        intensity={1.0} // Reduced intensity
                        radius={0.5}
                    />
                </EffectComposer>

                <OrbitControls enableZoom={false} enablePan={false} autoRotate={true} autoRotateSpeed={0.5} />
            </Canvas>

            {/* Level Badge - Fixed Design */}
            <div className="holo-badge">
                <div className="holo-badge-label">LEVEL</div>
                <div className="holo-badge-value">{userLevel}</div>
            </div>
        </div>
    );
};

export default BodyWidget;
