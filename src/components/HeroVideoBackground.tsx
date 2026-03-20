import { useEffect, useRef, useState } from "react";
import heroVideo from "@/assets/hero-bg-video.mp4";

const HeroVideoBackground = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Defer video loading until after initial paint + idle
    const id = requestIdleCallback?.(() => setLoaded(true)) ?? setTimeout(() => setLoaded(true), 2000);
    return () => {
      if (typeof id === "number" && requestIdleCallback) cancelIdleCallback(id);
      else clearTimeout(id);
    };
  }, []);

  useEffect(() => {
    if (loaded && videoRef.current) {
      videoRef.current.src = heroVideo;
      videoRef.current.load();
    }
  }, [loaded]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="none"
        className="absolute inset-0 w-full h-full object-cover opacity-20"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
    </div>
  );
};

export default HeroVideoBackground;
