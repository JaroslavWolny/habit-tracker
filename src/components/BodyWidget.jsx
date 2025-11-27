import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import './BodyWidget.css';

// --- GLSL SHADERS ---

const vertexShader = `
  uniform float uTime;
  uniform float uIntegrity; // 0.0 (broken) to 1.0 (perfect)
  uniform vec3 uMouse;
  uniform float uHover;
  
  attribute float aRandom;
  attribute vec3 aTargetPos; // The "ideal" position for the particle
  
  varying float vAlpha;
  varying vec3 vColor;

  // Simplex noise function
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
    // 1. Base Position (The ideal shape)
    vec3 pos = position;
    
    // 2. Entropy / Decay Effect
    // If integrity is low, particles drift away based on noise
    float decay = (1.0 - uIntegrity) * 2.0; // 0.0 to 2.0 strength
    float noiseVal = snoise(vec3(pos.x * 2.0, pos.y * 2.0, uTime * 0.5));
    
    // Drift direction
    vec3 drift = vec3(
        snoise(vec3(pos.x, uTime, 0.0)),
        snoise(vec3(pos.y, uTime, 1.0)),
        snoise(vec3(pos.z, uTime, 2.0))
    ) * decay * 0.5;

    // Apply drift
    pos += drift;

    // 3. Breathing / Pulse
    // Organic expansion/contraction
    float breath = sin(uTime * 2.0) * 0.02 * uIntegrity;
    pos *= (1.0 + breath);

    // 4. Mouse Interaction (Magnetism)
    // Calculate distance to mouse ray (simplified as a point in 3D space for now)
    // In a real raycaster scenario, we'd project mouse to world. 
    // Here we use a simplified "hover" effect passed from JS.
    if (uHover > 0.5) {
        // Jitter towards center when hovered (excitement)
        pos += vec3(
            sin(uTime * 10.0 + pos.y) * 0.02,
            cos(uTime * 10.0 + pos.x) * 0.02,
            0.0
        );
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size depends on distance and random factor
    gl_PointSize = (4.0 * aRandom + 2.0) * (1.0 / -mvPosition.z);
    
    // Pass alpha to fragment
    // Particles fade out if they drift too far (low integrity)
    vAlpha = 0.5 + (uIntegrity * 0.5) + (noiseVal * 0.2);
  }
`;

const fragmentShader = `
  uniform vec3 uColor;
  varying float vAlpha;

  void main() {
    // Circular particle shape
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;

    // Glow effect (radial gradient)
    float strength = 1.0 - (dist * 2.0);
    strength = pow(strength, 1.5);

    gl_FragColor = vec4(uColor, vAlpha * strength);
  }
`;

// --- PARTICLE GENERATION ---
// Generates a humanoid point cloud procedurally
const generateBodyParticles = (count) => {
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);

    for (let i = 0; i < count; i++) {
        let x, y, z;
        const r = Math.random();

        // Simple distribution logic to form a body
        if (r < 0.15) {
            // HEAD (Sphere)
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const rad = 0.25;
            x = rad * Math.sin(phi) * Math.cos(theta);
            y = 1.7 + rad * Math.sin(phi) * Math.sin(theta);
            z = rad * Math.cos(phi);
        } else if (r < 0.50) {
            // TORSO (Cylinder-ish)
            const theta = Math.random() * Math.PI * 2;
            const rad = 0.25 + Math.random() * 0.1; // Width
            const h = Math.random() * 1.0; // Height
            x = rad * Math.cos(theta) * 0.8; // Flattened slightly
            y = 0.7 + h;
            z = rad * Math.sin(theta) * 0.5;
        } else if (r < 0.75) {
            // ARMS (Cylinders)
            const side = Math.random() > 0.5 ? 1 : -1;
            const h = Math.random() * 1.2;
            x = side * (0.4 + Math.random() * 0.15);
            y = 1.5 - h;
            z = (Math.random() - 0.5) * 0.2;
        } else {
            // LEGS (Cylinders)
            const side = Math.random() > 0.5 ? 1 : -1;
            const h = Math.random() * 1.5;
            x = side * (0.2 + Math.random() * 0.1);
            y = 0.7 - h;
            z = (Math.random() - 0.5) * 0.25;
        }

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        randoms[i] = Math.random();
    }

    return { positions, randoms };
};

const LivingEssence = ({ stats }) => {
    const mesh = useRef();
    const [hovered, setHover] = useState(false);

    // Calculate Integrity (0-1)
    const integrity = (stats.training + stats.nutrition + stats.recovery) / 3;

    // Determine Color based on state
    const baseColor = new THREE.Color();
    if (integrity > 0.8) baseColor.set('#39FF14'); // Neon Green
    else if (integrity > 0.4) baseColor.set('#00ffff'); // Cyan
    else baseColor.set('#ff003c'); // Red (Critical)

    // Generate particles once
    const particleCount = 3000;
    const { positions, randoms } = useMemo(() => generateBodyParticles(particleCount), []);

    // Shader Uniforms
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uIntegrity: { value: integrity },
        uColor: { value: baseColor },
        uHover: { value: 0 },
        uMouse: { value: new THREE.Vector3() }
    }), []);

    // Animation Loop
    useFrame((state) => {
        const { clock } = state;
        if (mesh.current) {
            mesh.current.material.uniforms.uTime.value = clock.getElapsedTime();

            // Smoothly interpolate integrity changes
            mesh.current.material.uniforms.uIntegrity.value = THREE.MathUtils.lerp(
                mesh.current.material.uniforms.uIntegrity.value,
                integrity,
                0.05
            );

            // Smoothly interpolate color
            mesh.current.material.uniforms.uColor.value.lerp(baseColor, 0.05);

            // Hover effect
            mesh.current.material.uniforms.uHover.value = THREE.MathUtils.lerp(
                mesh.current.material.uniforms.uHover.value,
                hovered ? 1.0 : 0.0,
                0.1
            );

            // Rotate the whole entity slowly
            mesh.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.1) * 0.2;
        }
    });

    return (
        <points
            ref={mesh}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
        >
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particleCount}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-aRandom"
                    count={particleCount}
                    array={randoms}
                    itemSize={1}
                />
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
        if (integrity < 0.3) setMessage("CRITICAL ENTROPY. STABILIZE.");
        else if (integrity < 0.7) setMessage("SYSTEM STABLE.");
        else setMessage("RESONANCE OPTIMAL.");
    }, [integrity]);

    return (
        <div className="body-widget-container" style={{ height: '50vh', minHeight: '400px', width: '100%', position: 'relative', overflow: 'visible' }}>

            {/* Chat Bubble */}
            <div className="cyber-chat-bubble" style={{ top: '10px', right: '10px', pointerEvents: 'none' }}>
                <span className="typing-text">{message}</span>
            </div>

            {/* 3D SCENE */}
            <Canvas camera={{ position: [0, 0.5, 4], fov: 45 }} gl={{ antialias: true, alpha: true }}>
                {/* No lights needed for shader particles, they emit their own color */}

                <LivingEssence stats={stats} />

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
            <div className="level-badge" style={{ bottom: '10px' }}>LVL {userLevel}</div>
        </div>
    );
};

export default BodyWidget;
