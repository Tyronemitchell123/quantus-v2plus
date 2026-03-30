import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/Cormorant";
import { loadFont as loadSans } from "@remotion/google-fonts/Inter";

const { fontFamily: displayFont } = loadFont("normal", {
  weights: ["700"],
  subsets: ["latin"],
});
const { fontFamily: bodyFont } = loadSans("normal", {
  weights: ["300", "400", "600"],
  subsets: ["latin"],
});

const GOLD = "#c5993e";
const OBSIDIAN = "#0a0a0f";
const DARK = "#111118";
const CREAM = "#f5f0e8";

// Persistent gold particle layer
const GoldParticles: React.FC = () => {
  const frame = useCurrentFrame();
  const particles = Array.from({ length: 40 }, (_, i) => {
    const x = (i * 137.508) % 100;
    const baseY = (i * 73.13) % 100;
    const y = (baseY + frame * (0.05 + (i % 5) * 0.02)) % 120 - 10;
    const size = 1.5 + (i % 4);
    const opacity = interpolate(
      Math.sin(frame * 0.03 + i),
      [-1, 1],
      [0.1, 0.6]
    );
    return { x, y, size, opacity };
  });

  return (
    <AbsoluteFill>
      {particles.map((p, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            backgroundColor: GOLD,
            opacity: p.opacity,
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

// Scene 1: Brand reveal
const BrandReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleScale = spring({ frame, fps, config: { damping: 100 } });
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const subtitleOpacity = interpolate(frame, [25, 45], [0, 1], {
    extrapolateRight: "clamp",
  });
  const subtitleY = interpolate(frame, [25, 50], [30, 0], {
    extrapolateRight: "clamp",
  });
  const lineWidth = interpolate(frame, [15, 60], [0, 400], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        background: `radial-gradient(ellipse at 50% 40%, ${DARK} 0%, ${OBSIDIAN} 70%)`,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: displayFont,
            fontSize: 120,
            fontWeight: 700,
            color: GOLD,
            letterSpacing: 8,
            opacity: titleOpacity,
            transform: `scale(${0.8 + titleScale * 0.2})`,
          }}
        >
          QUANTUS V2+
        </div>
        <div
          style={{
            width: lineWidth,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
            margin: "20px auto",
          }}
        />
        <div
          style={{
            fontFamily: bodyFont,
            fontSize: 28,
            fontWeight: 300,
            color: CREAM,
            letterSpacing: 12,
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleY}px)`,
          }}
        >
          AUTONOMOUS INTELLIGENCE PLATFORM
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Scene 2: Verticals showcase
const VerticalsShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const verticals = [
    { name: "AVIATION", icon: "✈", rate: "2.5%" },
    { name: "MARINE", icon: "⚓", rate: "5%" },
    { name: "MEDICAL", icon: "🏥", rate: "4%" },
    { name: "LEGAL", icon: "⚖", rate: "7.5%" },
    { name: "FINANCE", icon: "💰", rate: "5%" },
    { name: "STAFFING", icon: "👥", rate: "20%" },
    { name: "LIFESTYLE", icon: "✦", rate: "3%" },
    { name: "LOGISTICS", icon: "📦", rate: "4%" },
    { name: "PARTNERSHIPS", icon: "🤝", rate: "5%" },
  ];

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${OBSIDIAN} 0%, #0d0d15 50%, ${OBSIDIAN} 100%)`,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontFamily: bodyFont,
          fontSize: 18,
          fontWeight: 600,
          color: GOLD,
          letterSpacing: 8,
          opacity: titleOpacity,
          marginBottom: 50,
        }}
      >
        9 VERTICALS. ONE PLATFORM.
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 24,
          maxWidth: 1200,
        }}
      >
        {verticals.map((v, i) => {
          const delay = 15 + i * 8;
          const s = spring({
            frame: frame - delay,
            fps,
            config: { damping: 15, stiffness: 120 },
          });
          const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={i}
              style={{
                width: 200,
                padding: "24px 16px",
                border: `1px solid ${GOLD}33`,
                borderRadius: 8,
                textAlign: "center",
                opacity,
                transform: `scale(${s}) translateY(${(1 - s) * 20}px)`,
                background: `linear-gradient(180deg, ${GOLD}08 0%, transparent 100%)`,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>{v.icon}</div>
              <div
                style={{
                  fontFamily: bodyFont,
                  fontSize: 14,
                  fontWeight: 600,
                  color: CREAM,
                  letterSpacing: 3,
                }}
              >
                {v.name}
              </div>
              <div
                style={{
                  fontFamily: displayFont,
                  fontSize: 24,
                  color: GOLD,
                  marginTop: 8,
                }}
              >
                {v.rate}
              </div>
              <div
                style={{
                  fontFamily: bodyFont,
                  fontSize: 10,
                  color: CREAM + "88",
                  marginTop: 2,
                }}
              >
                COMMISSION
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Scene 3: Deal Pipeline
const DealPipeline: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phases = [
    "INTAKE",
    "SOURCING",
    "MATCHING",
    "NEGOTIATION",
    "EXECUTION",
    "COMPLETED",
  ];

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 30% 50%, #12121a 0%, ${OBSIDIAN} 70%)`,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontFamily: bodyFont,
          fontSize: 18,
          fontWeight: 600,
          color: GOLD,
          letterSpacing: 8,
          opacity: titleOpacity,
          marginBottom: 60,
        }}
      >
        AI-POWERED DEAL PIPELINE
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        {phases.map((phase, i) => {
          const delay = 20 + i * 15;
          const progress = interpolate(frame, [delay, delay + 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const isActive = frame > delay + 10;
          const glow = isActive
            ? interpolate(
                Math.sin(frame * 0.08 + i),
                [-1, 1],
                [0.3, 1]
              )
            : 0;

          return (
            <React.Fragment key={i}>
              <div
                style={{
                  padding: "20px 28px",
                  border: `1px solid ${isActive ? GOLD : GOLD + "33"}`,
                  borderRadius: 8,
                  opacity: progress,
                  transform: `scale(${0.8 + progress * 0.2})`,
                  background: isActive
                    ? `linear-gradient(180deg, ${GOLD}15 0%, transparent 100%)`
                    : "transparent",
                  boxShadow: isActive
                    ? `0 0 ${20 * glow}px ${GOLD}22`
                    : "none",
                }}
              >
                <div
                  style={{
                    fontFamily: bodyFont,
                    fontSize: 13,
                    fontWeight: 600,
                    color: isActive ? GOLD : CREAM + "66",
                    letterSpacing: 3,
                  }}
                >
                  {phase}
                </div>
              </div>
              {i < phases.length - 1 && (
                <div
                  style={{
                    width: 30,
                    height: 1,
                    background: `${GOLD}${frame > delay + 15 ? "66" : "22"}`,
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div
        style={{
          fontFamily: bodyFont,
          fontSize: 16,
          color: CREAM + "88",
          marginTop: 50,
          opacity: interpolate(frame, [100, 120], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        From intake to commission payout — fully automated
      </div>
    </AbsoluteFill>
  );
};

// Scene 4: Revenue streams
const RevenueStreams: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const streams = [
    { label: "SUBSCRIPTIONS", value: "$29-$149/mo" },
    { label: "DEAL COMMISSIONS", value: "2.5%-20%" },
    { label: "MARKETPLACE FEES", value: "10% per sale" },
    { label: "PREMIUM ADD-ONS", value: "$299-$500+/mo" },
    { label: "USAGE OVERAGES", value: "Pay-as-you-grow" },
  ];

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, #0d0d14 0%, ${OBSIDIAN} 50%, #0a0a12 100%)`,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          fontFamily: displayFont,
          fontSize: 72,
          fontWeight: 700,
          color: GOLD,
          opacity: interpolate(frame, [0, 25], [0, 1], {
            extrapolateRight: "clamp",
          }),
          marginBottom: 60,
        }}
      >
        5 Revenue Streams
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {streams.map((s, i) => {
          const delay = 25 + i * 12;
          const slideX = interpolate(frame, [delay, delay + 20], [-100, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const opacity = interpolate(frame, [delay, delay + 15], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 24,
                opacity,
                transform: `translateX(${slideX}px)`,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: GOLD,
                }}
              />
              <div
                style={{
                  fontFamily: bodyFont,
                  fontSize: 20,
                  fontWeight: 300,
                  color: CREAM,
                  letterSpacing: 4,
                  width: 280,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontFamily: displayFont,
                  fontSize: 28,
                  fontWeight: 700,
                  color: GOLD,
                }}
              >
                {s.value}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Scene 5: Closing CTA
const ClosingScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame, fps, config: { damping: 80 } });
  const urlOpacity = interpolate(frame, [40, 60], [0, 1], {
    extrapolateRight: "clamp",
  });
  const lineWidth = interpolate(frame, [20, 70], [0, 500], {
    extrapolateRight: "clamp",
  });
  const pulse = interpolate(Math.sin(frame * 0.06), [-1, 1], [0.85, 1]);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 50% 50%, #15151f 0%, ${OBSIDIAN} 60%)`,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: displayFont,
            fontSize: 80,
            fontWeight: 700,
            color: GOLD,
            transform: `scale(${0.6 + scale * 0.4})`,
            opacity: scale,
          }}
        >
          The Future is
        </div>
        <div
          style={{
            fontFamily: displayFont,
            fontSize: 100,
            fontWeight: 700,
            color: CREAM,
            transform: `scale(${pulse})`,
            marginTop: -10,
          }}
        >
          Sovereign
        </div>
        <div
          style={{
            width: lineWidth,
            height: 1,
            background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
            margin: "30px auto",
          }}
        />
        <div
          style={{
            fontFamily: bodyFont,
            fontSize: 24,
            fontWeight: 300,
            color: GOLD,
            letterSpacing: 6,
            opacity: urlOpacity,
          }}
        >
          quantus-loom.lovable.app
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Main composition
export const ShowcaseVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: OBSIDIAN }}>
      <GoldParticles />
      <Sequence from={0} durationInFrames={120}>
        <BrandReveal />
      </Sequence>
      <Sequence from={110} durationInFrames={150}>
        <VerticalsShowcase />
      </Sequence>
      <Sequence from={250} durationInFrames={150}>
        <DealPipeline />
      </Sequence>
      <Sequence from={390} durationInFrames={130}>
        <RevenueStreams />
      </Sequence>
      <Sequence from={510} durationInFrames={120}>
        <ClosingScene />
      </Sequence>
    </AbsoluteFill>
  );
};
