interface HeroImageBackgroundProps {
  src: string;
  alt: string;
  opacity?: string;
}

const HeroImageBackground = ({ src, alt, opacity = "opacity-20" }: HeroImageBackgroundProps) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <img
      src={src}
      alt={alt}
      className={`absolute inset-0 w-full h-full object-cover ${opacity}`}
      loading="eager"
      width={1920}
      height={1080}
    />
    <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
  </div>
);

export default HeroImageBackground;
