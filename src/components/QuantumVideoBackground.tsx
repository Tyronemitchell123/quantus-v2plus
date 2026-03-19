import quantumVideo from "@/assets/quantum-purple-hero.mp4";

const QuantumVideoBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <video
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover opacity-25"
    >
      <source src={quantumVideo} type="video/mp4" />
    </video>
    <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/75 to-background" />
  </div>
);

export default QuantumVideoBackground;
