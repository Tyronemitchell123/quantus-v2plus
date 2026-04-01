import { useState } from "react";
import { motion } from "framer-motion";
import { HeartPulse, Ghost, RefreshCcw, Eye, Zap, Terminal, Send, ToggleLeft, ToggleRight } from "lucide-react";

const mockDeals = [
  { id: 1, procedure: "Full-Body MRI — Prenuvo London", patient: "ID-7A3F", value: 8500, status: "Perishing", timeLeft: "14h", draft: "Mr. [ID-7A3F], a Tier-1 Prenuvo slot has just opened in London for tomorrow. Given your interest in Cardiovascular tracking, I've secured a 30-minute right-of-first-refusal." },
  { id: 2, procedure: "Executive Cardiac Panel — Fountain Life", patient: "ID-9B2E", value: 12000, status: "Outreach_Sent", timeLeft: "6h", draft: "Your annual cardiac screening slot is available 48 hours early. Priority access expires at 5 PM." },
  { id: 3, procedure: "DEXA + VO2 Max — Longevity Clinic Harley St", patient: "ID-4C1D", value: 5200, status: "Recovered", timeLeft: "—", draft: "" },
  { id: 4, procedure: "Cancer Screening Panel — Prenuvo NYC", patient: "ID-6E8A", value: 18500, status: "Perishing", timeLeft: "22h", draft: "A cancellation has opened a same-week Cancer Screening slot in Manhattan. This typically carries a 4-month waitlist." },
];

const auditLog = [
  { time: "09:00", text: "Firecrawl scanned Prenuvo London — 2 cancellation slots detected." },
  { time: "09:02", text: "Claude drafted 2 'Executive Health Play' recovery messages." },
  { time: "09:03", text: "Outreach queued for ID-7A3F (Full-Body MRI, $8,500)." },
  { time: "09:05", text: "ID-4C1D responded 'Yes' — DEXA slot RECOVERED. Commission: $520." },
  { time: "09:10", text: "Fountain Life portal re-scanned — 1 new Cardiac Panel opening." },
];

const statusConfig: Record<string, { color: string; icon: typeof Eye }> = {
  Perishing: { color: "text-rose-400 bg-rose-400/10", icon: Zap },
  Outreach_Sent: { color: "text-amber-400 bg-amber-400/10", icon: Send },
  Recovered: { color: "text-emerald-400 bg-emerald-400/10", icon: RefreshCcw },
  Ghosted: { color: "text-red-400 bg-red-400/10", icon: Ghost },
};

const LongevityLiveDeals = () => {
  const [autoPilot, setAutoPilot] = useState(false);
  const totalRecovered = mockDeals.filter(d => d.status === "Recovered").reduce((s, d) => s + d.value, 0);
  const commission = Math.floor(totalRecovered * 0.10);

  return (
    <div className="space-y-4">
      {/* Auto-Pilot + Commission Ticker */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setAutoPilot(!autoPilot)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-body tracking-wider transition-all border ${
            autoPilot
              ? "border-rose-400/40 text-rose-400 bg-rose-400/10"
              : "border-border/50 text-muted-foreground"
          }`}
        >
          {autoPilot ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          Auto-Recovery {autoPilot ? "ON" : "OFF"}
        </button>

        <motion.div
          animate={{ boxShadow: commission > 0 ? ["0 0 10px rgba(212,175,55,0)", "0 0 20px rgba(212,175,55,0.3)", "0 0 10px rgba(212,175,55,0)"] : "none" }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/5"
        >
          <HeartPulse size={14} className="text-[#D4AF37]" />
          <span className="font-display text-sm font-semibold text-[#D4AF37]">
            ${commission.toLocaleString()} Access Fee
          </span>
        </motion.div>
      </div>

      {/* Deal Cards */}
      <div className="space-y-2">
        {mockDeals.map((deal, i) => {
          const cfg = statusConfig[deal.status] || statusConfig.Ghosted;
          const Icon = cfg.icon;
          return (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`glass-card p-4 space-y-2 ${
                deal.status === "Perishing" ? "border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.08)]" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-lg ${cfg.color}`}>
                  <Icon size={13} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-xs text-foreground truncate">{deal.procedure}</p>
                  <p className="font-body text-[10px] text-muted-foreground">
                    Patient: {deal.patient} • {deal.timeLeft !== "—" ? `${deal.timeLeft} remaining` : "Slot secured"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-sm font-medium text-foreground">${deal.value.toLocaleString()}</p>
                  <span className={`font-body text-[9px] uppercase tracking-wider ${cfg.color.split(" ")[0]}`}>{deal.status.replace("_", " ")}</span>
                </div>
              </div>

              {deal.draft && (
                <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
                  <p className="font-mono text-[11px] text-foreground/80 leading-relaxed">{deal.draft}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button className="px-3 py-1 rounded text-[9px] font-body tracking-wider uppercase border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors">
                      Higher Urgency
                    </button>
                    <button className="px-3 py-1 rounded text-[9px] font-body tracking-wider uppercase border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-colors">
                      Relationship-First
                    </button>
                    <button className="px-3 py-1 rounded text-[9px] font-body tracking-wider uppercase border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors">
                      Send to Client
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Audit Terminal */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Terminal size={14} className="text-rose-400" />
          <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Longevity Audit Terminal</span>
        </div>
        <div className="bg-muted/20 rounded-lg p-3 space-y-1.5 max-h-40 overflow-y-auto font-mono text-[11px]">
          {auditLog.map((entry, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-rose-400 shrink-0">[{entry.time}]</span>
              <span className="text-foreground/70">{entry.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LongevityLiveDeals;
