import { useState } from "react";
import { useModuleData } from "@/hooks/use-module-data";
import ModuleLiveDeals from "@/components/modules/ModuleLiveDeals";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, Car, Shield, Globe, Zap, Package, Warehouse, Eye, Search, SlidersHorizontal, Bookmark, GitCompare, Star, AlertTriangle, MapPin, Clock, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  { key: "ground", label: "Ground Transport", icon: Car, count: 6 },
  { key: "recovery", label: "Vehicle Recovery", icon: Truck, count: 4 },
  { key: "secure", label: "Secure Transport", icon: Shield, count: 5 },
  { key: "international", label: "International Logistics", icon: Globe, count: 3 },
  { key: "emergency", label: "Emergency Routing", icon: Zap, count: 7 },
  { key: "asset", label: "Asset Movement", icon: Package, count: 4 },
  { key: "storage", label: "Storage & Warehousing", icon: Warehouse, count: 3 },
  { key: "off-market", label: "Off-Market Operators", icon: Eye, count: 2 },
];

type OpData = {
  title: string;
  tags: string[];
  eta: string;
  operatorRating: string;
  distance: string;
  risk: string;
  details: string[];
  price: string;
  score: number;
};

const opData: Record<string, OpData[]> = {
  ground: [
    { title: "Executive Transfer — Mayfair → Farnborough", tags: ["Transfer", "Priority", "Armoured"], eta: "22 min", operatorRating: "9.9", distance: "38 mi", risk: "Low", details: ["Armoured Range Rover Sentinel", "Close protection driver", "Counter-surveillance route active"], price: "Estimated: £850", score: 98 },
    { title: "Multi-Vehicle Convoy — London → Cotswolds", tags: ["Convoy", "Family", "Discreet"], eta: "1h 45m", operatorRating: "9.7", distance: "85 mi", risk: "Low", details: ["3-vehicle formation — lead, principal, follow", "Advance route sweep completed", "Live comms with ops centre"], price: "Estimated: £3,200", score: 96 },
    { title: "Airport Collection — Heathrow T5 VIP", tags: ["Airport", "VIP", "Immediate"], eta: "On standby", operatorRating: "9.8", distance: "Variable", risk: "Low", details: ["Windsor Suite liaison arranged", "Customs fast-track", "Luggage handled separately"], price: "From £450", score: 94 },
  ],
  recovery: [
    { title: "Vehicle Recovery — Range Rover SVR", tags: ["Recovery", "Priority", "Local"], eta: "14 min", operatorRating: "9.9", distance: "4.2 mi", risk: "Low", details: ["Recovery truck en route", "Estimated arrival: 14 minutes", "Operator: Elite Recovery Group"], price: "Estimated: £380", score: 97 },
    { title: "Luxury Vehicle Transport — Ferrari 296 GTB", tags: ["Enclosed", "High-Value", "Inter-City"], eta: "Same day", operatorRating: "9.8", distance: "220 mi", risk: "Low", details: ["Enclosed climate-controlled trailer", "GPS tracking — real-time", "Insurance: £2M cover included"], price: "Estimated: £1,200", score: 95 },
  ],
  secure: [
    { title: "Secure Document Transfer — London → Geneva", tags: ["Secure", "International", "Diplomatic"], eta: "6 hours", operatorRating: "9.9", distance: "International", risk: "Low", details: ["Tamper-evident diplomatic pouch", "Chain of custody documented", "Armed courier — SC cleared"], price: "Estimated: £4,500", score: 98 },
    { title: "Art Transport — Mayfair → Freeport Geneva", tags: ["Art", "High-Value", "Climate-Controlled"], eta: "24 hours", operatorRating: "9.7", distance: "International", risk: "Medium", details: ["Custom crate — museum spec", "Climate-controlled throughout", "Insurance: £15M cover"], price: "Estimated: £12,000", score: 96 },
  ],
  international: [
    { title: "Private Freight — London → Dubai", tags: ["Freight", "Air", "Priority"], eta: "18 hours", operatorRating: "9.6", distance: "3,400 mi", risk: "Low", details: ["Dedicated air freight slot", "Customs pre-clearance arranged", "Door-to-door tracking"], price: "Estimated: £8,500", score: 94 },
  ],
  emergency: [
    { title: "Emergency Medical Transfer — Surrey → Harley St", tags: ["Medical", "Emergency", "Blue Light"], eta: "28 min", operatorRating: "9.9", distance: "32 mi", risk: "High", details: ["Private ambulance — advanced life support", "Paramedic team on board", "Receiving clinic pre-notified"], price: "Estimated: £2,800", score: 99 },
    { title: "Emergency Evacuation Route — Central London", tags: ["Evacuation", "Security", "Priority"], eta: "Immediate", operatorRating: "9.8", distance: "Variable", risk: "High", details: ["3 pre-planned exit routes active", "Counter-surveillance in effect", "Safe house locations confirmed"], price: "On retainer", score: 98 },
  ],
  asset: [
    { title: "Watch Collection Transfer — Vault to Vault", tags: ["High-Value", "Insured", "Discreet"], eta: "Same day", operatorRating: "9.8", distance: "12 mi", risk: "Medium", details: ["Armed courier — 2-person team", "Insurance: £5M cover", "Biometric chain of custody"], price: "Estimated: £1,800", score: 96 },
  ],
  storage: [
    { title: "Climate-Controlled Vehicle Storage — 6 Vehicles", tags: ["Vehicle", "Long-Term", "Climate"], eta: "Available now", operatorRating: "9.7", distance: "Berkshire", risk: "Low", details: ["Individual bays — CCTV monitored", "Battery conditioning included", "Monthly detailing available"], price: "From £800/month per vehicle", score: 93 },
  ],
  "off-market": [
    { title: "Confidential — Specialist Operator Network", tags: ["Off-Market", "Vetted", "By Referral"], eta: "By arrangement", operatorRating: "N/A", distance: "Global", risk: "Variable", details: ["Operators not listed on public registries", "Quantus-vetted and NDA-bound", "Specialist capabilities on request"], price: "By arrangement", score: 99 },
  ],
};

const insightsData: Record<string, { conditions: string[]; performance: string[]; risks: { level: string; notes: string[] }; route: { fastest: number; safest: number; aiRec: number } }> = {
  ground: {
    conditions: ["Traffic: moderate on A4 corridor.", "Weather: clear, dry roads.", "No road closures on primary routes.", "4 operators on standby within 10 min."],
    performance: ["Blackline Transport: 99% on-time.", "Elite Chauffeurs: highest privacy rating."],
    risks: { level: "Low", notes: ["All routes clear.", "No known security advisories."] },
    route: { fastest: 22, safest: 35, aiRec: 28 },
  },
  recovery: {
    conditions: ["3 recovery units within 5-mile radius.", "Average response time: 12 minutes.", "Enclosed transport available same-day.", "All operators GPS-tracked."],
    performance: ["Elite Recovery: 99% on-time.", "Prestige Transport: fastest enclosed service."],
    risks: { level: "Low", notes: ["Standard recovery — no hazards.", "Weather conditions favourable."] },
    route: { fastest: 14, safest: 20, aiRec: 14 },
  },
  secure: {
    conditions: ["Diplomatic courier available today.", "Art transport — 48hr booking required.", "Geneva freeport receiving confirmed.", "Armed courier team on standby."],
    performance: ["SecureMove: 100% delivery record.", "ArtGuard: museum-grade handling."],
    risks: { level: "Low", notes: ["Chain of custody documented.", "Insurance confirmed."] },
    route: { fastest: 6, safest: 8, aiRec: 6 },
  },
  international: {
    conditions: ["Air freight slots available this week.", "Dubai customs pre-clearance active.", "Door-to-door tracking enabled.", "Priority handling confirmed."],
    performance: ["GlobalFreight: 97% on-time.", "Strong customs relationships."],
    risks: { level: "Low", notes: ["No trade restrictions active.", "Documentation complete."] },
    route: { fastest: 18, safest: 24, aiRec: 18 },
  },
  emergency: {
    conditions: ["2 private ambulances on standby.", "3 evacuation routes pre-planned.", "Safe house locations confirmed.", "Medical teams on 5-min notice."],
    performance: ["MedEvac London: 99% response within 8 min.", "Counter-surveillance team rated exceptional."],
    risks: { level: "Elevated", notes: ["Central London congestion — blue light required.", "Hospital liaison confirmed."] },
    route: { fastest: 28, safest: 45, aiRec: 32 },
  },
  asset: {
    conditions: ["Armed courier team available today.", "Vault-to-vault transfer protocol active.", "Insurance confirmed to £10M.", "Biometric custody chain ready."],
    performance: ["VaultGuard: 100% secure transfer record.", "Fastest high-value courier in network."],
    risks: { level: "Medium", notes: ["High-value asset — dual escort recommended.", "Route varies by risk assessment."] },
    route: { fastest: 30, safest: 50, aiRec: 40 },
  },
  storage: {
    conditions: ["Climate-controlled bays available.", "6 individual spaces confirmed.", "CCTV & 24hr security active.", "Monthly detailing included."],
    performance: ["SecureStore Berkshire: 100% client satisfaction.", "Best climate control in network."],
    risks: { level: "Low", notes: ["Facility fully insured.", "Access by appointment only."] },
    route: { fastest: 0, safest: 0, aiRec: 0 },
  },
  "off-market": {
    conditions: ["Specialist operators available by referral.", "NDA required before introduction.", "Global reach — no public listing.", "Quantus-vetted only."],
    performance: ["Network operators: exceptional capabilities.", "Discretion rating: maximum."],
    risks: { level: "Variable", notes: ["Assessment required per operation.", "Enhanced vetting available."] },
    route: { fastest: 0, safest: 0, aiRec: 0 },
  },
};

const riskColor = (level: string) => {
  if (level === "Low") return "text-emerald-400";
  if (level === "Medium") return "text-amber-400";
  return "text-red-400";
};

const OpCard = ({ op, index }: { op: OpData; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08, duration: 0.5 }}
    className="group glass-card border border-[hsl(var(--gold))]/20 hover:border-[hsl(var(--gold))]/50 p-6 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_8px_32px_hsl(var(--gold)/0.12)] cursor-pointer"
  >
    <div className="flex items-start justify-between mb-4">
      <div>
        <h4 className="font-display text-base text-foreground">{op.title}</h4>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {op.tags.map((t) => (
            <span key={t} className="px-2 py-0.5 bg-[hsl(var(--gold))]/5 border border-[hsl(var(--gold))]/15 font-body text-[10px] text-[hsl(var(--gold))]/80 rounded">{t}</span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-2.5 py-1 border border-[hsl(var(--gold))]/20 rounded">
        <Star size={10} className="text-[hsl(var(--gold))]" fill="hsl(var(--gold))" />
        <span className="font-body text-xs text-[hsl(var(--gold))]">{op.score}</span>
      </div>
    </div>

    <div className="grid grid-cols-4 gap-2 mb-4">
      {[
        { label: "ETA", value: op.eta },
        { label: "Rating", value: op.operatorRating },
        { label: "Distance", value: op.distance },
        { label: "Risk", value: op.risk },
      ].map((m) => (
        <div key={m.label} className="text-center px-2 py-2 bg-secondary/30 border border-border/50 rounded">
          <p className="font-body text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">{m.label}</p>
          <p className={`font-body text-[11px] ${m.label === "Risk" ? riskColor(m.value) : "text-foreground"}`}>{m.value}</p>
        </div>
      ))}
    </div>

    <div className="mb-4 space-y-1.5">
      {op.details.map((d) => (
        <p key={d} className="font-body text-[11px] text-muted-foreground flex items-start gap-2">
          <span className="w-1 h-1 rounded-full bg-[hsl(var(--gold))] mt-1.5 shrink-0" />
          {d}
        </p>
      ))}
    </div>

    <div className="mb-5 px-3 py-2 bg-[hsl(var(--gold))]/5 border border-[hsl(var(--gold))]/10 rounded">
      <p className="font-body text-xs text-[hsl(var(--gold))]">{op.price}</p>
    </div>

    <div className="flex gap-2">
      <button className="flex-1 px-4 py-2.5 border border-[hsl(var(--gold))]/30 text-[hsl(var(--gold))] font-body text-xs tracking-wider hover:bg-[hsl(var(--gold))]/10 transition-colors">
        View Details
      </button>
      <Link to="/intake" className="flex-1 px-4 py-2.5 bg-[hsl(var(--gold))] text-background font-body text-xs tracking-wider text-center hover:bg-[hsl(var(--gold))]/90 transition-colors">
        Start Deal
      </Link>
    </div>
  </motion.div>
);

const InsightsPanel = ({ category }: { category: string }) => {
  const ins = insightsData[category] || insightsData.ground;
  const showRoute = ins.route.fastest > 0;
  const routePct = showRoute ? ((ins.route.aiRec - ins.route.fastest) / (ins.route.safest - ins.route.fastest)) * 100 : 0;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-4">
      <div className="glass-card border border-[hsl(var(--gold))]/20 p-5">
        <h3 className="font-display text-sm mb-3 text-foreground">Live Conditions</h3>
        <div className="space-y-2">
          {ins.conditions.map((c, i) => (
            <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.08 }} className="font-body text-[11px] text-muted-foreground flex items-start gap-2">
              <Clock size={8} className="text-[hsl(var(--gold))] mt-1 shrink-0" />
              {c}
            </motion.p>
          ))}
        </div>
      </div>

      <div className="glass-card border border-[hsl(var(--gold))]/20 p-5">
        <h3 className="font-display text-sm mb-3 text-foreground">Operator Performance</h3>
        <div className="space-y-2">
          {ins.performance.map((p, i) => (
            <p key={i} className="font-body text-[11px] text-muted-foreground flex items-start gap-2">
              <Star size={8} className="text-[hsl(var(--gold))] mt-1 shrink-0" />
              {p}
            </p>
          ))}
        </div>
      </div>

      <div className="glass-card border border-[hsl(var(--gold))]/20 p-5">
        <h3 className="font-display text-sm mb-3 text-foreground">Risk Intelligence</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className={`px-2 py-1 border rounded font-body text-[10px] ${ins.risks.level === "Low" ? "border-emerald-400/30 text-emerald-400" : ins.risks.level === "Medium" ? "border-amber-400/30 text-amber-400" : "border-red-400/30 text-red-400"}`}>
            {ins.risks.level} Risk
          </span>
        </div>
        <div className="space-y-1.5">
          {ins.risks.notes.map((n, i) => (
            <p key={i} className="font-body text-[11px] text-muted-foreground flex items-start gap-2">
              <CheckCircle size={8} className="text-emerald-400 mt-1 shrink-0" />
              {n}
            </p>
          ))}
        </div>
      </div>

      {showRoute && (
        <div className="glass-card border border-[hsl(var(--gold))]/20 p-5">
          <h3 className="font-display text-sm mb-3 text-foreground">Route Optimization</h3>
          <div className="space-y-3">
            <div className="flex justify-between font-body text-[10px] text-muted-foreground">
              <span>Fastest ({ins.route.fastest} min)</span>
              <span>Safest ({ins.route.safest} min)</span>
            </div>
            <div className="relative h-2 bg-secondary/50 rounded-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[hsl(var(--gold))]/40 to-[hsl(var(--gold))] rounded-full" style={{ width: `${routePct}%` }} />
              <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[hsl(var(--gold))] border-2 border-background shadow-[0_0_8px_hsl(var(--gold)/0.5)]" style={{ left: `${routePct}%`, marginLeft: "-6px" }} />
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle size={10} className="text-[hsl(var(--gold))]" />
              <span className="font-body text-[10px] text-[hsl(var(--gold))]">AI-recommended: {ins.route.aiRec} min</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const LogisticsModule = () => {
  const [activeCategory, setActiveCategory] = useState("ground");
  const operations = opData[activeCategory] || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Truck size={16} className="text-[hsl(var(--gold))]" strokeWidth={1.5} />
            <p className="font-body text-[10px] tracking-[0.3em] uppercase text-[hsl(var(--gold))]/70">Module 5</p>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl text-foreground">Logistics & Recovery Intelligence</h2>
          <p className="font-body text-xs text-[hsl(var(--gold))]/60 mt-1">Your private logistics ecosystem — routing, transport, recovery, and emergency operations.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 border border-border hover:border-[hsl(var(--gold))]/30 transition-colors"><Search size={14} className="text-muted-foreground" /></button>
          <button className="p-2 border border-border hover:border-[hsl(var(--gold))]/30 transition-colors"><SlidersHorizontal size={14} className="text-muted-foreground" /></button>
          <button className="p-2 border border-border hover:border-[hsl(var(--gold))]/30 transition-colors"><Bookmark size={14} className="text-muted-foreground" /></button>
          <button className="p-2 border border-border hover:border-[hsl(var(--gold))]/30 transition-colors"><GitCompare size={14} className="text-muted-foreground" /></button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-5">
        <div className="xl:w-52 shrink-0">
          <div className="glass-card border border-[hsl(var(--gold))]/10 p-2 flex xl:flex-col gap-1 overflow-x-auto xl:overflow-x-visible">
            {categories.map((cat) => {
              const active = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`flex items-center gap-3 px-3 py-3 text-left font-body text-xs transition-all duration-300 whitespace-nowrap shrink-0 rounded ${
                    active
                      ? "bg-[hsl(var(--gold))]/10 text-[hsl(var(--gold))] border border-[hsl(var(--gold))]/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/30 border border-transparent"
                  }`}
                >
                  <cat.icon size={14} strokeWidth={1.5} />
                  <span className="hidden xl:inline flex-1">{cat.label}</span>
                  <span className={`hidden xl:inline font-body text-[10px] ${active ? "text-[hsl(var(--gold))]/60" : "text-muted-foreground/50"}`}>{cat.count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={activeCategory} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="grid md:grid-cols-2 gap-4">
              {operations.map((o, i) => (
                <OpCard key={o.title} op={o} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="xl:w-72 shrink-0">
          <AnimatePresence mode="wait">
            <motion.div key={activeCategory}>
              <InsightsPanel category={activeCategory} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LogisticsModule;
