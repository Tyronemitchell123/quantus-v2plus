import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Sequence,
} from "remotion";

const GOLD = "#D4AF37";
const GOLD_LIGHT = "#E8C95A";
const GOLD_DIM = "#8A7245";
const BLACK = "#0A0A0C";
const CARBON = "#0D0D0F";

/* ── Floating Mote ── */
const Mote: React.FC<{
  x: number; y: number; size: number; delay: number; drift: number; maxOp: number;
}> = ({ x, y, size, delay, drift, maxOp }) => {
  const frame = useCurrentFrame();
  const t = frame - delay;
  const px = x + Math.sin(t * 0.012 + drift) * 60;
  const py = y + Math.cos(t * 0.009 + drift * 0.7) * 45 - t * 0.15;
  const opacity = interpolate(frame, [delay, delay + 40, delay + 250, delay + 300], [0, maxOp, maxOp, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  return (
    <div style={{
      position: "absolute", left: px, top: py, width: size, height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${GOLD_LIGHT}, ${GOLD_DIM})`,
      opacity, filter: size > 3 ? "blur(1px)" : undefined,
    }} />
  );
};

/* ── Concentric Ring ── */
const Ring: React.FC<{
  cx: number; cy: number; r: number; speed: number; delay: number; stroke?: number;
}> = ({ cx, cy, r, speed, delay, stroke = 1 }) => {
  const frame = useCurrentFrame();
  const rot = (frame - delay) * speed;
  const op = interpolate(frame, [delay, delay + 50, 260, 300], [0, 0.12, 0.12, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  return (
    <div style={{
      position: "absolute", left: cx - r, top: cy - r,
      width: r * 2, height: r * 2, borderRadius: "50%",
      border: `${stroke}px solid ${GOLD}`, opacity: op,
      transform: `rotate(${rot}deg)`,
    }} />
  );
};

/* ── Sweeping Ribbon ── */
const Ribbon: React.FC<{
  sx: number; sy: number; angle: number; delay: number; len: number;
}> = ({ sx, sy, angle, delay, len }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [delay, delay + 100], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const op = interpolate(frame, [delay, delay + 30, delay + 80, delay + 120], [0, 0.5, 0.5, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  return (
    <div style={{
      position: "absolute", left: sx, top: sy,
      width: len * progress, height: 1,
      background: `linear-gradient(90deg, transparent, ${GOLD}88, transparent)`,
      opacity: op, transform: `rotate(${angle}deg)`, transformOrigin: "left center",
    }} />
  );
};

/* ── Pulsing Node ── */
const Node: React.FC<{ x: number; y: number; delay: number }> = ({ x, y, delay }) => {
  const frame = useCurrentFrame();
  const pulse = interpolate(Math.sin((frame - delay) * 0.04), [-1, 1], [0.3, 1]);
  const op = interpolate(frame, [delay, delay + 30, 250, 300], [0, 0.7, 0.7, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  return (
    <>
      <div style={{
        position: "absolute", left: x - 3, top: y - 3, width: 6, height: 6,
        borderRadius: "50%", background: GOLD, opacity: op * pulse,
      }} />
      <div style={{
        position: "absolute", left: x - 15, top: y - 15, width: 30, height: 30,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${GOLD}22, transparent)`,
        opacity: op * pulse * 0.5,
      }} />
    </>
  );
};

/* ── Main Composition ── */
export const HomepageHeroVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const scale = interpolate(frame, [0, durationInFrames], [1, 1.06], { extrapolateRight: "clamp" });
  const glowOp = interpolate(Math.sin(frame * 0.025), [-1, 1], [0.04, 0.14]);
  const glowScale = interpolate(Math.sin(frame * 0.018), [-1, 1], [0.92, 1.08]);

  const motes = Array.from({ length: 50 }, (_, i) => ({
    x: (Math.sin(i * 2.1) * 0.5 + 0.5) * 1920,
    y: (Math.cos(i * 1.7) * 0.5 + 0.5) * 1080,
    size: 1 + Math.random() * 3.5,
    delay: i * 5,
    drift: i * 0.8,
    maxOp: 0.15 + Math.random() * 0.45,
  }));

  const nodes = [
    { x: 320, y: 280, delay: 20 }, { x: 1600, y: 200, delay: 40 },
    { x: 480, y: 780, delay: 60 }, { x: 1400, y: 850, delay: 80 },
    { x: 960, y: 540, delay: 10 }, { x: 200, y: 500, delay: 50 },
    { x: 1700, y: 550, delay: 70 }, { x: 750, y: 150, delay: 35 },
    { x: 1150, y: 900, delay: 55 },
  ];

  // Connecting lines between nodes
  const connections = [
    [0, 4], [1, 4], [2, 4], [3, 4], [5, 0], [6, 1], [7, 0], [8, 3],
  ];

  return (
    <AbsoluteFill style={{
      background: `radial-gradient(ellipse at 50% 45%, ${CARBON}, ${BLACK})`,
      transform: `scale(${scale})`,
    }}>
      {/* Central radial glow */}
      <div style={{
        position: "absolute", left: "50%", top: "45%",
        transform: `translate(-50%, -50%) scale(${glowScale})`,
        width: 900, height: 900, borderRadius: "50%",
        background: `radial-gradient(circle, ${GOLD}18, ${GOLD}06, transparent)`,
        opacity: glowOp,
      }} />

      {/* Secondary off-center glow */}
      <div style={{
        position: "absolute", left: "30%", top: "35%",
        transform: "translate(-50%, -50%)",
        width: 600, height: 600, borderRadius: "50%",
        background: `radial-gradient(circle, ${GOLD}0C, transparent)`,
        opacity: interpolate(Math.sin(frame * 0.015 + 1), [-1, 1], [0.03, 0.08]),
      }} />

      {/* Orbital rings */}
      <Ring cx={960} cy={490} r={160} speed={0.12} delay={10} />
      <Ring cx={960} cy={490} r={240} speed={-0.08} delay={25} />
      <Ring cx={960} cy={490} r={340} speed={0.06} delay={40} />
      <Ring cx={960} cy={490} r={450} speed={-0.04} delay={55} stroke={1} />

      {/* Connection lines between nodes */}
      {connections.map(([a, b], i) => {
        const nA = nodes[a]; const nB = nodes[b];
        const len = Math.sqrt((nB.x - nA.x) ** 2 + (nB.y - nA.y) ** 2);
        const angle = Math.atan2(nB.y - nA.y, nB.x - nA.x) * (180 / Math.PI);
        const lineOp = interpolate(frame, [30 + i * 8, 60 + i * 8, 240, 300], [0, 0.08, 0.08, 0], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        });
        return (
          <div key={`conn-${i}`} style={{
            position: "absolute", left: nA.x, top: nA.y,
            width: len, height: 1,
            background: `linear-gradient(90deg, ${GOLD}44, ${GOLD}22, ${GOLD}44)`,
            opacity: lineOp,
            transform: `rotate(${angle}deg)`, transformOrigin: "left center",
          }} />
        );
      })}

      {/* Nodes */}
      {nodes.map((n, i) => <Node key={`node-${i}`} {...n} />)}

      {/* Ribbons */}
      <Sequence from={15}><Ribbon sx={50} sy={250} angle={4} delay={0} len={700} /></Sequence>
      <Sequence from={60}><Ribbon sx={1300} sy={650} angle={-6} delay={0} len={550} /></Sequence>
      <Sequence from={100}><Ribbon sx={200} sy={850} angle={2} delay={0} len={800} /></Sequence>
      <Sequence from={150}><Ribbon sx={900} sy={150} angle={-3} delay={0} len={600} /></Sequence>
      <Sequence from={200}><Ribbon sx={100} sy={550} angle={5} delay={0} len={450} /></Sequence>
      <Sequence from={230}><Ribbon sx={1500} sy={350} angle={-2} delay={0} len={380} /></Sequence>

      {/* Floating motes */}
      {motes.map((m, i) => <Mote key={i} {...m} />)}

      {/* Horizontal luxury filament */}
      <div style={{
        position: "absolute", left: "8%", right: "8%", top: "50%", height: 1,
        background: `linear-gradient(90deg, transparent, ${GOLD}30, transparent)`,
        opacity: interpolate(frame, [50, 100, 250, 300], [0, 0.35, 0.35, 0], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        }),
      }} />

      {/* Vertical filament */}
      <div style={{
        position: "absolute", top: "12%", bottom: "12%", left: "50%", width: 1,
        background: `linear-gradient(180deg, transparent, ${GOLD}18, transparent)`,
        opacity: interpolate(frame, [30, 80, 260, 300], [0, 0.25, 0.25, 0], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        }),
      }} />

      {/* Diagonal accents */}
      <div style={{
        position: "absolute", left: "20%", top: "20%",
        width: 400, height: 1,
        background: `linear-gradient(90deg, transparent, ${GOLD}15, transparent)`,
        transform: "rotate(35deg)",
        opacity: interpolate(frame, [70, 110, 220, 280], [0, 0.2, 0.2, 0], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        }),
      }} />
      <div style={{
        position: "absolute", right: "15%", bottom: "25%",
        width: 350, height: 1,
        background: `linear-gradient(90deg, transparent, ${GOLD}15, transparent)`,
        transform: "rotate(-25deg)",
        opacity: interpolate(frame, [90, 130, 230, 280], [0, 0.2, 0.2, 0], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        }),
      }} />

      {/* Vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,0,0,0.7) 100%)",
        opacity: interpolate(frame, [0, 50], [0.8, 0.55], { extrapolateRight: "clamp" }),
      }} />

      {/* Noise texture */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.025,
        background: `repeating-conic-gradient(${GOLD}11 0% 25%, transparent 0% 50%) 0 0 / 4px 4px`,
      }} />
    </AbsoluteFill>
  );
};
