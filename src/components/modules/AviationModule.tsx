import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModuleData } from "@/hooks/use-module-data";
import ModuleLiveDeals from "@/components/modules/ModuleLiveDeals";
import { Link } from "react-router-dom";
import {
  Plane, Search, BarChart3, ArrowRight, TrendingDown, TrendingUp,
  Filter, Bookmark, Columns, Sparkles, Shield, Clock, Star, Users,
  Gauge, Ruler, CloudSun, AlertTriangle, ChevronRight,
} from "lucide-react";

/* ── Data ── */
const categories = [
  { id: "light", label: "Light Jet", icon: "✈", count: 8 },
  { id: "midsize", label: "Midsize Jet", icon: "✈", count: 12 },
  { id: "super-mid", label: "Super‑Mid", icon: "✈", count: 6 },
  { id: "heavy", label: "Heavy Jet", icon: "✈", count: 9 },
  { id: "ultra-long", label: "Ultra‑Long Range", icon: "✈", count: 4 },
  { id: "vip", label: "VIP Airliner", icon: "✈", count: 2 },
  { id: "helicopter", label: "Helicopter", icon: "🚁", count: 5 },
  { id: "off-market", label: "Off‑Market", icon: "🔒", count: 3 },
];

const aircraftData: Record<string, Array<{
  name: string; year: number; range: string; seats: number; speed: string;
  cabin: string; availability: string; vendorRating: number; privacy: string;
  charterPrice: string; acquisitionPrice: string; hourlyRate: string;
  vendorNotes: string[];
}>> = {
  "light": [
    { name: "Cessna Citation CJ4", year: 2021, range: "3,700 km", seats: 8, speed: "830 km/h", cabin: "1.47m", availability: "48 hours", vendorRating: 94, privacy: "High", charterPrice: "£4,200/hr", acquisitionPrice: "£9.2M", hourlyRate: "£4,200", vendorNotes: ["Maintained by factory-authorized center", "Available EASA zone"] },
    { name: "Embraer Phenom 300E", year: 2022, range: "3,650 km", seats: 9, speed: "840 km/h", cabin: "1.50m", availability: "24 hours", vendorRating: 97, privacy: "Very High", charterPrice: "£4,800/hr", acquisitionPrice: "£10.5M", hourlyRate: "£4,800", vendorNotes: ["Off-market listing", "Single owner since new"] },
  ],
  "midsize": [
    { name: "Cessna Citation Latitude", year: 2020, range: "5,000 km", seats: 9, speed: "870 km/h", cabin: "1.83m", availability: "72 hours", vendorRating: 91, privacy: "High", charterPrice: "£5,500/hr", acquisitionPrice: "£15.8M", hourlyRate: "£5,500", vendorNotes: ["EU registered", "Fresh interior"] },
    { name: "Hawker 900XP", year: 2019, range: "5,200 km", seats: 8, speed: "850 km/h", cabin: "1.75m", availability: "48 hours", vendorRating: 88, privacy: "Standard", charterPrice: "£4,900/hr", acquisitionPrice: "£8.5M", hourlyRate: "£4,900", vendorNotes: ["Competitive hourly rate", "Two-owner history"] },
  ],
  "super-mid": [
    { name: "Gulfstream G280", year: 2020, range: "6,667 km", seats: 10, speed: "900 km/h", cabin: "1.91m", availability: "24 hours", vendorRating: 96, privacy: "Very High", charterPrice: "£6,800/hr", acquisitionPrice: "£22M", hourlyRate: "£6,800", vendorNotes: ["Off-market listing", "Hold available for 12 hours"] },
    { name: "Bombardier Challenger 350", year: 2021, range: "5,926 km", seats: 10, speed: "870 km/h", cabin: "1.83m", availability: "48 hours", vendorRating: 93, privacy: "High", charterPrice: "£6,200/hr", acquisitionPrice: "£20M", hourlyRate: "£6,200", vendorNotes: ["Factory warranty active", "Wi-Fi Ka-band equipped"] },
  ],
  "heavy": [
    { name: "Bombardier Global 7500", year: 2022, range: "14,260 km", seats: 17, speed: "955 km/h", cabin: "1.88m", availability: "72 hours", vendorRating: 98, privacy: "Ultra", charterPrice: "£12,500/hr", acquisitionPrice: "£72M", hourlyRate: "£12,500", vendorNotes: ["Flagship aircraft", "Four living zones"] },
    { name: "Dassault Falcon 8X", year: 2021, range: "11,945 km", seats: 14, speed: "945 km/h", cabin: "1.88m", availability: "48 hours", vendorRating: 95, privacy: "Very High", charterPrice: "£10,800/hr", acquisitionPrice: "£55M", hourlyRate: "£10,800", vendorNotes: ["Three-engine reliability", "Short-field capability"] },
  ],
  "ultra-long": [
    { name: "Gulfstream G700", year: 2023, range: "13,890 km", seats: 19, speed: "955 km/h", cabin: "1.92m", availability: "1 week", vendorRating: 99, privacy: "Ultra", charterPrice: "£14,000/hr", acquisitionPrice: "£78M", hourlyRate: "£14,000", vendorNotes: ["Newest delivery", "Unmatched cabin volume"] },
  ],
  "vip": [
    { name: "Boeing BBJ MAX 7", year: 2022, range: "12,600 km", seats: 50, speed: "875 km/h", cabin: "2.41m", availability: "2 weeks", vendorRating: 97, privacy: "Ultra", charterPrice: "£22,000/hr", acquisitionPrice: "£120M", hourlyRate: "£22,000", vendorNotes: ["State-level privacy", "Custom interior by Greenpoint"] },
  ],
  "helicopter": [
    { name: "Airbus H160", year: 2023, range: "830 km", seats: 12, speed: "325 km/h", cabin: "1.35m", availability: "24 hours", vendorRating: 92, privacy: "High", charterPrice: "£3,200/hr", acquisitionPrice: "£18M", hourlyRate: "£3,200", vendorNotes: ["Blue Edge blades — ultra-quiet", "VIP interior"] },
  ],
  "off-market": [
    { name: "Gulfstream G650ER", year: 2019, range: "13,890 km", seats: 16, speed: "955 km/h", cabin: "1.88m", availability: "Immediate", vendorRating: 96, privacy: "Ultra", charterPrice: "—", acquisitionPrice: "£48M", hourlyRate: "—", vendorNotes: ["Off-market — not publicly listed", "Direct owner sale"] },
    { name: "Falcon 900LX", year: 2018, range: "8,800 km", seats: 12, speed: "920 km/h", cabin: "1.88m", availability: "48 hours", vendorRating: 90, privacy: "Very High", charterPrice: "£7,200/hr", acquisitionPrice: "£22M", hourlyRate: "£7,200", vendorNotes: ["Off-market — discreet listing", "Low total hours"] },
  ],
};

const marketInsights = [
  { text: "Super‑mid demand elevated — G280 inventory tightening in EU region.", trend: "up" as const },
  { text: "Two new off‑market heavy jets detected in Swiss registry.", trend: "up" as const },
  { text: "Charter rates softening across light jet segment for Q2 2026.", trend: "down" as const },
  { text: "Ultra‑long range segment seeing record acquisition interest.", trend: "up" as const },
];

const vendorPerformance = [
  { vendor: "Falcon Aviation Group", response: "98%", privacy: "Ultra", note: "Preferred partner" },
  { vendor: "Jet Aviation Basel", response: "95%", privacy: "Very High", note: "Best maintenance record" },
  { vendor: "ExcelAire", response: "92%", privacy: "High", note: "Fastest availability" },
];

const operationalAlerts = [
  { text: "EGLL slot restrictions — plan alternate for London arrivals", severity: "medium" },
  { text: "Clear weather across EU corridor next 72 hours", severity: "low" },
  { text: "Crew availability limited for long-haul next week", severity: "high" },
];

/* ── Components ── */

function AircraftCard({ aircraft, index }: { aircraft: typeof aircraftData["light"][0]; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`border-2 rounded-xl bg-[hsl(var(--card))] p-5 transition-all duration-300 ${
        hovered
          ? "border-[hsl(var(--primary)/0.4)] shadow-[0_6px_40px_hsl(var(--primary)/0.08)] -translate-y-1"
          : "border-[hsl(var(--border))]"
      }`}
    >
      {/* Aircraft Name */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display text-base text-[hsl(var(--foreground))]">{aircraft.name}</h3>
          <p className="font-body text-[10px] text-[hsl(var(--muted-foreground))]">{aircraft.year} · {aircraft.privacy} Privacy</p>
        </div>
        <button className="text-[hsl(var(--primary)/0.4)] hover:text-[hsl(var(--primary))] transition-colors">
          <Bookmark size={16} />
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { icon: Ruler, label: "Range", value: aircraft.range },
          { icon: Users, label: "Seats", value: `${aircraft.seats}` },
          { icon: Gauge, label: "Speed", value: aircraft.speed },
          { icon: Ruler, label: "Cabin", value: aircraft.cabin },
        ].map(m => (
          <div key={m.label} className="text-center p-2 border border-[hsl(var(--border)/0.5)] rounded-lg bg-[hsl(var(--muted)/0.3)]">
            <m.icon size={10} className="text-[hsl(var(--primary)/0.5)] mx-auto mb-1" />
            <p className="font-display text-[11px] text-[hsl(var(--foreground))]">{m.value}</p>
            <p className="font-body text-[8px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Operational Metrics */}
      <div className="flex items-center gap-3 mb-4 font-body text-[10px]">
        <span className="flex items-center gap-1 text-[hsl(var(--muted-foreground))]">
          <Clock size={9} /> {aircraft.availability}
        </span>
        <span className="flex items-center gap-1 text-[hsl(var(--primary))]">
          <Star size={9} /> {aircraft.vendorRating}%
        </span>
        <span className="flex items-center gap-1 text-[hsl(var(--muted-foreground))]">
          <Shield size={9} /> {aircraft.privacy}
        </span>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-3 gap-2 mb-4 p-3 border border-[hsl(var(--primary)/0.1)] rounded-lg bg-[hsl(var(--primary)/0.02)]">
        {[
          { label: "Charter", value: aircraft.charterPrice },
          { label: "Acquisition", value: aircraft.acquisitionPrice },
          { label: "Hourly", value: aircraft.hourlyRate },
        ].map(p => (
          <div key={p.label} className="text-center">
            <p className="font-display text-xs text-[hsl(var(--foreground))]">{p.value}</p>
            <p className="font-body text-[8px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider">{p.label}</p>
          </div>
        ))}
      </div>

      {/* Vendor Notes */}
      <div className="space-y-1 mb-4">
        {aircraft.vendorNotes.map((note, i) => (
          <p key={i} className="font-body text-[10px] text-[hsl(var(--primary)/0.7)] flex items-center gap-1.5">
            <Sparkles size={8} className="shrink-0" /> {note}
          </p>
        ))}
      </div>

      {/* CTAs */}
      <div className="flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 border border-[hsl(var(--primary)/0.3)] rounded-lg font-body text-[9px] tracking-widest uppercase text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.05)] transition-all">
          View Details
        </button>
        <Link
          to="/intake"
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg font-body text-[9px] tracking-widest uppercase hover:opacity-90 transition-all"
        >
          Start Deal <ArrowRight size={10} />
        </Link>
      </div>
    </motion.div>
  );
}

/* ── Main Module ── */
const AviationModule = () => {
  const [activeCategory, setActiveCategory] = useState("super-mid");
  const [sortBy, setSortBy] = useState("best");
  const currentAircraft = aircraftData[activeCategory] || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between mb-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Plane size={18} className="text-[hsl(var(--primary))]" strokeWidth={1.5} />
              <p className="font-body text-[10px] tracking-[0.3em] uppercase text-[hsl(var(--primary)/0.6)]">Module 1</p>
            </div>
            <h1 className="font-display text-2xl md:text-3xl text-[hsl(var(--foreground))]">
              Aviation Intelligence
              <motion.div className="h-px bg-gradient-to-r from-[hsl(var(--primary))] to-transparent mt-1" initial={{ width: 0 }} animate={{ width: "60%" }} transition={{ duration: 1, delay: 0.3 }} />
            </h1>
            <p className="font-body text-xs text-[hsl(var(--primary)/0.7)] mt-1">
              Your private aviation ecosystem — sourced, analyzed, and orchestrated.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-[hsl(var(--border))] rounded-lg hover:border-[hsl(var(--primary)/0.3)] transition-colors">
              <Columns size={14} className="text-[hsl(var(--muted-foreground))]" />
            </button>
            <button className="p-2 border border-[hsl(var(--border))] rounded-lg hover:border-[hsl(var(--primary)/0.3)] transition-colors">
              <Search size={14} className="text-[hsl(var(--muted-foreground))]" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Three-Zone Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_260px] gap-5">

        {/* Left — Aircraft Categories */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-1.5"
        >
          <h3 className="font-body text-[9px] tracking-[0.2em] uppercase text-[hsl(var(--muted-foreground))] mb-3 px-2">Aircraft Class</h3>
          {categories.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.04 }}
              onClick={() => setActiveCategory(cat.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-body text-xs transition-all ${
                activeCategory === cat.id
                  ? "bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.3)] text-[hsl(var(--primary))]"
                  : "border border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/0.5)] opacity-60 hover:opacity-100"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-sm">{cat.icon}</span>
                {cat.label}
              </span>
              <span className={`text-[9px] ${activeCategory === cat.id ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]"}`}>
                {cat.count}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Center — Aircraft Cards */}
        <div className="space-y-4">
          {/* Sort bar */}
          <div className="flex items-center justify-between">
            <p className="font-body text-[10px] text-[hsl(var(--muted-foreground))]">
              {currentAircraft.length} aircraft in <span className="text-[hsl(var(--primary))]">{categories.find(c => c.id === activeCategory)?.label}</span>
            </p>
            <div className="flex gap-1.5">
              {[
                { id: "best", label: "Best Match" },
                { id: "fastest", label: "Fastest" },
                { id: "privacy", label: "Most Discreet" },
                { id: "price", label: "Lowest Price" },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setSortBy(s.id)}
                  className={`px-2.5 py-1 rounded-md font-body text-[8px] tracking-wider uppercase transition-all ${
                    sortBy === s.id
                      ? "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.2)]"
                      : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] border border-transparent"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {currentAircraft.map((aircraft, i) => (
                <AircraftCard key={aircraft.name} aircraft={aircraft} index={i} />
              ))}
              {currentAircraft.length === 0 && (
                <div className="text-center py-12 border border-[hsl(var(--border))] rounded-xl">
                  <Plane size={28} className="text-[hsl(var(--muted-foreground)/0.3)] mx-auto mb-3" />
                  <p className="font-body text-xs text-[hsl(var(--muted-foreground))]">No aircraft in this category yet.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right — Quantus Core Aviation Insights */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-5 hidden lg:block"
        >
          {/* Market Conditions */}
          <div className="border border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--card))] rounded-xl p-4" style={{ boxShadow: "inset 0 1px 20px hsl(var(--primary) / 0.03)" }}>
            <h3 className="font-display text-xs text-[hsl(var(--foreground))] mb-3">
              Market Conditions
              <div className="w-10 h-px bg-[hsl(var(--primary))] mt-1" />
            </h3>
            <div className="space-y-2">
              {marketInsights.map((ins, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-start gap-2"
                >
                  {ins.trend === "up" ? (
                    <TrendingUp size={10} className="text-[hsl(var(--primary))] shrink-0 mt-0.5" />
                  ) : (
                    <TrendingDown size={10} className="text-[hsl(var(--muted-foreground))] shrink-0 mt-0.5" />
                  )}
                  <p className="font-body text-[10px] text-[hsl(var(--foreground)/0.7)] leading-relaxed">{ins.text}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Vendor Performance */}
          <div className="border border-[hsl(var(--border))] bg-[hsl(var(--card))] rounded-xl p-4">
            <h3 className="font-display text-xs text-[hsl(var(--foreground))] mb-3">
              Vendor Performance
              <div className="w-10 h-px bg-[hsl(var(--primary)/0.4)] mt-1" />
            </h3>
            <div className="space-y-2.5">
              {vendorPerformance.map((v, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-[hsl(var(--border)/0.3)] last:border-0">
                  <div>
                    <p className="font-body text-[10px] text-[hsl(var(--foreground)/0.8)]">{v.vendor}</p>
                    <p className="font-body text-[8px] text-[hsl(var(--muted-foreground))]">{v.note}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-[11px] text-[hsl(var(--primary))]">{v.response}</p>
                    <p className="font-body text-[8px] text-[hsl(var(--muted-foreground))]">{v.privacy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Price Intelligence */}
          <div className="border border-[hsl(var(--border))] bg-[hsl(var(--card))] rounded-xl p-4">
            <h3 className="font-display text-xs text-[hsl(var(--foreground))] mb-3">
              Price Intelligence
              <div className="w-10 h-px bg-[hsl(var(--primary)/0.4)] mt-1" />
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between font-body text-[9px] text-[hsl(var(--muted-foreground))]">
                <span>Market Average</span>
                <span className="text-[hsl(var(--foreground))]">£6,800/hr</span>
              </div>
              <div className="w-full h-1.5 bg-[hsl(var(--muted))] rounded-full overflow-hidden relative">
                <div className="h-full bg-gradient-to-r from-[hsl(var(--primary)/0.4)] to-[hsl(var(--primary))] rounded-full" style={{ width: "65%" }} />
                <div className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[hsl(var(--primary))] border-2 border-[hsl(var(--background))]" style={{ left: "55%" }} />
              </div>
              <div className="flex justify-between font-body text-[9px]">
                <span className="text-[hsl(var(--muted-foreground))]">£3,000</span>
                <span className="text-[hsl(var(--primary))]">AI Target: £5,950</span>
                <span className="text-[hsl(var(--muted-foreground))]">£15,000</span>
              </div>
            </div>
          </div>

          {/* Operational Alerts */}
          <div className="border border-[hsl(var(--border))] bg-[hsl(var(--card))] rounded-xl p-4">
            <h3 className="font-display text-xs text-[hsl(var(--foreground))] mb-3">
              Operational Alerts
              <div className="w-10 h-px bg-amber-400/40 mt-1" />
            </h3>
            <div className="space-y-2">
              {operationalAlerts.map((a, i) => (
                <div key={i} className={`flex items-start gap-2 p-2 rounded-lg border text-[10px] font-body leading-relaxed ${
                  a.severity === "high"
                    ? "border-red-400/20 bg-red-400/5 text-red-300"
                    : a.severity === "medium"
                    ? "border-amber-400/20 bg-amber-400/5 text-amber-300"
                    : "border-emerald-400/20 bg-emerald-400/5 text-emerald-300"
                }`}>
                  {a.severity === "high" ? <AlertTriangle size={10} className="shrink-0 mt-0.5" /> :
                   a.severity === "medium" ? <CloudSun size={10} className="shrink-0 mt-0.5" /> :
                   <CloudSun size={10} className="shrink-0 mt-0.5" />}
                  {a.text}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AviationModule;
