import { useEffect, useRef, useState, forwardRef } from "react";
import homepageHeroVideo from "@/assets/homepage-hero.mp4";

const HomepageHeroVideo = forwardRef<HTMLDivElement>((_, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const id = requestIdleCallback?.(() => setLoaded(true)) ?? setTimeout(() => setLoaded(true), 2000);
    return () => {
      if (typeof id === "number" && requestIdleCallback) cancelIdleCallback(id);
      else clearTimeout(id);
    };
  }, []);

  useEffect(() => {
    if (loaded && videoRef.current) {
      videoRef.current.src = homepageHeroVideo;
      videoRef.current.load();
    }
  }, [loaded]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden pointer-events-none">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="none"
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
    </div>
  );
});

HomepageHeroVideo.displayName = "HomepageHeroVideo";

export default HomepageHeroVideo;
