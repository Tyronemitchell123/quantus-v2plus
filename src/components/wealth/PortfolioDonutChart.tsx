import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface PortfolioAsset {
  name: string;
  value: number;
  change: number;
  allocation: number;
}

interface Props {
  portfolio: PortfolioAsset[];
  privacyMode: boolean;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--gold-light))",
  "hsl(var(--gold-dark))",
  "hsl(var(--gold-soft))",
  "hsl(240 5% 40%)",
  "hsl(240 5% 55%)",
  "hsl(240 5% 30%)",
  "hsl(240 5% 22%)",
];

const PortfolioDonutChart = ({ portfolio, privacyMode }: Props) => {
  const total = portfolio.reduce((s, a) => s + a.value, 0);
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 72;
  const strokeWidth = 28;

  // Build arcs
  let cumulativeAngle = -90; // Start at top
  const arcs = portfolio.map((asset, i) => {
    const angle = (asset.allocation / 100) * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    const endAngle = cumulativeAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;

    return {
      ...asset,
      color: COLORS[i % COLORS.length],
      d: `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      index: i,
    };
  });

  return (
    <Card className="border-primary/10">
      <CardContent className="p-5">
        <p className="text-[9px] tracking-[0.3em] uppercase text-primary/50 font-body mb-4">Asset Allocation</p>
        <div className="flex flex-col items-center">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {arcs.map((arc, i) => (
              <motion.path
                key={arc.name}
                d={arc.d}
                fill="none"
                stroke={arc.color}
                strokeWidth={strokeWidth}
                strokeLinecap="butt"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 0.2 + i * 0.08, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            ))}
            <text x={cx} y={cy - 6} textAnchor="middle" className="fill-foreground text-lg font-display">
              {privacyMode ? "••••" : `£${Math.round(total / 1_000_000)}M`}
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" className="fill-muted-foreground text-[8px] font-body tracking-widest uppercase">
              Total
            </text>
          </svg>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 mt-4 w-full">
            {arcs.map((arc) => (
              <div key={arc.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: arc.color }} />
                <span className="text-[10px] text-muted-foreground font-body truncate">{arc.name}</span>
                <span className="text-[10px] text-foreground/60 font-body ml-auto">{arc.allocation}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioDonutChart;
