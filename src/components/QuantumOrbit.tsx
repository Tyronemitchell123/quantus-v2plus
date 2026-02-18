import { motion } from "framer-motion";

/** Decorative quantum atom orbit animation */
const QuantumOrbit = ({ size = 120, className = "" }: { size?: number; className?: string }) => {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Nucleus */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-quantum-cyan animate-quantum-pulse" />
      </div>
      {/* Orbit rings */}
      {[0, 60, 120].map((rotation, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <div
            className="absolute inset-2 rounded-full border border-quantum-cyan/20"
            style={{ transform: "rotateX(70deg)" }}
          />
          <motion.div
            className="absolute w-2 h-2 rounded-full bg-quantum-cyan shadow-[0_0_10px_hsla(185,100%,55%,0.6)]"
            style={{ top: "50%", left: "50%", marginTop: -4, marginLeft: -4 }}
            animate={{
              rotate: 360,
              x: [0, size * 0.35, 0, -size * 0.35, 0],
              y: [size * 0.15, 0, -size * 0.15, 0, size * 0.15],
            }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: "linear" }}
          />
        </div>
      ))}
    </div>
  );
};

export default QuantumOrbit;
