import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Sequence,
} from "remotion";

const GOLD = "#C9A86A";
const GOLD_LIGHT = "#D4B87A";
const GOLD_DIM = "#8A7245";
const BLACK = "#050505";
const CARBON = "#0A0A0A";

// Floating particle
const Particle: React.FC<{
  x: number;
  y: number;
  size: number;
  delay: number;
  speed: number;
  opacity: number;
}> = ({ x, y, size, delay, speed, opacity: maxOpacity }) => {
  const frame = useCurrentFrame();
  const t = (frame - delay) * speed;
  const px = x + Math.sin(t * 0.02) * 40;
  const py = y + Math.cos(t * 0.015) * 30 - t * 0.3;
  const opacity = interpolate(
    frame,
    [delay, delay + 30, delay + 200, delay + 260],
    [0, maxOpacity, maxOpacity, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        left: px,
        top: py,
        width: size,
        height: size,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${GOLD_LIGHT}, ${GOLD_DIM})`,
        opacity,
        filter: `blur(${size > 3 ? 1 : 0}px)`,
      }}
    />
  );
};

// Luminous gold ribbon
const GoldRibbon: React.FC<{
  startX: number;
  startY: number;
  angle: number;
  delay: number;
  length: number;
}> = ({ startX, startY, angle, delay, length }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [delay, delay + 120], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = interpolate(
    frame,
    [delay, delay + 40, delay + 100, delay + 140],
    [0, 0.6, 0.6, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const currentLength = length * progress;

  return (
    <div
      style={{
        position: "absolute",
        left: startX,
        top: startY,
        width: currentLength,
        height: 2,
        background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
        opacity,
        transform: `rotate(${angle}deg)`,
        transformOrigin: "left center",
        filter: "blur(0.5px)",
      }}
    />
  );
};

// Concentric rings
const OrbitalRing: React.FC<{
  cx: number;
  cy: number;
  radius: number;
  speed: number;
  delay: number;
}> = ({ cx, cy, radius, speed, delay }) => {
  const frame = useCurrentFrame();
  const rotation = (frame - delay) * speed;
  const opacity = interpolate(
    frame,
    [delay, delay + 60, 240, 300],
    [0, 0.15, 0.15, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        left: cx - radius,
        top: cy - radius,
        width: radius * 2,
        height: radius * 2,
        borderRadius: "50%",
        border: `1px solid ${GOLD}`,
        opacity,
        transform: `rotate(${rotation}deg)`,
      }}
    />
  );
};

export const AboutHeroVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Slow zoom
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.08], {
    extrapolateRight: "clamp",
  });

  // Central glow pulse
  const glowOpacity = interpolate(
    Math.sin(frame * 0.03),
    [-1, 1],
    [0.05, 0.15]
  );
  const glowScale = interpolate(
    Math.sin(frame * 0.02),
    [-1, 1],
    [0.9, 1.1]
  );

  // Vignette
  const vignetteOpacity = interpolate(frame, [0, 60], [0.8, 0.5], {
    extrapolateRight: "clamp",
  });

  // Particles
  const particles = Array.from({ length: 35 }, (_, i) => ({
    x: 200 + Math.sin(i * 1.7) * 800 + 960,
    y: 200 + Math.cos(i * 2.3) * 400 + 540,
    size: 1.5 + Math.random() * 3,
    delay: i * 7,
    speed: 0.5 + Math.random() * 0.5,
    opacity: 0.2 + Math.random() * 0.5,
  }));

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 40%, ${CARBON}, ${BLACK})`,
        transform: `scale(${scale})`,
      }}
    >
      {/* Central radial glow */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "40%",
          transform: `translate(-50%, -50%) scale(${glowScale})`,
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${GOLD}22, ${GOLD}08, transparent)`,
          opacity: glowOpacity,
        }}
      />

      {/* Orbital rings */}
      <OrbitalRing cx={960} cy={430} radius={180} speed={0.15} delay={20} />
      <OrbitalRing cx={960} cy={430} radius={260} speed={-0.1} delay={40} />
      <OrbitalRing cx={960} cy={430} radius={350} speed={0.08} delay={60} />

      {/* Gold ribbons */}
      <Sequence from={10}>
        <GoldRibbon startX={100} startY={300} angle={5} delay={0} length={600} />
      </Sequence>
      <Sequence from={50}>
        <GoldRibbon startX={1400} startY={600} angle={-8} delay={0} length={500} />
      </Sequence>
      <Sequence from={90}>
        <GoldRibbon startX={300} startY={800} angle={3} delay={0} length={700} />
      </Sequence>
      <Sequence from={140}>
        <GoldRibbon startX={800} startY={200} angle={-4} delay={0} length={550} />
      </Sequence>
      <Sequence from={180}>
        <GoldRibbon startX={200} startY={500} angle={7} delay={0} length={400} />
      </Sequence>

      {/* Floating particles */}
      {particles.map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      {/* Horizontal luxury filament */}
      <div
        style={{
          position: "absolute",
          left: "10%",
          right: "10%",
          top: "50%",
          height: 1,
          background: `linear-gradient(90deg, transparent, ${GOLD}40, transparent)`,
          opacity: interpolate(
            frame,
            [60, 120, 240, 300],
            [0, 0.4, 0.4, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          ),
        }}
      />

      {/* Vertical filament */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          bottom: "15%",
          left: "50%",
          width: 1,
          background: `linear-gradient(180deg, transparent, ${GOLD}20, transparent)`,
          opacity: interpolate(
            frame,
            [40, 100, 250, 300],
            [0, 0.3, 0.3, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          ),
        }}
      />

      {/* Vignette overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.7) 100%)",
          opacity: vignetteOpacity,
        }}
      />

      {/* Subtle noise texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          background: `repeating-conic-gradient(${GOLD}11 0% 25%, transparent 0% 50%) 0 0 / 4px 4px`,
        }}
      />
    </AbsoluteFill>
  );
};
