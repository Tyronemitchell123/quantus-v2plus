import { useState } from "react";
import { useModuleData } from "@/hooks/use-module-data";
import ModuleLiveDeals from "@/components/modules/ModuleLiveDeals";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Hotel, Home, Ship, Sparkles, UtensilsCrossed, Heart, Calendar, Eye, Search, SlidersHorizontal, Bookmark, GitCompare, Star, AlertTriangle, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  { key: "hotels", label: "Hotels & Resorts", icon: Hotel, count: 8 },
  { key: "villas", label: "Private Villas", icon: Home, count: 5 },
  { key: "yachts", label: "Yachts", icon: Ship, count: 4 },
  { key: "experiences", label: "Experiences", icon: Sparkles, count: 6 },
  { key: "restaurants", label: "Restaurants", icon: UtensilsCrossed, count: 7 },
  { key: "wellness", label: "Wellness Retreats", icon: Heart, count: 4 },
  { key: "events", label: "Events & Access", icon: Calendar, count: 3 },
  { key: "off-market", label: "Off-Market Stays", icon: Eye, count: 2 },
];

type OptionData = {
  name: string;
  tags: string[];
  availability: string;
  privacy: string;
  rating: string;
  vendorAlign: string;
  details: string[];
  price: string;
  score: number;
};

const optionData: Record<string, OptionData[]> = {
  hotels: [
    { name: "Aman Tokyo — Imperial Suite", tags: ["Suite", "Wellness", "Cityscape"], availability: "Mar 28–Apr 4", privacy: "Ultra", rating: "9.8", vendorAlign: "99%", details: ["3-night stay with private spa access", "Dedicated butler service", "Helicopter transfer available"], price: "From £4,200 per night", score: 98 },
    { name: "Claridge's — Brook Penthouse", tags: ["Penthouse", "Heritage", "Mayfair"], availability: "Immediate", privacy: "Obsidian", rating: "9.7", vendorAlign: "97%", details: ["Art Deco penthouse — 2 bedrooms", "24hr private butler", "Rolls-Royce airport transfer"], price: "From £8,500 per night", score: 97 },
    { name: "Four Seasons Bora Bora — Overwater Villa", tags: ["Villa", "Ocean", "Tropical"], availability: "Apr 10–20", privacy: "Ultra", rating: "9.6", vendorAlign: "98%", details: ["Private overwater bungalow", "Glass floor viewing panel", "Private beach & chef"], price: "From £3,800 per night", score: 95 },
  ],
  villas: [
    { name: "Villa Ephrussi — Cap Ferrat", tags: ["Riviera", "Historic", "Gardens"], availability: "Jun–Sep", privacy: "Obsidian", rating: "9.9", vendorAlign: "96%", details: ["12-bedroom Belle Époque estate", "Private gardens & infinity pool", "Full staff of 8 included"], price: "From £45,000 per week", score: 99 },
    { name: "Palazzo Contarini — Venice", tags: ["Canal", "Heritage", "Private"], availability: "Apr–Oct", privacy: "Ultra", rating: "9.5", vendorAlign: "94%", details: ["15th century Grand Canal palazzo", "Private dock & water taxi", "Chef & concierge included"], price: "From £28,000 per week", score: 94 },
  ],
  yachts: [
    { name: "M/Y Quantum — 62m Lürssen", tags: ["Superyacht", "Mediterranean", "12 Guests"], availability: "May–Oct", privacy: "Obsidian", rating: "9.8", vendorAlign: "98%", details: ["6 staterooms — crew of 14", "Helipad & submarine tender", "Michelin-trained private chef"], price: "From €380,000 per week", score: 98 },
    { name: "S/Y Ethereal — 48m Sailing Yacht", tags: ["Sailing", "Caribbean", "Eco"], availability: "Nov–Apr", privacy: "Ultra", rating: "9.6", vendorAlign: "95%", details: ["Hybrid propulsion — zero emission mode", "5 cabins — 10 guests", "Dive equipment & water toys"], price: "From €180,000 per week", score: 94 },
  ],
  experiences: [
    { name: "Northern Lights — Private Expedition", tags: ["Arctic", "Adventure", "Exclusive"], availability: "Sep–Mar", privacy: "Ultra", rating: "9.7", vendorAlign: "96%", details: ["Private charter to Svalbard", "Glass-roof heated cabin", "Expert astrophysicist guide"], price: "From £18,000 per person", score: 96 },
    { name: "Tuscan Harvest — Private Estate", tags: ["Wine", "Culinary", "Cultural"], availability: "Sep–Oct", privacy: "Ultra", rating: "9.5", vendorAlign: "97%", details: ["Private truffle & olive harvest", "Michelin chef dining experience", "Helicopter vineyard tour"], price: "From £8,500 per person", score: 93 },
  ],
  restaurants: [
    { name: "Noma — Private Dining Room", tags: ["Nordic", "Fine Dining", "Copenhagen"], availability: "By request", privacy: "Ultra", rating: "9.9", vendorAlign: "92%", details: ["20-course tasting menu", "Private sommelier pairing", "Chef's table experience"], price: "From £1,200 per person", score: 97 },
  ],
  wellness: [
    { name: "Lanserhof Tegernsee — LANS Medicum", tags: ["Longevity", "Diagnostics", "Alpine"], availability: "Mar–Nov", privacy: "Obsidian", rating: "9.8", vendorAlign: "99%", details: ["7-day executive health programme", "Full diagnostics & recovery", "Private suite with alpine views"], price: "From €12,000 per programme", score: 98 },
  ],
  events: [
    { name: "Monaco Grand Prix — Yacht Hospitality", tags: ["F1", "VIP", "Harbour View"], availability: "May 24–26", privacy: "Ultra", rating: "9.6", vendorAlign: "94%", details: ["Private yacht in Port Hercules", "Paddock access & pit lane tour", "Catered by Michelin chef"], price: "From £85,000 per weekend", score: 95 },
  ],
  "off-market": [
    { name: "Confidential — Private Island, Maldives", tags: ["Island", "Off-Market", "Ultra-Private"], availability: "Discreet inquiry only", privacy: "Obsidian", rating: "N/A", vendorAlign: "100%", details: ["Entire private island — 4 villas", "Staff of 20 — complete privacy", "Available for long-term lease"], price: "By arrangement", score: 99 },
  ],
};

const marketInsights: Record<string, { conditions: string[]; performance: string[]; priceIntel: { min: number; max: number; aiTarget: number; unit: string }; logistics: string[] }> = {
  hotels: {
    conditions: ["Peak demand for Tokyo luxury suites this season.", "Two new Aman properties added to network."],
    performance: ["Aman: 99% privacy alignment.", "Four Seasons: fastest confirmations."],
    priceIntel: { min: 2, max: 15, aiTarget: 6, unit: "£k/night" },
    logistics: ["Best routing for London → Tokyo: BA First via direct.", "Private transfer options confirmed at all properties."],
  },
  villas: {
    conditions: ["Mediterranean villas in high demand for summer.", "Two off-market estates available in Provence."],
    performance: ["Cap Ferrat properties: exceptional discretion.", "Venice palazzo: strong repeat-client satisfaction."],
    priceIntel: { min: 15, max: 80, aiTarget: 40, unit: "£k/week" },
    logistics: ["Private jet Nice → Cannes: 12 min transfer.", "Helicopter transfers available Cap Ferrat."],
  },
  yachts: {
    conditions: ["Superyacht demand elevated for Med summer.", "New eco-yacht options entering fleet."],
    performance: ["M/Y Quantum: top-rated crew in network.", "S/Y Ethereal: best eco-credentials."],
    priceIntel: { min: 100, max: 500, aiTarget: 280, unit: "€k/week" },
    logistics: ["Embarkation available Monaco, Antibes, Palma.", "Crew pre-briefing included."],
  },
  experiences: {
    conditions: ["Arctic expeditions booking fast for next season.", "Tuscan harvest limited to 4 private bookings."],
    performance: ["Northern Lights: 94% aurora sighting rate.", "Tuscan Harvest: Michelin chef confirmed."],
    priceIntel: { min: 5, max: 25, aiTarget: 14, unit: "£k/person" },
    logistics: ["Private charter Tromsø → Svalbard confirmed.", "Helicopter vineyard access arranged."],
  },
  restaurants: {
    conditions: ["Private dining at Noma limited availability.", "New partnerships with 3 Michelin venues."],
    performance: ["Noma: exceptional guest satisfaction.", "Discreet booking process confirmed."],
    priceIntel: { min: 0.5, max: 3, aiTarget: 1.5, unit: "£k/person" },
    logistics: ["Private car service arranged.", "Dietary requirements pre-communicated."],
  },
  wellness: {
    conditions: ["Lanserhof programmes booking 3 months ahead.", "New longevity protocols available."],
    performance: ["Lanserhof: 99% privacy compliance.", "World-class diagnostic team."],
    priceIntel: { min: 8, max: 30, aiTarget: 15, unit: "€k/programme" },
    logistics: ["Munich → Tegernsee: private transfer 45 min.", "Medical records transfer arranged."],
  },
  events: {
    conditions: ["Monaco GP yacht hospitality 60% booked.", "Limited paddock access remaining."],
    performance: ["Yacht hospitality: exceptional harbour positioning.", "Catering standards verified."],
    priceIntel: { min: 50, max: 150, aiTarget: 85, unit: "£k/weekend" },
    logistics: ["Nice → Monaco helicopter: 7 min.", "Private security detail available."],
  },
  "off-market": {
    conditions: ["Rare private island available — Maldives.", "Discreet inquiry required."],
    performance: ["100% vendor alignment — direct owner.", "Complete privacy guaranteed."],
    priceIntel: { min: 50, max: 500, aiTarget: 200, unit: "£k" },
    logistics: ["Male → private island: seaplane 40 min.", "Full staff pre-positioned."],
  },
};

const OptionCard = ({ option, index }: { option: OptionData; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08, duration: 0.5 }}
    className="group glass-card border border-[hsl(var(--gold))]/20 hover:border-[hsl(var(--gold))]/50 p-6 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_8px_32px_hsl(var(--gold)/0.12)] cursor-pointer"
  >
    <div className="flex items-start justify-between mb-4">
      <div>
        <h4 className="font-display text-base text-foreground">{option.name}</h4>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {option.tags.map((t) => (
            <span key={t} className="px-2 py-0.5 bg-[hsl(var(--gold))]/5 border border-[hsl(var(--gold))]/15 font-body text-[10px] text-[hsl(var(--gold))]/80 rounded">{t}</span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-2.5 py-1 border border-[hsl(var(--gold))]/20 rounded">
        <Star size={10} className="text-[hsl(var(--gold))]" fill="hsl(var(--gold))" />
        <span className="font-body text-xs text-[hsl(var(--gold))]">{option.score}</span>
      </div>
    </div>

    <div className="grid grid-cols-4 gap-2 mb-4">
      {[
        { label: "Availability", value: option.availability },
        { label: "Privacy", value: option.privacy },
        { label: "Rating", value: option.rating },
        { label: "Alignment", value: option.vendorAlign },
      ].map((m) => (
        <div key={m.label} className="text-center px-2 py-2 bg-secondary/30 border border-border/50 rounded">
          <p className="font-body text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">{m.label}</p>
          <p className="font-body text-[11px] text-foreground">{m.value}</p>
        </div>
      ))}
    </div>

    <div className="mb-4 space-y-1.5">
      {option.details.map((d) => (
        <p key={d} className="font-body text-[11px] text-muted-foreground flex items-start gap-2">
          <span className="w-1 h-1 rounded-full bg-[hsl(var(--gold))] mt-1.5 shrink-0" />
          {d}
        </p>
      ))}
    </div>

    <div className="mb-5 px-3 py-2 bg-[hsl(var(--gold))]/5 border border-[hsl(var(--gold))]/10 rounded">
      <p className="font-body text-xs text-[hsl(var(--gold))]">{option.price}</p>
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
  const insights = marketInsights[category] || marketInsights.hotels;
  const pctTarget = ((insights.priceIntel.aiTarget - insights.priceIntel.min) / (insights.priceIntel.max - insights.priceIntel.min)) * 100;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-4">
      <div className="glass-card border border-[hsl(var(--gold))]/20 p-5">
        <h3 className="font-display text-sm mb-3 text-foreground">Market Conditions</h3>
        <div className="space-y-2">
          {insights.conditions.map((c, i) => (
            <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.1 }} className="font-body text-[11px] text-muted-foreground flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-[hsl(var(--gold))] mt-1.5 shrink-0" />
              {c}
            </motion.p>
          ))}
        </div>
      </div>

      <div className="glass-card border border-[hsl(var(--gold))]/20 p-5">
        <h3 className="font-display text-sm mb-3 text-foreground">Vendor Performance</h3>
        <div className="space-y-2">
          {insights.performance.map((p, i) => (
            <p key={i} className="font-body text-[11px] text-muted-foreground flex items-start gap-2">
              <Star size={8} className="text-[hsl(var(--gold))] mt-1 shrink-0" />
              {p}
            </p>
          ))}
        </div>
      </div>

      <div className="glass-card border border-[hsl(var(--gold))]/20 p-5">
        <h3 className="font-display text-sm mb-3 text-foreground">Price Intelligence</h3>
        <div className="space-y-3">
          <div className="flex justify-between font-body text-[10px] text-muted-foreground">
            <span>{insights.priceIntel.min} {insights.priceIntel.unit}</span>
            <span>{insights.priceIntel.max} {insights.priceIntel.unit}</span>
          </div>
          <div className="relative h-2 bg-secondary/50 rounded-full overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[hsl(var(--gold))]/40 to-[hsl(var(--gold))] rounded-full" style={{ width: `${pctTarget}%` }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[hsl(var(--gold))] border-2 border-background shadow-[0_0_8px_hsl(var(--gold)/0.5)]" style={{ left: `${pctTarget}%`, marginLeft: "-6px" }} />
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle size={10} className="text-[hsl(var(--gold))]" />
            <span className="font-body text-[10px] text-[hsl(var(--gold))]">AI target: {insights.priceIntel.aiTarget} {insights.priceIntel.unit}</span>
          </div>
        </div>
      </div>

      <div className="glass-card border border-[hsl(var(--gold))]/20 p-5">
        <h3 className="font-display text-sm mb-3 text-foreground">Travel & Logistics</h3>
        <div className="space-y-2">
          {insights.logistics.map((l, i) => (
            <p key={i} className="font-body text-[11px] text-muted-foreground flex items-start gap-2">
              <MapPin size={8} className="text-[hsl(var(--gold))] mt-1 shrink-0" />
              {l}
            </p>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const LifestyleModule = () => {
  const [activeCategory, setActiveCategory] = useState("hotels");
  const options = optionData[activeCategory] || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe size={16} className="text-[hsl(var(--gold))]" strokeWidth={1.5} />
            <p className="font-body text-[10px] tracking-[0.3em] uppercase text-[hsl(var(--gold))]/70">Module 4</p>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl text-foreground">Lifestyle & Travel Intelligence</h2>
          <p className="font-body text-xs text-[hsl(var(--gold))]/60 mt-1">Your private travel and lifestyle ecosystem — curated, optimized, and orchestrated.</p>
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
              {options.map((o, i) => (
                <OptionCard key={o.name} option={o} index={i} />
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

export default LifestyleModule;
