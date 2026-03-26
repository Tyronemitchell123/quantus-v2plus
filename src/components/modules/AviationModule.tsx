import { motion } from "framer-motion";
import { Plane, Search, BarChart3, ArrowRight, TrendingDown, TrendingUp, Filter } from "lucide-react";
import ModuleAIPanel from "./ModuleAIPanel";

const dealCards = [
  { type: "Gulfstream G450", phase: 3, progress: 42, vendor: "Responding" },
  { type: "Bombardier Global 7500", phase: 2, progress: 28, vendor: "Sourcing" },
  { type: "Dassault Falcon 8X", phase: 5, progress: 71, vendor: "Agreed" },
];

const insights = [
  { text: "G450 inventory tightening in EU region", trend: "up" },
  { text: "Pedigree aircraft trending above ask", trend: "up" },
  { text: "Charter rates softening Q2 2026", trend: "down" },
];

const AviationModule = () => (
  <div className="flex flex-col xl:flex-row gap-6">
    <div className="flex-1 min-w-0 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Plane size={16} className="text-primary" strokeWidth={1.5} />
            <h2 className="font-display text-xl font-medium">Aviation Intelligence</h2>
          </div>
          <p className="font-body text-xs text-muted-foreground">Aircraft sourcing, charter, management comparison, PPI scheduling.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground font-body text-xs tracking-wider hover:bg-primary/90 transition-colors">
          Create Aviation Request
        </button>
      </div>

      {/* 1 — Aircraft Sourcing */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Search size={14} className="text-primary" />
          <h3 className="font-display text-sm font-medium">Aircraft Sourcing</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {["Type", "Budget", "Hours", "Location", "Pedigree"].map((f) => (
            <div key={f} className="flex items-center gap-2 px-3 py-2 border border-border bg-secondary/30 font-body text-xs text-muted-foreground">
              <Filter size={10} className="text-primary/50" /> {f}
            </div>
          ))}
        </div>
        <button className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary font-body text-xs tracking-wider hover:bg-primary/20 transition-colors">
          Begin Sourcing
        </button>
        <p className="mt-3 font-body text-[10px] text-muted-foreground italic">AI: 14 off-market aircraft match your criteria in current inventory.</p>
      </motion.div>

      {/* 2 — Active Aviation Deals */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <h3 className="font-display text-sm font-medium mb-4">Active Aviation Deals</h3>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {dealCards.map((d, i) => (
            <div key={i} className="min-w-[200px] border border-border p-4 shrink-0 hover:border-primary/20 transition-colors cursor-pointer">
              <p className="font-body text-xs font-medium text-foreground mb-1">{d.type}</p>
              <p className="font-body text-[10px] text-muted-foreground mb-2">Phase {d.phase} · {d.vendor}</p>
              <div className="h-1 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${d.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 3 — Market Intelligence */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={14} className="text-primary" />
          <h3 className="font-display text-sm font-medium">Market Intelligence</h3>
        </div>
        <div className="space-y-3">
          {insights.map((ins, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2 border border-border">
              {ins.trend === "up" ? <TrendingUp size={12} className="text-primary" /> : <TrendingDown size={12} className="text-muted-foreground" />}
              <p className="font-body text-xs text-muted-foreground">{ins.text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>

    {/* AI Panel */}
    <div className="xl:w-72 shrink-0">
      <ModuleAIPanel prompts={["Find off-market aircraft", "Compare management companies", "Prepare PPI schedule", "Charter cost analysis"]} />
    </div>
  </div>
);

export default AviationModule;
