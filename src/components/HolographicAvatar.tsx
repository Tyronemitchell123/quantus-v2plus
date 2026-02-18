import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

const HoloHead = ({ speaking }: { speaking: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const ringRef3 = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  const goldColor = new THREE.Color("hsl(43, 56%, 52%)");
  const blueColor = new THREE.Color("hsl(210, 100%, 60%)");

  // Floating particles around avatar
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

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(t * 0.3) * 0.15;
      meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.05;
      const pulse = speaking ? 1.02 + Math.sin(t * 8) * 0.03 : 1;
      meshRef.current.scale.setScalar(pulse);
    }
    if (ringRef1.current) {
      ringRef1.current.rotation.x = t * 0.5;
      ringRef1.current.rotation.z = t * 0.3;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.y = t * 0.4;
      ringRef2.current.rotation.x = Math.PI / 3 + t * 0.2;
    }
    if (ringRef3.current) {
      ringRef3.current.rotation.z = -t * 0.35;
      ringRef3.current.rotation.y = Math.PI / 4 + t * 0.15;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y = t * 0.05;
    }
  });

  return (
    <group>
      {/* Central head sphere */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[0.9, 4]} />
          <MeshTransmissionMaterial
            backside
            samples={6}
            thickness={0.5}
            chromaticAberration={0.3}
            anisotropy={0.3}
            distortion={0.2}
            distortionScale={0.3}
            temporalDistortion={0.1}
            color={goldColor}
            transmissionSampler={false}
          />
        </mesh>
      </Float>

      {/* Orbital rings */}
      <mesh ref={ringRef1}>
        <torusGeometry args={[1.4, 0.012, 16, 100]} />
        <meshStandardMaterial color={goldColor} emissive={goldColor} emissiveIntensity={2} transparent opacity={0.6} />
      </mesh>
      <mesh ref={ringRef2}>
        <torusGeometry args={[1.6, 0.008, 16, 100]} />
        <meshStandardMaterial color={blueColor} emissive={blueColor} emissiveIntensity={1.5} transparent opacity={0.4} />
      </mesh>
      <mesh ref={ringRef3}>
        <torusGeometry args={[1.8, 0.006, 16, 100]} />
        <meshStandardMaterial color={goldColor} emissive={goldColor} emissiveIntensity={1} transparent opacity={0.3} />
      </mesh>

      {/* Floating particles */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={300}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.02} color={goldColor} transparent opacity={0.7} sizeAttenuation />
      </points>

      {/* Ambient and accent lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[2, 3, 2]} intensity={1.5} color={goldColor} />
      <pointLight position={[-2, -1, 3]} intensity={0.8} color={blueColor} />
      <spotLight position={[0, 5, 0]} intensity={1} angle={0.4} penumbra={1} color={goldColor} />
    </group>
  );
};

const HolographicAvatar = ({ speaking = false }: { speaking?: boolean }) => {
  return (
    <div className="relative w-full h-full">
      {/* Holographic base glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-2 rounded-full bg-primary/30 blur-xl" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-primary/5 blur-3xl" />
      
      {/* Scanline overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-10 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            hsl(43 56% 52% / 0.1) 2px,
            hsl(43 56% 52% / 0.1) 4px
          )`,
        }}
      />

      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <HoloHead speaking={speaking} />
      </Canvas>
    </div>
  );
};

export default HolographicAvatar;
