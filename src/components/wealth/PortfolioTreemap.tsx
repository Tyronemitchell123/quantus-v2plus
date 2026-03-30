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
  "hsl(240 5% 35%)",
  "hsl(240 5% 48%)",
  "hsl(240 5% 26%)",
  "hsl(240 5% 18%)",
];

const fmt = (n: number) => "£" + n.toLocaleString("en-GB");

const PortfolioTreemap = ({ portfolio, privacyMode }: Props) => {
  // Simple treemap: horizontal bars proportional to allocation
  const sorted = [...portfolio].sort((a, b) => b.allocation - a.allocation);
  const maxAlloc = sorted[0]?.allocation || 1;

  return (
    <Card className="border-primary/10">
      <CardContent className="p-5">
        <p className="text-[9px] tracking-[0.3em] uppercase text-primary/50 font-body mb-4">Performance Treemap</p>
        <div className="space-y-2">
          {sorted.map((asset, i) => (
            <motion.div
              key={asset.name}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-body text-foreground">{asset.name}</span>
                <span className={`text-[10px] font-body tabular-nums ${asset.change >= 0 ? "text-emerald-500" : "text-rose-400"}`}>
                  {asset.change >= 0 ? "+" : ""}{asset.change}%
                </span>
              </div>
              <div className="relative h-6 bg-border/50 rounded overflow-hidden">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded flex items-center px-2"
                  style={{ background: COLORS[i % COLORS.length] }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(asset.allocation / maxAlloc) * 100}%` }}
                  transition={{ delay: 0.2 + i * 0.06, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="text-[9px] font-body text-primary-foreground/80 whitespace-nowrap">
                    {privacyMode ? "••••" : fmt(asset.value)}
                  </span>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioTreemap;
