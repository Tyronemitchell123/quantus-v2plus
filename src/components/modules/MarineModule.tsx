import { useState, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModuleData } from "@/hooks/use-module-data";
import ModuleLiveDeals from "@/components/modules/ModuleLiveDeals";
import { Link } from "react-router-dom";
import {
  Anchor, Search, BarChart3, ArrowRight, TrendingUp,
  Filter, Sparkles, Shield, Star, Users,
  Gauge, MapPin, ChevronRight, Ship, Waves, Navigation,
} from "lucide-react";

const categories = [
  { id: "motor-yacht", label: "Motor Yacht", icon: "🛥", count: 14 },
  { id: "sailing", label: "Sailing Yacht", icon: "⛵", count: 8 },
  { id: "superyacht", label: "Superyacht", icon: "🚢", count: 5 },
  { id: "charter", label: "Charter", icon: "🌊", count: 18 },
  { id: "crew", label: "Crew Agencies", icon: "👥", count: 9 },
  { id: "marina", label: "Marina & Berth", icon: "⚓", count: 11 },
  { id: "refit", label: "Refit & MRO", icon: "🔧", count: 7 },
  { id: "insurance", label: "Marine Insurance", icon: "🛡", count: 6 },
];

const vesselData: Record<string, Array<{
  name: string; year: number; length: string; builder: string;
  cruisingSpeed: string; guests: number; crew: number;
  location: string; vendorRating: number; charterWeek: string;
  askingPrice: string; vendorNotes: string[];
}>> = {
  "motor-yacht": [
    { name: "Benetti Oasis 40M", year: 2023, length: "40m", builder: "Benetti", cruisingSpeed: "12 kts", guests: 10, crew: 8, location: "Monaco", vendorRating: 96, charterWeek: "€180,000/wk", askingPrice: "€18.5M", vendorNotes: ["Zero-emission at anchor", "Beach club with pool"] },
    { name: "Sunseeker 100 Yacht", year: 2022, length: "30m", builder: "Sunseeker", cruisingSpeed: "24 kts", guests: 8, crew: 5, location: "Mallorca", vendorRating: 93, charterWeek: "€95,000/wk", askingPrice: "€12M", vendorNotes: ["Performance hull", "Main-deck master suite"] },
  ],
  "sailing": [
    { name: "Oyster 745", year: 2021, length: "22.7m", builder: "Oyster Yachts", cruisingSpeed: "10 kts", guests: 6, crew: 2, location: "Antigua", vendorRating: 94, charterWeek: "€45,000/wk", askingPrice: "€4.2M", vendorNotes: ["Blue-water cruiser", "Carbon rig"] },
  ],
  "superyacht": [
    { name: "Lürssen Project", year: 2024, length: "85m", builder: "Lürssen", cruisingSpeed: "16 kts", guests: 14, crew: 22, location: "Confidential", vendorRating: 99, charterWeek: "€850,000/wk", askingPrice: "€145M", vendorNotes: ["Off-market — NDA required", "Helipad & submarine garage"] },
  ],
  "charter": [
    { name: "Med Summer Charter", year: 2023, length: "55m", builder: "Feadship", cruisingSpeed: "14 kts", guests: 12, crew: 14, location: "French Riviera", vendorRating: 97, charterWeek: "€350,000/wk", askingPrice: "—", vendorNotes: ["Available July–Sept", "Michelin-trained chef"] },
  ],
};

const MarineModule = forwardRef<HTMLDivElement>((_, ref) => {
  const [activeCat, setActiveCat] = useState("motor-yacht");
  const { deals, sourcingResults, vendorOutreach, loading: liveLoading } = useModuleData("marine");
  const items = vesselData[activeCat] || [];

  return (
    <div ref={ref} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Anchor size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-medium">Marine & Yachting</h2>
            <p className="text-xs text-muted-foreground">Vessel acquisition • Charter • Crew • Marina services</p>
          </div>
        </div>
        <Link to="/intake" className="flex items-center gap-1 text-xs text-primary hover:underline">
          New Request <ArrowRight size={12} />
        </Link>
      </div>

      {/* Three-zone grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Zone 1 — Categories */}
        <div className="lg:col-span-3 glass-card p-3 space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 px-2">Categories</p>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setActiveCat(c.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded transition-colors ${activeCat === c.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"}`}>
              <span className="flex items-center gap-2"><span>{c.icon}</span>{c.label}</span>
              <span className="text-[10px] opacity-60">{c.count}</span>
            </button>
          ))}
        </div>

        {/* Zone 2 — Directory */}
        <div className="lg:col-span-5 space-y-3">
          <AnimatePresence mode="wait">
            <motion.div key={activeCat} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              {items.length === 0 ? (
                <div className="glass-card p-8 text-center text-muted-foreground text-sm">
                  <Ship size={32} className="mx-auto mb-3 opacity-40" />
                  Select a category to browse vessels & services
                </div>
              ) : items.map((v, i) => (
                <div key={i} className="glass-card p-4 space-y-2 hover:border-primary/20 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-sm font-medium">{v.name}</h3>
                      <p className="text-[10px] text-muted-foreground">{v.builder} • {v.year} • {v.length}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-primary">
                      <Star size={10} fill="currentColor" /> {v.vendorRating}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div className="bg-secondary/30 rounded px-2 py-1"><span className="text-muted-foreground">Speed</span><br/>{v.cruisingSpeed}</div>
                    <div className="bg-secondary/30 rounded px-2 py-1"><span className="text-muted-foreground">Guests</span><br/>{v.guests}</div>
                    <div className="bg-secondary/30 rounded px-2 py-1"><span className="text-muted-foreground">Crew</span><br/>{v.crew}</div>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground flex items-center gap-1"><MapPin size={8} />{v.location}</span>
                    <span className="font-medium">{v.askingPrice !== "—" ? v.askingPrice : v.charterWeek}</span>
                  </div>
                  {v.vendorNotes.map((n, j) => (
                    <p key={j} className="text-[9px] text-muted-foreground/70 flex items-center gap-1"><ChevronRight size={8} />{n}</p>
                  ))}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Zone 3 — AI Insights & Live Deals */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-primary" />
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Quantus V2+ Insights</p>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>• Med charter demand up 18% YoY — premium weeks booking 9 months ahead</p>
              <p>• Superyacht resale values stabilising after 2024 correction</p>
              <p>• New IMO 2025 emissions rules favour hybrid-electric builds</p>
              <p>• Crew shortage in engineering roles — agency rates rising 12%</p>
            </div>
          </div>
          <ModuleLiveDeals deals={deals} sourcingResults={sourcingResults} vendorOutreach={vendorOutreach} loading={liveLoading} categoryLabel="Marine" />
        </div>
      </div>
    </div>
  );
});
MarineModule.displayName = "MarineModule";
export default MarineModule;
