import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModuleData } from "@/hooks/use-module-data";
import ModuleLiveDeals from "@/components/modules/ModuleLiveDeals";
import { Link } from "react-router-dom";
import {
  Heart, Search, ArrowRight, Bookmark, Columns, Sparkles, Shield,
  Clock, Star, Users, AlertTriangle, Activity, Stethoscope, Brain,
  Leaf, Dna, Hotel, HeartPulse, Lock, Globe, BadgeCheck, Plane,
} from "lucide-react";

/* ── Data ── */
const categories = [
  { id: "diagnostics", label: "Diagnostics", icon: Stethoscope, count: 9 },
  { id: "surgery", label: "Surgery", icon: Activity, count: 7 },
  { id: "longevity", label: "Longevity", icon: HeartPulse, count: 6 },
  { id: "regenerative", label: "Regenerative Medicine", icon: Dna, count: 5 },
  { id: "wellness", label: "Wellness Retreats", icon: Leaf, count: 8 },
  { id: "executive", label: "Executive Health", icon: Shield, count: 10 },
  { id: "mental", label: "Mental Health", icon: Brain, count: 4 },
  { id: "off-market", label: "Off‑Market Clinics", icon: Lock, count: 3 },
];

type Provider = {
  name: string; location: string; specialties: string[];
  availability: string; privacy: string; successRate: string;
  accreditation: string; programs: string[]; price: string;
  notes: string[];
};

const providerData: Record<string, Provider[]> = {
  diagnostics: [
    { name: "Zurich Longevity Institute", location: "Zurich, Switzerland", specialties: ["Full-Body Diagnostics", "Genomic Screening", "Cancer Markers"], availability: "2 weeks", privacy: "Ultra", successRate: "99.2%", accreditation: "JCI / Swiss Medic", programs: ["3-day executive diagnostic program", "Advanced cardiac imaging", "Liquid biopsy panel"], price: "From CHF 18,000", notes: ["Private suite included", "Results within 48 hours"] },
    { name: "Munich Diagnostics Centre", location: "Munich, Germany", specialties: ["MRI / CT Imaging", "Neurological Screening", "Cardiovascular"], availability: "1 week", privacy: "Very High", successRate: "98.5%", accreditation: "TÜV / DKG", programs: ["2-day comprehensive scan", "Brain health assessment", "Vascular mapping"], price: "From €12,500", notes: ["Fastest turnaround in DACH region", "Multilingual staff"] },
  ],
  surgery: [
    { name: "Cleveland Clinic London", location: "London, UK", specialties: ["Cardiac Surgery", "Orthopaedics", "Neurosurgery"], availability: "3 weeks", privacy: "Very High", successRate: "99.4%", accreditation: "CQC / JCI", programs: ["Minimally invasive cardiac procedures", "Joint replacement program", "Spinal surgery center"], price: "From £35,000", notes: ["Private recovery suites", "24/7 post-op monitoring"] },
    { name: "Hirslanden Private Hospital", location: "Zurich, Switzerland", specialties: ["Orthopaedics", "Plastic Surgery", "General Surgery"], availability: "2 weeks", privacy: "Ultra", successRate: "98.8%", accreditation: "Swiss Medic / JCI", programs: ["Arthroscopic surgery", "Aesthetic procedures", "Robotic-assisted surgery"], price: "From CHF 28,000", notes: ["Lake-view recovery rooms", "Concierge medical coordinator"] },
  ],
  longevity: [
    { name: "Lanserhof Tegernsee", location: "Bavaria, Germany", specialties: ["Longevity Diagnostics", "Detox Programs", "Regeneration"], availability: "4 weeks", privacy: "Ultra", successRate: "97%", accreditation: "TÜV Med", programs: ["LANS Med Concept — 14 days", "Gut health reset", "Hormonal optimization"], price: "From €15,000/week", notes: ["World's leading longevity clinic", "Minimum 7-night stay"] },
    { name: "Clinique La Prairie", location: "Montreux, Switzerland", specialties: ["Anti-Aging", "Revitalization", "Cellular Therapy"], availability: "3 weeks", privacy: "Ultra", successRate: "96%", accreditation: "Swiss Medic", programs: ["Revitalization Program — 7 days", "Master Detox", "DNA-based longevity plan"], price: "From CHF 22,000", notes: ["Established 1931", "Lake Geneva setting"] },
  ],
  regenerative: [
    { name: "Paracelsus Recovery", location: "Zurich, Switzerland", specialties: ["Stem Cell Therapy", "IV Infusion", "Bio-identical HRT"], availability: "2 weeks", privacy: "Ultra", successRate: "94%", accreditation: "Swiss Medic", programs: ["Stem cell rejuvenation protocol", "NAD+ infusion series", "PRP therapy program"], price: "From CHF 40,000", notes: ["Strictly 1 client at a time", "Maximum discretion guaranteed"] },
  ],
  wellness: [
    { name: "SHA Wellness Clinic", location: "Alicante, Spain", specialties: ["Wellness", "Nutrition", "Fitness"], availability: "1 week", privacy: "High", successRate: "95%", accreditation: "ISO 9001", programs: ["Rebalance program — 7 days", "Weight management", "Healthy aging intensive"], price: "From €8,500/week", notes: ["Mediterranean setting", "Macrobiotic cuisine"] },
    { name: "Chenot Palace Weggis", location: "Lake Lucerne, Switzerland", specialties: ["Detox", "Energy Recovery", "Sleep Optimization"], availability: "2 weeks", privacy: "Very High", successRate: "96%", accreditation: "Swiss Health", programs: ["Advanced Detox — 7 days", "Sleep recovery protocol", "Energetic rebalancing"], price: "From CHF 12,000/week", notes: ["Alpine lakeside setting", "Cutting-edge biohacking tech"] },
  ],
  executive: [
    { name: "Mayo Clinic Executive Health", location: "Rochester, Minnesota", specialties: ["Comprehensive Screening", "Preventive Medicine", "Second Opinions"], availability: "3 weeks", privacy: "Very High", successRate: "99.5%", accreditation: "JCI / AAAHC", programs: ["2-day executive physical", "Cancer screening protocol", "Cardiovascular risk assessment"], price: "From $8,500", notes: ["#1 rated hospital globally", "Same-day specialist access"] },
    { name: "Bumrungrad International", location: "Bangkok, Thailand", specialties: ["Executive Check-up", "Cardiac Screening", "Wellness"], availability: "1 week", privacy: "High", successRate: "98%", accreditation: "JCI", programs: ["Premium executive health check", "Cardiac CT & stress test", "Anti-aging panel"], price: "From $3,500", notes: ["Royal suite available", "Medical tourism leader"] },
  ],
  mental: [
    { name: "The Kusnacht Practice", location: "Zurich, Switzerland", specialties: ["Psychiatry", "Addiction", "Burnout Recovery"], availability: "Immediate", privacy: "Ultra", successRate: "93%", accreditation: "Swiss Medic", programs: ["Burnout recovery — 4 weeks", "Executive stress management", "Trauma therapy intensive"], price: "From CHF 75,000/month", notes: ["One client at a time", "Lake-side villa setting"] },
  ],
  "off-market": [
    { name: "Private Clinic — Geneva", location: "Geneva, Switzerland", specialties: ["Undisclosed Specialty", "Concierge Medicine"], availability: "By referral only", privacy: "Ultra — NDA Required", successRate: "—", accreditation: "Swiss Medic", programs: ["Bespoke treatment protocol", "Direct physician access 24/7"], price: "Upon inquiry", notes: ["Not publicly listed", "Introduction via Quantus only"] },
  ],
};

const marketInsights = [
  { text: "Executive diagnostic demand up 23% this quarter across Swiss clinics.", icon: Activity },
  { text: "Two new regenerative medicine programs added in Munich.", icon: Dna },
  { text: "Longevity clinic wait times shortened — early Q2 availability.", icon: Clock },
  { text: "Off-market clinic in Geneva accepting Quantus referrals.", icon: Lock },
];

const providerPerformance = [
  { name: "Zurich Longevity Institute", satisfaction: "98%", note: "Highest satisfaction" },
  { name: "Munich Diagnostics", satisfaction: "97%", note: "Fastest availability" },
  { name: "Lanserhof Tegernsee", satisfaction: "96%", note: "Best longevity outcomes" },
];

const complianceBadges = [
  { label: "HIPAA", color: "text-blue-400 border-blue-400/20 bg-blue-400/5" },
  { label: "GDPR", color: "text-emerald-400 border-emerald-400/20 bg-emerald-400/5" },
  { label: "Swiss Medic", color: "text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.05)]" },
  { label: "JCI", color: "text-amber-400 border-amber-400/20 bg-amber-400/5" },
];

/* ── Provider Card ── */
function ProviderCard({ provider, index }: { provider: Provider; index: number }) {
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
          ? "border-[hsl(var(--primary)/0.3)] shadow-[0_6px_40px_hsl(200_60%_50%/0.05),0_6px_40px_hsl(var(--primary)/0.06)] -translate-y-1"
          : "border-[hsl(var(--border))]"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display text-base text-[hsl(var(--foreground))]">{provider.name}</h3>
          <p className="font-body text-[10px] text-[hsl(var(--muted-foreground))] flex items-center gap-1">
            <Globe size={9} /> {provider.location}
          </p>
        </div>
        <button className="text-[hsl(var(--primary)/0.4)] hover:text-[hsl(var(--primary))] transition-colors">
          <Bookmark size={16} />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {provider.specialties.map(s => (
          <span key={s} className="px-2 py-0.5 rounded-md border border-[hsl(var(--primary)/0.15)] bg-[hsl(var(--primary)/0.05)] font-body text-[8px] tracking-wider uppercase text-[hsl(var(--primary)/0.8)]">
            {s}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { icon: Clock, label: "Available", value: provider.availability },
          { icon: Shield, label: "Privacy", value: provider.privacy },
          { icon: Activity, label: "Success", value: provider.successRate },
          { icon: BadgeCheck, label: "Accredited", value: provider.accreditation.split(" / ")[0] },
        ].map(m => (
          <div key={m.label} className="text-center p-2 border border-[hsl(var(--border)/0.5)] rounded-lg bg-[hsl(var(--muted)/0.3)]">
            <m.icon size={10} className="text-[hsl(var(--primary)/0.5)] mx-auto mb-1" />
            <p className="font-display text-[10px] text-[hsl(var(--foreground))]">{m.value}</p>
            <p className="font-body text-[7px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-1.5 mb-4 p-3 border border-[hsl(var(--border)/0.3)] rounded-lg bg-[hsl(var(--muted)/0.15)]">
        <p className="font-body text-[8px] tracking-[0.15em] uppercase text-[hsl(var(--muted-foreground))] mb-1">Programs</p>
        {provider.programs.map((p, i) => (
          <p key={i} className="font-body text-[10px] text-[hsl(var(--foreground)/0.7)] flex items-center gap-1.5">
            <HeartPulse size={8} className="text-[hsl(var(--primary)/0.5)] shrink-0" /> {p}
          </p>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4 px-3 py-2 border border-[hsl(var(--primary)/0.1)] rounded-lg bg-[hsl(var(--primary)/0.02)]">
        <span className="font-body text-[9px] text-[hsl(var(--muted-foreground))] uppercase tracking-wider">Starting at</span>
        <span className="font-display text-sm text-[hsl(var(--foreground))]">{provider.price}</span>
      </div>

      <div className="space-y-1 mb-4">
        {provider.notes.map((note, i) => (
          <p key={i} className="font-body text-[10px] text-[hsl(var(--primary)/0.7)] flex items-center gap-1.5">
            <Sparkles size={8} className="shrink-0" /> {note}
          </p>
        ))}
      </div>

      <div className="flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 border border-[hsl(var(--primary)/0.3)] rounded-lg font-body text-[9px] tracking-widest uppercase text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.05)] transition-all">
          View Program
        </button>
        <Link to="/intake" className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-lg font-body text-[9px] tracking-widest uppercase hover:opacity-90 transition-all">
          Start Deal <ArrowRight size={10} />
        </Link>
      </div>
    </motion.div>
  );
}

/* ── Main Module ── */
const MedicalModule = () => {
  const [activeCategory, setActiveCategory] = useState("diagnostics");
  const [sortBy, setSortBy] = useState("best");
  const currentProviders = providerData[activeCategory] || [];
  const activeCat = categories.find(c => c.id === activeCategory);
  const { deals, sourcingResults, vendorOutreach, loading: liveLoading } = useModuleData("medical");

  return (
    <div className="space-y-6">
      <ModuleLiveDeals deals={deals} sourcingResults={sourcingResults} vendorOutreach={vendorOutreach} loading={liveLoading} categoryLabel="Medical & Wellness" />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start justify-between mb-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Heart size={18} className="text-[hsl(var(--primary))]" strokeWidth={1.5} />
              <p className="font-body text-[10px] tracking-[0.3em] uppercase text-[hsl(var(--primary)/0.6)]">Module 2</p>
            </div>
            <h1 className="font-display text-2xl md:text-3xl text-[hsl(var(--foreground))]">
              Medical & Wellness Intelligence
              <motion.div className="h-px bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(200_60%_50%/0.3)] to-transparent mt-1" initial={{ width: 0 }} animate={{ width: "70%" }} transition={{ duration: 1, delay: 0.3 }} />
            </h1>
            <p className="font-body text-xs text-[hsl(var(--primary)/0.7)] mt-1">
              Your private medical ecosystem — diagnostics, surgery, longevity, and wellness travel.
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

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_260px] gap-5">
        {/* Left — Categories */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-1.5">
          <h3 className="font-body text-[9px] tracking-[0.2em] uppercase text-[hsl(var(--muted-foreground))] mb-3 px-2">Medical Domain</h3>
          {categories.map((cat, i) => {
            const CatIcon = cat.icon;
            return (
              <motion.button key={cat.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.04 }}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg font-body text-xs transition-all ${
                  activeCategory === cat.id
                    ? "bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.3)] text-[hsl(var(--primary))]"
                    : "border border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/0.5)] opacity-60 hover:opacity-100"
                }`}>
                <span className="flex items-center gap-2"><CatIcon size={13} /><span className="text-left">{cat.label}</span></span>
                <span className={`text-[9px] ${activeCategory === cat.id ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted-foreground))]"}`}>{cat.count}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Center — Provider Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-body text-[10px] text-[hsl(var(--muted-foreground))]">
              {currentProviders.length} providers in <span className="text-[hsl(var(--primary))]">{activeCat?.label}</span>
            </p>
            <div className="flex gap-1.5">
              {[{ id: "best", label: "Best Match" }, { id: "fastest", label: "Fastest" }, { id: "privacy", label: "Most Discreet" }, { id: "advanced", label: "Most Advanced" }].map(s => (
                <button key={s.id} onClick={() => setSortBy(s.id)}
                  className={`px-2.5 py-1 rounded-md font-body text-[8px] tracking-wider uppercase transition-all ${
                    sortBy === s.id ? "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.2)]" : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] border border-transparent"
                  }`}>{s.label}</button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeCategory} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {currentProviders.map((provider, i) => <ProviderCard key={provider.name} provider={provider} index={i} />)}
              {currentProviders.length === 0 && (
                <div className="text-center py-12 border border-[hsl(var(--border))] rounded-xl">
                  <Heart size={28} className="text-[hsl(var(--muted-foreground)/0.3)] mx-auto mb-3" />
                  <p className="font-body text-xs text-[hsl(var(--muted-foreground))]">No providers in this category yet.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right — Insights Panel */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-5 hidden lg:block">
          <div className="border border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--card))] rounded-xl p-4" style={{ boxShadow: "inset 0 1px 20px hsl(var(--primary) / 0.03)" }}>
            <h3 className="font-display text-xs text-[hsl(var(--foreground))] mb-3">Medical Market<div className="w-10 h-px bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(200_60%_50%/0.3)] mt-1" /></h3>
            <div className="space-y-2">
              {marketInsights.map((ins, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }} className="flex items-start gap-2">
                  <ins.icon size={10} className="text-[hsl(var(--primary))] shrink-0 mt-0.5" />
                  <p className="font-body text-[10px] text-[hsl(var(--foreground)/0.7)] leading-relaxed">{ins.text}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="border border-[hsl(var(--border))] bg-[hsl(var(--card))] rounded-xl p-4">
            <h3 className="font-display text-xs text-[hsl(var(--foreground))] mb-3">Provider Performance<div className="w-10 h-px bg-[hsl(var(--primary)/0.4)] mt-1" /></h3>
            <div className="space-y-2.5">
              {providerPerformance.map((v, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-[hsl(var(--border)/0.3)] last:border-0">
                  <div><p className="font-body text-[10px] text-[hsl(var(--foreground)/0.8)]">{v.name}</p><p className="font-body text-[8px] text-[hsl(var(--muted-foreground))]">{v.note}</p></div>
                  <p className="font-display text-[11px] text-[hsl(var(--primary))]">{v.satisfaction}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-[hsl(var(--border))] bg-[hsl(var(--card))] rounded-xl p-4">
            <h3 className="font-display text-xs text-[hsl(var(--foreground))] mb-3">Privacy & Compliance<div className="w-10 h-px bg-[hsl(var(--primary)/0.4)] mt-1" /></h3>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {complianceBadges.map(b => (
                <span key={b.label} className={`px-2 py-0.5 rounded border text-[8px] font-body tracking-wider uppercase ${b.color}`}>{b.label}</span>
              ))}
            </div>
            <p className="font-body text-[10px] text-[hsl(var(--foreground)/0.6)] leading-relaxed">All listed clinics meet Obsidian-tier privacy requirements. NDA protocols available on request.</p>
          </div>

          <div className="border border-[hsl(var(--border))] bg-[hsl(var(--card))] rounded-xl p-4">
            <h3 className="font-display text-xs text-[hsl(var(--foreground))] mb-3">Travel & Logistics<div className="w-10 h-px bg-[hsl(var(--primary)/0.4)] mt-1" /></h3>
            <div className="space-y-2">
              {[
                { icon: Plane, text: "Best routing: Geneva → Zurich via private transfer (45 min)" },
                { icon: Hotel, text: "Recovery suite availability confirmed at partner hotels" },
                { icon: Shield, text: "Medical visa assistance available for non-EU clients" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <item.icon size={10} className="text-[hsl(var(--primary)/0.5)] shrink-0 mt-0.5" />
                  <p className="font-body text-[10px] text-[hsl(var(--foreground)/0.6)] leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MedicalModule;
