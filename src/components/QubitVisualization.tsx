import { useRef, useMemo, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Line, Text, Float } from "@react-three/drei";
import * as THREE from "three";

/* ── Single Qubit (Bloch sphere) ── */
const BlochSphere = ({ theta, phi }: { theta: number; phi: number }) => {
  const groupRef = useRef<THREE.Group>(null);

  // State vector on Bloch sphere
  const stateVec = useMemo(() => {
    const x = Math.sin(theta) * Math.cos(phi);
    const y = Math.sin(theta) * Math.sin(phi);
    const z = Math.cos(theta);
    return new THREE.Vector3(x, y, z);
  }, [theta, phi]);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.15;
  });

  // Latitude / longitude rings
  const ringPoints = useMemo(() => {
    const rings: THREE.Vector3[][] = [];
    // equator
    const eq: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      eq.push(new THREE.Vector3(Math.cos(a), 0, Math.sin(a)));
    }
    rings.push(eq);
    // meridian
    const mer: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const a = (i / 64) * Math.PI * 2;
      mer.push(new THREE.Vector3(0, Math.cos(a), Math.sin(a)));
    }
    rings.push(mer);
    return rings;
  }, []);

  return (
    <group ref={groupRef}>
      {/* Transparent sphere */}
      <Sphere args={[1, 32, 32]}>
        <meshPhysicalMaterial
          color="#00d4ff"
          transparent
          opacity={0.08}
          roughness={0.1}
          metalness={0.3}
          side={THREE.DoubleSide}
        />
      </Sphere>

      {/* Wireframe rings */}
      {ringPoints.map((pts, i) => (
        <Line key={i} points={pts} color="#00d4ff" lineWidth={0.5} transparent opacity={0.3} />
      ))}

      {/* Axes */}
      <Line points={[[0, -1.2, 0], [0, 1.2, 0]]} color="#ffffff" lineWidth={0.5} transparent opacity={0.2} />
      <Line points={[[-1.2, 0, 0], [1.2, 0, 0]]} color="#ffffff" lineWidth={0.5} transparent opacity={0.2} />
      <Line points={[[0, 0, -1.2], [0, 0, 1.2]]} color="#ffffff" lineWidth={0.5} transparent opacity={0.2} />

      {/* State vector arrow */}
      <Line points={[[0, 0, 0], stateVec.toArray()]} color="#a855f7" lineWidth={3} />
      <mesh position={stateVec}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={2} />
      </mesh>

      {/* Labels */}
      <Text position={[0, 1.4, 0]} fontSize={0.12} color="#00d4ff">|0⟩</Text>
      <Text position={[0, -1.4, 0]} fontSize={0.12} color="#00d4ff">|1⟩</Text>
    </group>
  );
};

/* ── Entangled particles ── */
const EntangledPair = () => {
  const ref1 = useRef<THREE.Mesh>(null);
  const ref2 = useRef<THREE.Mesh>(null);
  const lineRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref1.current && ref2.current) {
      ref1.current.position.x = -1.5 + Math.sin(t * 0.8) * 0.3;
      ref1.current.position.y = Math.cos(t * 1.2) * 0.3;
      ref2.current.position.x = 1.5 + Math.sin(t * 0.8 + Math.PI) * 0.3;
      ref2.current.position.y = Math.cos(t * 1.2 + Math.PI) * 0.3;
    }
  });

  return (
    <group>
      <Float speed={2} floatIntensity={0.3}>
        <mesh ref={ref1} position={[-1.5, 0, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={3} />
        </mesh>
      </Float>
      <Float speed={2} floatIntensity={0.3}>
        <mesh ref={ref2} position={[1.5, 0, 0]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={3} />
        </mesh>
      </Float>
      {/* Entanglement beam */}
      <Line
        points={[[-1.5, 0, 0], [0, 0.3, 0], [1.5, 0, 0]]}
        color="#00d4ff"
        lineWidth={1}
        transparent
        opacity={0.4}
      />
    </group>
  );
};

/* ── Main exported component ── */
type Mode = "bloch" | "entangle";

const QubitVisualization = () => {
  const [mode, setMode] = useState<Mode>("bloch");
  const [theta, setTheta] = useState(Math.PI / 4);
  const [phi, setPhi] = useState(0);

  return (
    <div className="w-full">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={() => setMode("bloch")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            mode === "bloch"
              ? "bg-quantum-cyan/20 text-quantum-cyan border border-quantum-cyan/40"
              : "bg-secondary text-muted-foreground border border-border hover:text-foreground"
          }`}
        >
          Bloch Sphere
        </button>
        <button
          onClick={() => setMode("entangle")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            mode === "entangle"
              ? "bg-quantum-purple/20 text-quantum-purple border border-quantum-purple/40"
              : "bg-secondary text-muted-foreground border border-border hover:text-foreground"
          }`}
        >
          Entanglement
        </button>
      </div>

      {/* 3D Canvas */}
      <div className="w-full aspect-square max-h-[450px] rounded-2xl overflow-hidden border border-border bg-background/50">
        <Canvas camera={{ position: [0, 0, 3.5], fov: 45 }}>
          <ambientLight intensity={0.3} />
          <pointLight position={[5, 5, 5]} intensity={0.8} color="#00d4ff" />
          <pointLight position={[-5, -5, -5]} intensity={0.4} color="#a855f7" />
          {mode === "bloch" ? (
            <BlochSphere theta={theta} phi={phi} />
          ) : (
            <EntangledPair />
          )}
          <OrbitControls enableZoom={false} enablePan={false} autoRotate={mode === "entangle"} autoRotateSpeed={1} />
        </Canvas>
      </div>

      {/* Sliders for Bloch mode */}
      {mode === "bloch" && (
        <div className="mt-4 space-y-3">
          <label className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="w-8 font-mono text-quantum-cyan">θ</span>
            <input
              type="range"
              min={0}
              max={Math.PI}
              step={0.01}
              value={theta}
              onChange={(e) => setTheta(parseFloat(e.target.value))}
              className="flex-1 accent-quantum-cyan"
            />
            <span className="w-16 text-right font-mono text-xs">{(theta / Math.PI * 180).toFixed(0)}°</span>
          </label>
          <label className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="w-8 font-mono text-quantum-purple">φ</span>
            <input
              type="range"
              min={0}
              max={Math.PI * 2}
              step={0.01}
              value={phi}
              onChange={(e) => setPhi(parseFloat(e.target.value))}
              className="flex-1 accent-quantum-purple"
            />
            <span className="w-16 text-right font-mono text-xs">{(phi / Math.PI * 180).toFixed(0)}°</span>
          </label>
          <p className="text-xs text-muted-foreground mt-2">
            Drag sliders to rotate the qubit state vector on the Bloch sphere. θ controls |0⟩↔|1⟩ superposition, φ controls relative phase.
          </p>
        </div>
      )}
      {mode === "entangle" && (
        <p className="text-xs text-muted-foreground mt-4">
          Two entangled qubits in a Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2. Measuring one instantly determines the other — regardless of distance.
        </p>
      )}
    </div>
  );
};

export default QubitVisualization;
