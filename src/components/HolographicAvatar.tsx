import { useRef, useMemo, useState, useEffect, Component, ReactNode } from "react";
import { motion } from "framer-motion";

// Lazy-load heavy Three.js deps
let Canvas: any = null;
let Float: any = null;
let MeshTransmissionMaterial: any = null;
let THREE: any = null;
let useFrame: any = null;

function supportsWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl") || c.getContext("webgl2"));
  } catch {
    return false;
  }
}

// Error boundary to catch WebGL runtime errors
class WebGLErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

// CSS-only fallback avatar
const CSSFallbackAvatar = ({ speaking }: { speaking: boolean }) => (
  <div className="relative w-full h-full flex items-center justify-center">
    {/* Outer glow rings */}
    <motion.div
      className="absolute w-40 h-40 rounded-full border border-primary/20"
      animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 3, repeat: Infinity }}
    />
    <motion.div
      className="absolute w-52 h-52 rounded-full border border-primary/10"
      animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2], rotate: [0, 360] }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
    />
    <motion.div
      className="absolute w-64 h-64 rounded-full border border-accent/10"
      animate={{ rotate: [360, 0] }}
      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
    />

    {/* Core orb */}
    <motion.div
      className="w-28 h-28 rounded-full relative"
      animate={speaking ? { scale: [1, 1.06, 1] } : { scale: [1, 1.02, 1] }}
      transition={{ duration: speaking ? 0.3 : 2, repeat: Infinity }}
      style={{
        background: "radial-gradient(circle at 35% 35%, hsl(var(--primary) / 0.9), hsl(var(--primary) / 0.3) 60%, transparent 80%)",
        boxShadow: "0 0 60px hsl(var(--primary) / 0.3), inset 0 0 30px hsl(var(--primary) / 0.2)",
      }}
    />

    {/* Scanlines */}
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.04]"
      style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--primary) / 0.15) 2px, hsl(var(--primary) / 0.15) 4px)`,
      }}
    />

    {/* Base glow */}
    <div className="absolute bottom-[20%] left-1/2 -translate-x-1/2 w-32 h-2 rounded-full bg-primary/20 blur-xl" />
  </div>
);

// 3D head component - only used when WebGL is available
const HoloHead = ({ speaking }: { speaking: boolean }) => {
  const meshRef = useRef<any>(null);
  const ringRef1 = useRef<any>(null);
  const ringRef2 = useRef<any>(null);
  const ringRef3 = useRef<any>(null);
  const particlesRef = useRef<any>(null);

  const goldColor = new THREE.Color("hsl(43, 56%, 52%)");
  const blueColor = new THREE.Color("hsl(210, 100%, 60%)");

  const particlePositions = useMemo(() => {
    const positions = new Float32Array(300 * 3);
    for (let i = 0; i < 300; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.8 + Math.random() * 1.2;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    return positions;
  }, []);

  useFrame(({ clock }: any) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(t * 0.3) * 0.15;
      meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.05;
      const pulse = speaking ? 1.02 + Math.sin(t * 8) * 0.03 : 1;
      meshRef.current.scale.setScalar(pulse);
    }
    if (ringRef1.current) { ringRef1.current.rotation.x = t * 0.5; ringRef1.current.rotation.z = t * 0.3; }
    if (ringRef2.current) { ringRef2.current.rotation.y = t * 0.4; ringRef2.current.rotation.x = Math.PI / 3 + t * 0.2; }
    if (ringRef3.current) { ringRef3.current.rotation.z = -t * 0.35; ringRef3.current.rotation.y = Math.PI / 4 + t * 0.15; }
    if (particlesRef.current) { particlesRef.current.rotation.y = t * 0.05; }
  });

  return (
    <group>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[0.9, 4]} />
          <MeshTransmissionMaterial backside samples={6} thickness={0.5} chromaticAberration={0.3} anisotropy={0.3} distortion={0.2} distortionScale={0.3} temporalDistortion={0.1} color={goldColor} transmissionSampler={false} />
        </mesh>
      </Float>
      <mesh ref={ringRef1}><torusGeometry args={[1.4, 0.012, 16, 100]} /><meshStandardMaterial color={goldColor} emissive={goldColor} emissiveIntensity={2} transparent opacity={0.6} /></mesh>
      <mesh ref={ringRef2}><torusGeometry args={[1.6, 0.008, 16, 100]} /><meshStandardMaterial color={blueColor} emissive={blueColor} emissiveIntensity={1.5} transparent opacity={0.4} /></mesh>
      <mesh ref={ringRef3}><torusGeometry args={[1.8, 0.006, 16, 100]} /><meshStandardMaterial color={goldColor} emissive={goldColor} emissiveIntensity={1} transparent opacity={0.3} /></mesh>
      <points ref={particlesRef}>
        <bufferGeometry><bufferAttribute attach="attributes-position" count={300} array={particlePositions} itemSize={3} /></bufferGeometry>
        <pointsMaterial size={0.02} color={goldColor} transparent opacity={0.7} sizeAttenuation />
      </points>
      <ambientLight intensity={0.3} />
      <pointLight position={[2, 3, 2]} intensity={1.5} color={goldColor} />
      <pointLight position={[-2, -1, 3]} intensity={0.8} color={blueColor} />
      <spotLight position={[0, 5, 0]} intensity={1} angle={0.4} penumbra={1} color={goldColor} />
    </group>
  );
};

const ThreeCanvas = ({ speaking }: { speaking: boolean }) => {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 45 }} style={{ background: "transparent" }} gl={{ alpha: true, antialias: true }}>
      <HoloHead speaking={speaking} />
    </Canvas>
  );
};

const HolographicAvatar = ({ speaking = false }: { speaking?: boolean }) => {
  const [useWebGL, setUseWebGL] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!supportsWebGL()) {
      setLoaded(true);
      return;
    }
    // Dynamically import Three.js modules
    Promise.all([
      import("@react-three/fiber"),
      import("@react-three/drei"),
      import("three"),
    ]).then(([fiber, drei, three]) => {
      Canvas = fiber.Canvas;
      useFrame = fiber.useFrame;
      Float = drei.Float;
      MeshTransmissionMaterial = drei.MeshTransmissionMaterial;
      THREE = three;
      setUseWebGL(true);
      setLoaded(true);
    }).catch(() => {
      setLoaded(true);
    });
  }, []);

  if (!loaded) {
    return <CSSFallbackAvatar speaking={speaking} />;
  }

  return (
    <div className="relative w-full h-full">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-2 rounded-full bg-primary/30 blur-xl" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-primary/5 blur-3xl" />
      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(43 56% 52% / 0.1) 2px, hsl(43 56% 52% / 0.1) 4px)`,
        }}
      />
      {useWebGL ? (
        <WebGLErrorBoundary fallback={<CSSFallbackAvatar speaking={speaking} />}>
          <ThreeCanvas speaking={speaking} />
        </WebGLErrorBoundary>
      ) : (
        <CSSFallbackAvatar speaking={speaking} />
      )}
    </div>
  );
};

export default HolographicAvatar;
