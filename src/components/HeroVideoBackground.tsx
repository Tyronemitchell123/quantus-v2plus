import heroVideo from "@/assets/hero-bg-video.mp4";

const HeroVideoBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <video
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover opacity-20"
    >
      <source src={heroVideo} type="video/mp4" />
    </video>
    <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
  </div>
);

export default HeroVideoBackground;
