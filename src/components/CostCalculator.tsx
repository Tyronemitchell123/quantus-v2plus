import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, Brain, Database, Globe } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const tiers = [
  { key: "free", label: "Free", base: 0, aiIncl: 100, dataIncl: 5, apiIncl: 10_000 },
  { key: "starter", label: "Starter", base: 29, aiIncl: 5_000, dataIncl: 50, apiIncl: 100_000 },
  { key: "professional", label: "Professional", base: 99, aiIncl: Infinity, dataIncl: 500, apiIncl: 1_000_000 },
];

const rates = { ai: 0.003, data: 0.40, api: 0.0005 };

const fmt = (n: number) => (n < 1 ? n.toFixed(2) : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : Math.round(n).toLocaleString());

const CostCalculator = () => {
  const [aiQueries, setAiQueries] = useState(8_000);
  const [dataGB, setDataGB] = useState(100);
  const [apiCalls, setApiCalls] = useState(200_000);

  const projections = useMemo(() => {
    return tiers.map((t) => {
      const aiOverage = t.aiIncl === Infinity ? 0 : Math.max(0, aiQueries - t.aiIncl) * rates.ai;
      const dataOverage = t.dataIncl === Infinity ? 0 : Math.max(0, dataGB - t.dataIncl) * rates.data;
      const apiOverage = t.apiIncl === Infinity ? 0 : Math.max(0, apiCalls - t.apiIncl) * rates.api;
      const overage = aiOverage + dataOverage + apiOverage;
      const total = t.base + overage;
      return { ...t, overage, total };
    });
  }, [aiQueries, dataGB, apiCalls]);

  const best = projections.reduce((a, b) => (a.total < b.total ? a : b));

  return (
    <section className="py-24 border-t border-border">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-primary font-display text-sm tracking-[0.3em] uppercase mb-4">
            Estimate Your Cost
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Usage <span className="text-gold-gradient gold-glow-text">Calculator</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Adjust the sliders to match your expected monthly usage and see the projected cost per plan.
          </p>
        </motion.div>

        <div className="max-w-5xl mx-auto">
          {/* Sliders */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card rounded-2xl p-8 md:p-10 mb-8 space-y-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <Calculator size={18} className="text-primary" />
              <span className="font-display text-sm font-semibold text-foreground">Monthly Usage Estimates</span>
            </div>

            {/* AI Queries */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Brain size={14} className="text-primary" />
                  <label className="text-sm text-muted-foreground">AI Queries</label>
                </div>
                <span className="text-sm font-semibold text-foreground tabular-nums">{aiQueries.toLocaleString()}</span>
              </div>
              <Slider value={[aiQueries]} onValueChange={([v]) => setAiQueries(v)} min={0} max={100_000} step={500} />
            </div>

            {/* Data Processing */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Database size={14} className="text-primary" />
                  <label className="text-sm text-muted-foreground">Data Processing (GB)</label>
                </div>
                <span className="text-sm font-semibold text-foreground tabular-nums">{dataGB} GB</span>
              </div>
              <Slider value={[dataGB]} onValueChange={([v]) => setDataGB(v)} min={0} max={2000} step={10} />
            </div>

            {/* API Calls */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Globe size={14} className="text-primary" />
                  <label className="text-sm text-muted-foreground">API Calls</label>
                </div>
                <span className="text-sm font-semibold text-foreground tabular-nums">{apiCalls.toLocaleString()}</span>
              </div>
              <Slider value={[apiCalls]} onValueChange={([v]) => setApiCalls(v)} min={0} max={2_000_000} step={10_000} />
            </div>
          </motion.div>

          {/* Cost Cards */}
          <div className="grid md:grid-cols-3 gap-5">
            {projections.map((p, i) => {
              const isBest = p.key === best.key;
              return (
                <motion.div
                  key={p.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className={`relative glass-card rounded-xl p-6 text-center transition-all ${
                    isBest ? "ring-1 ring-primary/40 shadow-lg shadow-primary/5" : ""
                  }`}
                >
                  {isBest && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold tracking-wider uppercase">
                      Best Value
                    </div>
                  )}
                  <h4 className="font-display text-sm font-semibold text-muted-foreground mb-1">{p.label}</h4>
                  <p className="font-display text-3xl font-bold text-foreground mb-1">
                    ${Math.round(p.total).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">/month projected</p>

                  <div className="space-y-2 text-left">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Base plan</span>
                      <span className="text-foreground font-medium">${p.base}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Overage</span>
                      <span className={`font-medium ${p.overage > 0 ? "text-destructive" : "text-primary"}`}>
                        {p.overage > 0 ? `+$${Math.round(p.overage).toLocaleString()}` : "Included"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <p className="text-[10px] text-muted-foreground text-center mt-4">
            Enterprise pricing is custom — <a href="/enterprise" className="text-primary hover:underline">contact us</a> for a tailored quote.
          </p>
        </div>
      </div>
    </section>
  );
};

export default CostCalculator;
