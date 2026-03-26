import { useState } from "react";
import { useModuleData } from "@/hooks/use-module-data";
import ModuleLiveDeals from "@/components/modules/ModuleLiveDeals";
import { motion, AnimatePresence } from "framer-motion";
import { Handshake, Plane, Heart, Users, Hotel, Truck, Shield, Sparkles, Eye, Clock, Search, SlidersHorizontal, Bookmark, GitCompare, Star, CheckCircle, AlertTriangle, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  { key: "aviation", label: "Aviation Brokers", icon: Plane, count: 6 },
  { key: "medical", label: "Medical Providers", icon: Heart, count: 5 },
  { key: "staffing", label: "Staffing Agencies", icon: Users, count: 4 },
  { key: "hotels", label: "Hotels & Resorts", icon: Hotel, count: 8 },
  { key: "logistics", label: "Logistics Operators", icon: Truck, count: 5 },
  { key: "security", label: "Security Firms", icon: Shield, count: 4 },
  { key: "wellness", label: "Wellness & Retreat", icon: Sparkles, count: 3 },
  { key: "off-market", label: "Off-Market Vendors", icon: Eye, count: 2 },
  { key: "pending", label: "Pending / Under Review", icon: Clock, count: 3 },
];

type VendorData = {
  name: string;
  tags: string[];
  responseSpeed: string;
  privacy: string;
  rating: string;
  dealVolume: string;
  notes: string[];
  compliance: { nda: string; insurance: string; accreditation: string };
  score: number;
};

const vendorData: Record<string, VendorData[]> = {
  aviation: [
    { name: "Falcon Aviation Group", tags: ["Aviation", "Off-Market", "Ultra-Private"], responseSpeed: "< 1 hour", privacy: "Obsidian", rating: "9.8", dealVolume: "14 deals", notes: ["98% on-time response rate", "Preferred vendor for super-mid jets"], compliance: { nda: "Active", insurance: "£50M", accreditation: "EASA / FAA" }, score: 98 },
    { name: "Meridian Jet Partners", tags: ["Aviation", "Charter", "Global"], responseSpeed: "< 2 hours", privacy: "Ultra", rating: "9.6", dealVolume: "22 deals", notes: ["Strongest global fleet access", "Competitive charter pricing"], compliance: { nda: "Active", insurance: "£30M", accreditation: "IS-BAO Stage 3" }, score: 96 },
    { name: "Skybridge Executive", tags: ["Aviation", "Acquisition", "Brokerage"], responseSpeed: "< 4 hours", privacy: "Ultra", rating: "9.4", dealVolume: "8 deals", notes: ["Specialist in pre-owned heavy jets", "Strong off-market pipeline"], compliance: { nda: "Active", insurance: "£25M", accreditation: "NBAA" }, score: 94 },
  ],
  medical: [
    { name: "Zurich Longevity Institute", tags: ["Medical", "Longevity", "Diagnostics"], responseSpeed: "< 6 hours", privacy: "Obsidian", rating: "9.9", dealVolume: "11 deals", notes: ["World-class diagnostic programmes", "98% client satisfaction"], compliance: { nda: "Active", insurance: "CHF 20M", accreditation: "Swiss Medic / JCI" }, score: 99 },
    { name: "Harley Street Concierge Medical", tags: ["Medical", "Surgery", "Executive Health"], responseSpeed: "< 2 hours", privacy: "Ultra", rating: "9.7", dealVolume: "18 deals", notes: ["Fastest specialist referrals in London", "Strong surgical network"], compliance: { nda: "Active", insurance: "£15M", accreditation: "CQC / GMC" }, score: 97 },
  ],
  staffing: [
    { name: "Mayfair Private Office", tags: ["Staffing", "Estate", "Private Office"], responseSpeed: "< 4 hours", privacy: "Obsidian", rating: "9.8", dealVolume: "26 deals", notes: ["Premier UHNW staffing agency", "Exceptional vetting standards"], compliance: { nda: "Active", insurance: "£10M", accreditation: "REC / APSCo" }, score: 98 },
    { name: "Knightsbridge Personnel", tags: ["Staffing", "Household", "Childcare"], responseSpeed: "< 3 hours", privacy: "Ultra", rating: "9.5", dealVolume: "19 deals", notes: ["Norland nanny specialists", "Strong household staff pipeline"], compliance: { nda: "Active", insurance: "£5M", accreditation: "REC" }, score: 95 },
  ],
  hotels: [
    { name: "Aman Resorts — Direct Partnership", tags: ["Hotels", "Ultra-Luxury", "Global"], responseSpeed: "< 1 hour", privacy: "Obsidian", rating: "9.9", dealVolume: "32 deals", notes: ["Direct allocation access", "VIP amenities guaranteed"], compliance: { nda: "Active", insurance: "N/A", accreditation: "Forbes 5-Star" }, score: 99 },
    { name: "Four Seasons — Preferred Partner", tags: ["Hotels", "Luxury", "Global"], responseSpeed: "< 2 hours", privacy: "Ultra", rating: "9.7", dealVolume: "45 deals", notes: ["Fastest confirmation in network", "Upgrade priority active"], compliance: { nda: "Active", insurance: "N/A", accreditation: "Forbes 5-Star" }, score: 97 },
  ],
  logistics: [
    { name: "Blackline Transport", tags: ["Logistics", "Secure", "Armoured"], responseSpeed: "< 30 min", privacy: "Obsidian", rating: "9.9", dealVolume: "38 deals", notes: ["99% on-time record", "Highest privacy rating in network"], compliance: { nda: "Active", insurance: "£20M", accreditation: "SIA / ISO 27001" }, score: 99 },
    { name: "Elite Recovery Group", tags: ["Logistics", "Recovery", "Priority"], responseSpeed: "< 15 min", privacy: "Ultra", rating: "9.8", dealVolume: "52 deals", notes: ["Fastest response in Greater London", "Enclosed transport available"], compliance: { nda: "Active", insurance: "£10M", accreditation: "AA Approved" }, score: 98 },
  ],
  security: [
    { name: "Obsidian Close Protection", tags: ["Security", "CPO", "Residential"], responseSpeed: "< 10 min", privacy: "Obsidian", rating: "9.9", dealVolume: "28 deals", notes: ["Former special forces operatives", "24/7 ops centre"], compliance: { nda: "Active", insurance: "£25M", accreditation: "SIA / SC Cleared" }, score: 99 },
    { name: "Sentinel Risk Advisory", tags: ["Security", "Cyber-Physical", "Travel"], responseSpeed: "< 1 hour", privacy: "Obsidian", rating: "9.7", dealVolume: "15 deals", notes: ["Cyber-physical hybrid capabilities", "Global threat monitoring"], compliance: { nda: "Active", insurance: "£20M", accreditation: "ASIS / CPP" }, score: 97 },
  ],
  wellness: [
    { name: "Lanserhof Group", tags: ["Wellness", "Longevity", "Alpine"], responseSpeed: "< 6 hours", privacy: "Obsidian", rating: "9.8", dealVolume: "9 deals", notes: ["World-leading health resort group", "LANS Medicum partnership"], compliance: { nda: "Active", insurance: "€15M", accreditation: "TÜV / ISO 9001" }, score: 98 },
  ],
  "off-market": [
    { name: "Confidential — Ref #QV-1192", tags: ["Off-Market", "Multi-Domain", "By Referral"], responseSpeed: "By arrangement", privacy: "Obsidian", rating: "N/A", dealVolume: "Confidential", notes: ["Specialist operator — NDA required", "Quantus-vetted and approved"], compliance: { nda: "Required", insurance: "Verified", accreditation: "Private" }, score: 99 },
  ],
  pending: [
    { name: "Atlas Concierge Services", tags: ["Pending", "Travel", "Multi-Domain"], responseSpeed: "Under review", privacy: "TBC", rating: "Pending", dealVolume: "0 deals", notes: ["Application received 12 Mar", "Background check in progress"], compliance: { nda: "Pending", insurance: "Under review", accreditation: "Under review" }, score: 0 },
    { name: "Nordic Executive Travel", tags: ["Pending", "Aviation", "Scandinavian"], responseSpeed: "Under review", privacy: "TBC", rating: "Pending", dealVolume: "0 deals", notes: ["Referral from existing partner", "Initial screening complete"], compliance: { nda: "Pending", insurance: "Under review", accreditation: "Under review" }, score: 0 },
  ],
};

const insightsData: Record<string, { market: string[]; reliability: { name: string; score: number }[]; compliance: string[]; history: string[] }> = {
  aviation: {
    market: ["Aviation vendors: high responsiveness this week.", "2 new off-market brokers under review."],
    reliability: [{ name: "Falcon Aviation", score: 9.8 }, { name: "Meridian Jet", score: 9.6 }, { name: "Skybridge", score: 9.4 }],
    compliance: ["All NDAs current.", "Insurance verified across network.", "No risk flags active."],
    history: ["Falcon Aviation: 14 deals completed.", "Meridian Jet: 22 deals — highest volume."],
  },
  medical: {
    market: ["Medical providers: limited EU availability.", "New longevity programmes added."],
    reliability: [{ name: "Zurich Longevity", score: 9.9 }, { name: "Harley St Concierge", score: 9.7 }],
    compliance: ["HIPAA/GDPR compliant.", "All accreditations current.", "Patient data tier: Obsidian."],
    history: ["Zurich Longevity: 11 deals completed.", "Harley St: 18 deals — fastest referrals."],
  },
  staffing: {
    market: ["Staffing agencies: strong pipeline this quarter.", "Estate manager demand elevated."],
    reliability: [{ name: "Mayfair Private Office", score: 9.8 }, { name: "Knightsbridge Personnel", score: 9.5 }],
    compliance: ["All agencies REC-registered.", "DBS checks current.", "NDA protocols active."],
    history: ["Mayfair: 26 deals — premier partner.", "Knightsbridge: 19 placements completed."],
  },
  hotels: {
    market: ["Hotel partners: peak season approaching.", "Direct allocation secured at 4 properties."],
    reliability: [{ name: "Aman Resorts", score: 9.9 }, { name: "Four Seasons", score: 9.7 }],
    compliance: ["Privacy agreements active.", "VIP protocols confirmed.", "No data sharing flags."],
    history: ["Aman: 32 bookings — top partner.", "Four Seasons: 45 bookings — highest volume."],
  },
  logistics: {
    market: ["Logistics operators: full availability.", "Secure transport demand rising."],
    reliability: [{ name: "Blackline Transport", score: 9.9 }, { name: "Elite Recovery", score: 9.8 }],
    compliance: ["SIA licensed across network.", "ISO 27001 certified.", "Insurance verified."],
    history: ["Blackline: 38 operations completed.", "Elite Recovery: 52 — highest volume."],
  },
  security: {
    market: ["Security firms: high readiness.", "New cyber-physical partner onboarded."],
    reliability: [{ name: "Obsidian CP", score: 9.9 }, { name: "Sentinel Risk", score: 9.7 }],
    compliance: ["SC/DV clearances active.", "All operatives SIA licensed.", "Ops centres audited."],
    history: ["Obsidian CP: 28 operations.", "Sentinel: 15 — growing partnership."],
  },
  wellness: {
    market: ["Wellness partners: programmes booking ahead.", "New protocols available."],
    reliability: [{ name: "Lanserhof Group", score: 9.8 }],
    compliance: ["Medical registrations verified.", "TÜV certified.", "Privacy tier: Obsidian."],
    history: ["Lanserhof: 9 programmes completed."],
  },
  "off-market": {
    market: ["Off-market vendors: available by referral.", "NDA required before introduction."],
    reliability: [{ name: "Ref #QV-1192", score: 10 }],
    compliance: ["Enhanced vetting completed.", "All operators Quantus-approved.", "Confidentiality guaranteed."],
    history: ["Operations data: confidential."],
  },
  pending: {
    market: ["2 vendors under review.", "Background checks in progress."],
    reliability: [],
    compliance: ["NDAs pending signature.", "Insurance under review.", "Accreditation verification ongoing."],
    history: ["No completed deals yet.", "Onboarding estimated: 2–4 weeks."],
  },
};

const VendorCard = ({ vendor, index }: { vendor: VendorData; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08, duration: 0.5 }}
    className="group glass-card border border-[hsl(var(--gold))]/20 hover:border-[hsl(var(--gold))]/50 p-6 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_8px_32px_hsl(var(--gold)/0.12)] cursor-pointer"
  >
    <div className="flex items-start justify-between mb-4">
      <div>
        <h4 className="font-display text-base text-foreground">{vendor.name}</h4>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {vendor.tags.map((t) => (
            <span key={t} className="px-2 py-0.5 bg-[hsl(var(--gold))]/5 border border-[hsl(var(--gold))]/15 font-body text-[10px] text-[hsl(var(--gold))]/80 rounded">{t}</span>
          ))}
        </div>
      </div>
      {vendor.score > 0 && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 border border-[hsl(var(--gold))]/20 rounded">
          <Star size={10} className="text-[hsl(var(--gold))]" fill="hsl(var(--gold))" />
          <span className="font-body text-xs text-[hsl(var(--gold))]">{vendor.score}</span>
        </div>
      )}
    </div>

    <div className="grid grid-cols-4 gap-2 mb-4">
      {[
        { label: "Response", value: vendor.responseSpeed },
        { label: "Privacy", value: vendor.privacy },
        { label: "Rating", value: vendor.rating },
        { label: "Volume", value: vendor.dealVolume },
      ].map((m) => (
        <div key={m.label} className="text-center px-2 py-2 bg-secondary/30 border border-border/50 rounded">
          <p className="font-body text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">{m.label}</p>
          <p className="font-body text-[11px] text-foreground">{m.value}</p>
        </div>
      ))}
    </div>

    <div className="mb-4 space-y-1.5">
      {vendor.notes.map((n) => (
        <p key={n} className="font-body text-[11px] text-muted-foreground flex items-start gap-2">
          <span className="w-1 h-1 rounded-full bg-[hsl(var(--gold))] mt-1.5 shrink-0" />
          {n}
        </p>
      ))}
    </div>

    <div className="mb-5 flex flex-wrap gap-2">
      {Object.entries(vendor.compliance).map(([k, v]) => (
        <span key={k} className="px-2 py-1 bg-[hsl(var(--gold))]/5 border border-[hsl(var(--gold))]/15 font-body text-[9px] text-[hsl(var(--gold))]/70 rounded flex items-center gap-1">
          <FileText size={8} />
          {k.toUpperCase()}: {v}
        </span>
      ))}
    </div>

    <div className="flex gap-2">
      <button className="flex-1 px-4 py-2.5 border border-[hsl(var(--gold))]/30 text-[hsl(var(--gold))] font-body text-xs tracking-wider hover:bg-[hsl(var(--gold))]/10 transition-colors">
        View Profile
      </button>
      <Link to="/intake" className="flex-1 px-4 py-2.5 bg-[hsl(var(--gold))] text-background font-body text-xs tracking-wider text-center hover:bg-[hsl(var(--gold))]/90 transition-colors">
        Start Deal
      </Link>
    </div>
  </motion.div>
);

const InsightsPanel = ({ category }: { category: string }) => {
  const ins = insightsData[category] || insightsData.aviation;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-4">
      <div className="glass-card border border-[hsl(var(--gold))]/20 p-5">
        <h3 className="font-display text-sm mb-3 text-foreground">Market Performance</h3>
        <div className="space-y-2">
          {ins.market.map((m, i) => (
            <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.1 }} className="font-body text-[11px] text-muted-foreground flex items-start gap-2">
              <span className="w-1 h-1 rounded-full bg-[hsl(var(--gold))] mt-1.5 shrink-0" />
              {m}
            </motion.p>
          ))}
        </div>
      </div>

      {ins.reliability.length > 0 && (
        <div className="glass-card border border-[hsl(var(--gold))]/20 p-5">
          <h3 className="font-display text-sm mb-3 text-foreground">Vendor Reliability</h3>
          <div className="space-y-3">
            {ins.reliability.map((r) => (
              <div key={r.name}>
                <div className="flex justify-between mb-1">
                  <span className="font-body text-[11px] text-muted-foreground">{r.name}</span>
                  <span className="font-body text-[11px] text-[hsl(var(--gold))]">{r.score}/10</span>
                </div>
                <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${r.score * 10}%` }} transition={{ duration: 1, delay: 0.5 }} className="h-full bg-gradient-to-r from-[hsl(var(--gold))]/50 to-[hsl(var(--gold))] rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card border border-[hsl(var(--gold))]/20 p-5">
        <h3 className="font-display text-sm mb-3 text-foreground">Privacy & Compliance</h3>
        <div className="space-y-1.5">
          {ins.compliance.map((c, i) => (
            <p key={i} className="font-body text-[11px] text-muted-foreground flex items-start gap-2">
              <CheckCircle size={8} className="text-emerald-400 mt-1 shrink-0" />
              {c}
            </p>
          ))}
        </div>
      </div>

      <div className="glass-card border border-[hsl(var(--gold))]/20 p-5">
        <h3 className="font-display text-sm mb-3 text-foreground">Deal History</h3>
        <div className="space-y-2">
          {ins.history.map((h, i) => (
            <p key={i} className="font-body text-[11px] text-muted-foreground flex items-start gap-2">
              <Star size={8} className="text-[hsl(var(--gold))] mt-1 shrink-0" />
              {h}
            </p>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const PartnershipsModule = () => {
  const [activeCategory, setActiveCategory] = useState("aviation");
  const vendors = vendorData[activeCategory] || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Handshake size={16} className="text-[hsl(var(--gold))]" strokeWidth={1.5} />
            <p className="font-body text-[10px] tracking-[0.3em] uppercase text-[hsl(var(--gold))]/70">Module 6</p>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl text-foreground">Partnerships & Vendor Network</h2>
          <p className="font-body text-xs text-[hsl(var(--gold))]/60 mt-1">Your global partner ecosystem — verified, rated, and performance-tracked.</p>
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
              {vendors.map((v, i) => (
                <VendorCard key={v.name} vendor={v} index={i} />
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

export default PartnershipsModule;
