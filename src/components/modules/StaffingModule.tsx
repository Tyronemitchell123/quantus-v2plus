import { useState } from "react";
import { useModuleData } from "@/hooks/use-module-data";
import ModuleLiveDeals from "@/components/modules/ModuleLiveDeals";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Shield, UserCheck, Baby, Car, Heart, Clock, Eye, Search, SlidersHorizontal, Bookmark, GitCompare, Star, CheckCircle, AlertTriangle, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  { key: "estate", label: "Estate Management", icon: Briefcase, count: 6 },
  { key: "private-office", label: "Private Office", icon: Users, count: 4 },
  { key: "household", label: "Household Staff", icon: UserCheck, count: 8 },
  { key: "childcare", label: "Childcare & Education", icon: Baby, count: 5 },
  { key: "security", label: "Security", icon: Shield, count: 7 },
  { key: "chauffeurs", label: "Chauffeurs", icon: Car, count: 3 },
  { key: "wellness", label: "Wellness & Personal Care", icon: Heart, count: 4 },
  { key: "temporary", label: "Temporary / Seasonal", icon: Clock, count: 6 },
  { key: "off-market", label: "Off-Market Talent", icon: Eye, count: 2 },
];

type CandidateData = {
  name: string;
  role: string;
  experience: string;
  privacy: string;
  bgCheck: string;
  availability: string;
  skills: string[];
  notes: string[];
  score: number;
};

const candidateData: Record<string, CandidateData[]> = {
  estate: [
    { name: "Elena M.", role: "Estate Manager", experience: "12 years", privacy: "Ultra", bgCheck: "Cleared", availability: "Immediate", skills: ["Multi-estate oversight", "Staff training & SOP creation", "UHNW household experience"], notes: ["Highly recommended by Mayfair Private Office", "Strong discretion record"], score: 97 },
    { name: "James R.", role: "Estate Director", experience: "18 years", privacy: "Obsidian", bgCheck: "Cleared", availability: "30 days", skills: ["Country estate operations", "Vendor management", "Budget oversight £2M+"], notes: ["Former Rothschild estate team", "Exceptional references"], score: 95 },
    { name: "Sophie K.", role: "Estate Operations Manager", experience: "9 years", privacy: "Ultra", bgCheck: "Cleared", availability: "Immediate", skills: ["Event coordination", "Property maintenance oversight", "Staff scheduling"], notes: ["Available for dual-property roles", "Strong tech proficiency"], score: 91 },
  ],
  "private-office": [
    { name: "Marcus W.", role: "Chief of Staff", experience: "15 years", privacy: "Obsidian", bgCheck: "Cleared", availability: "60 days", skills: ["Family office operations", "Travel coordination", "Stakeholder management"], notes: ["Former UHNW family office lead", "Multilingual — EN/FR/DE"], score: 96 },
    { name: "Anya T.", role: "Executive Assistant", experience: "8 years", privacy: "Ultra", bgCheck: "Cleared", availability: "Immediate", skills: ["Diary management", "Confidential correspondence", "Event logistics"], notes: ["Impeccable discretion record", "Strong editorial skills"], score: 93 },
  ],
  household: [
    { name: "Maria L.", role: "House Manager", experience: "14 years", privacy: "Ultra", bgCheck: "Cleared", availability: "Immediate", skills: ["Household operations", "Staff management", "Inventory & procurement"], notes: ["Managed 12-person household team", "Exceptional organizational skills"], score: 94 },
    { name: "Thomas B.", role: "Butler / House Manager", experience: "20 years", privacy: "Obsidian", bgCheck: "Cleared", availability: "30 days", skills: ["Formal service", "Wine & cellar management", "Event hosting"], notes: ["Trained at Ivor Spencer Academy", "Royal household experience"], score: 98 },
  ],
  childcare: [
    { name: "Claire D.", role: "Norland Nanny", experience: "10 years", privacy: "Ultra", bgCheck: "Cleared", availability: "Immediate", skills: ["Early childhood development", "Travel nanny experience", "First aid certified"], notes: ["Norland College graduate", "Experience with UHNW families"], score: 96 },
  ],
  security: [
    { name: "David K.", role: "Close Protection Officer", experience: "16 years", privacy: "Obsidian", bgCheck: "Cleared", availability: "Immediate", skills: ["Close protection", "Threat assessment", "Travel security"], notes: ["Former SAS", "Multilingual — EN/AR/FR"], score: 97 },
    { name: "Sarah M.", role: "Residential Security Manager", experience: "12 years", privacy: "Ultra", bgCheck: "Cleared", availability: "30 days", skills: ["Estate security systems", "Staff vetting", "Emergency protocols"], notes: ["Strong cyber-physical security background", "Female CPO — discreet profile"], score: 94 },
  ],
  chauffeurs: [
    { name: "Robert H.", role: "Principal Chauffeur", experience: "11 years", privacy: "Ultra", bgCheck: "Cleared", availability: "Immediate", skills: ["Advanced driving", "Route planning", "Vehicle maintenance"], notes: ["IAM Advanced certified", "Experience with armoured vehicles"], score: 92 },
  ],
  wellness: [
    { name: "Dr. Lena P.", role: "Private Wellness Director", experience: "14 years", privacy: "Ultra", bgCheck: "Cleared", availability: "30 days", skills: ["Longevity protocols", "Nutrition planning", "Fitness programming"], notes: ["Medical degree — integrative medicine", "UHNW client roster"], score: 95 },
  ],
  temporary: [
    { name: "Pool — 14 Candidates", role: "Seasonal Staff", experience: "5–15 years", privacy: "Standard+", bgCheck: "Pre-screened", availability: "Flexible", skills: ["Summer estate coverage", "Event staffing", "Holiday season support"], notes: ["Pre-vetted seasonal pool", "Available across UK & Europe"], score: 88 },
  ],
  "off-market": [
    { name: "Confidential — Ref #QS-2847", role: "Principal PA / Chief of Staff", experience: "22 years", privacy: "Obsidian", bgCheck: "Cleared", availability: "Discreet inquiry only", skills: ["Family office leadership", "Multi-property coordination", "Complete discretion"], notes: ["Currently placed — open to approach", "Exceptional pedigree"], score: 99 },
  ],
};

const marketInsights: Record<string, { conditions: string[]; performance: string[]; compliance: string[]; salary: { min: number; max: number; aiTarget: number; currency: string } }> = {
  estate: {
    conditions: ["High demand for estate managers this quarter.", "Two off-market candidates flagged for approach."],
    performance: ["Elena M.: exceptional privacy alignment.", "James R.: strongest references in category."],
    compliance: ["All candidates NDA-cleared.", "Background checks updated within 90 days."],
    salary: { min: 65, max: 180, aiTarget: 120, currency: "£" },
  },
  "private-office": {
    conditions: ["Chief of Staff roles in high demand.", "Multilingual candidates increasingly sought."],
    performance: ["Marcus W.: rare combination of discretion and leadership.", "Anya T.: fastest onboarding record."],
    compliance: ["Enhanced vetting completed.", "Financial background checks included."],
    salary: { min: 55, max: 200, aiTarget: 130, currency: "£" },
  },
  household: {
    conditions: ["Butler market tightening globally.", "House manager demand stable."],
    performance: ["Thomas B.: highest-rated candidate in network.", "Maria L.: exceptional team management."],
    compliance: ["All candidates DBS-cleared.", "Right to work verified."],
    salary: { min: 45, max: 150, aiTarget: 85, currency: "£" },
  },
  childcare: {
    conditions: ["Norland graduates in highest demand.", "Travel nanny requests up 40%."],
    performance: ["Claire D.: outstanding early years expertise.", "Strong travel flexibility."],
    compliance: ["Ofsted-registered where applicable.", "Paediatric first aid current."],
    salary: { min: 40, max: 120, aiTarget: 75, currency: "£" },
  },
  security: {
    conditions: ["Close protection demand elevated.", "Cyber-physical hybrid roles emerging."],
    performance: ["David K.: exceptional threat assessment record.", "Sarah M.: best privacy alignment."],
    compliance: ["SIA licensed.", "SC/DV clearance available."],
    salary: { min: 60, max: 200, aiTarget: 110, currency: "£" },
  },
  chauffeurs: {
    conditions: ["Advanced driving certified chauffeurs limited.", "Armoured vehicle experience premium."],
    performance: ["Robert H.: impeccable safety record.", "Strong route intelligence."],
    compliance: ["IAM/RoSPA certified.", "Clean advanced driving record."],
    salary: { min: 35, max: 75, aiTarget: 55, currency: "£" },
  },
  wellness: {
    conditions: ["Private wellness directors increasingly sought.", "Longevity focus growing."],
    performance: ["Dr. Lena P.: rare medical-wellness crossover.", "Exceptional client retention."],
    compliance: ["Medical registration verified.", "Insurance current."],
    salary: { min: 80, max: 250, aiTarget: 150, currency: "£" },
  },
  temporary: {
    conditions: ["Summer season bookings opening.", "Event season demand rising."],
    performance: ["Pre-vetted pool maintains 94% satisfaction.", "Fast deployment — 48hr average."],
    compliance: ["All pool members pre-screened.", "Right to work verified."],
    salary: { min: 25, max: 60, aiTarget: 40, currency: "£" },
  },
  "off-market": {
    conditions: ["Rare off-market talent available.", "Discreet approach required."],
    performance: ["Ref #QS-2847: highest-calibre candidate in network.", "Exceptional pedigree and discretion."],
    compliance: ["Enhanced due diligence available.", "NDA required before introduction."],
    salary: { min: 120, max: 350, aiTarget: 200, currency: "£" },
  },
};

const CandidateCard = ({ candidate, index }: { candidate: CandidateData; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08, duration: 0.5 }}
    className="group glass-card border border-[hsl(var(--gold))]/20 hover:border-[hsl(var(--gold))]/50 p-6 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_8px_32px_hsl(var(--gold)/0.12)] cursor-pointer"
  >
    {/* Header */}
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full border border-[hsl(var(--gold))]/30 bg-[hsl(var(--gold))]/5 flex items-center justify-center">
          <Users size={18} className="text-[hsl(var(--gold))]" strokeWidth={1.2} />
        </div>
        <div>
          <h4 className="font-display text-base text-foreground">{candidate.name}</h4>
          <p className="font-body text-xs text-[hsl(var(--gold))]/80">{candidate.role} — {candidate.experience}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-2.5 py-1 border border-[hsl(var(--gold))]/20 rounded">
        <Star size={10} className="text-[hsl(var(--gold))]" fill="hsl(var(--gold))" />
        <span className="font-body text-xs text-[hsl(var(--gold))]">{candidate.score}</span>
      </div>
    </div>

    {/* Key Metrics */}
    <div className="grid grid-cols-4 gap-2 mb-4">
      {[
        { label: "Experience", value: candidate.experience },
        { label: "Privacy", value: candidate.privacy },
        { label: "Background", value: candidate.bgCheck },
        { label: "Availability", value: candidate.availability },
      ].map((m) => (
        <div key={m.label} className="text-center px-2 py-2 bg-secondary/30 border border-border/50 rounded">
          <p className="font-body text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">{m.label}</p>
          <p className="font-body text-[11px] text-foreground">{m.value}</p>
        </div>
      ))}
    </div>

    {/* Skills */}
    <div className="mb-4">
      <p className="font-body text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Specializations</p>
      <div className="flex flex-wrap gap-1.5">
        {candidate.skills.map((s) => (
          <span key={s} className="px-2 py-1 bg-[hsl(var(--gold))]/5 border border-[hsl(var(--gold))]/15 font-body text-[10px] text-[hsl(var(--gold))]/80 rounded">{s}</span>
        ))}
      </div>
    </div>

    {/* Notes */}
    <div className="mb-5 space-y-1.5">
      {candidate.notes.map((n) => (
        <p key={n} className="font-body text-[11px] text-muted-foreground italic">"{n}"</p>
      ))}
    </div>

    {/* CTAs */}
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
  const insights = marketInsights[category] || marketInsights.estate;
  const salaryPercent = ((insights.salary.aiTarget - insights.salary.min) / (insights.salary.max - insights.salary.min)) * 100;

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
        <h3 className="font-display text-sm mb-3 text-foreground">Candidate Performance</h3>
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
        <h3 className="font-display text-sm mb-3 text-foreground">Risk & Compliance</h3>
        <div className="space-y-2">
          {insights.compliance.map((c, i) => (
            <p key={i} className="font-body text-[11px] text-muted-foreground flex items-start gap-2">
              <CheckCircle size={8} className="text-emerald-400 mt-1 shrink-0" />
              {c}
            </p>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          {["NDA Required", "DBS Cleared", "GDPR Compliant"].map((badge) => (
            <span key={badge} className="px-2 py-1 bg-[hsl(var(--gold))]/5 border border-[hsl(var(--gold))]/15 font-body text-[9px] text-[hsl(var(--gold))]/70 rounded">{badge}</span>
          ))}
        </div>
      </div>

      <div className="glass-card border border-[hsl(var(--gold))]/20 p-5">
        <h3 className="font-display text-sm mb-3 text-foreground">Salary Intelligence</h3>
        <div className="space-y-3">
          <div className="flex justify-between font-body text-[10px] text-muted-foreground">
            <span>{insights.salary.currency}{insights.salary.min}k</span>
            <span>{insights.salary.currency}{insights.salary.max}k</span>
          </div>
          <div className="relative h-2 bg-secondary/50 rounded-full overflow-hidden">
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-[hsl(var(--gold))]/40 to-[hsl(var(--gold))] rounded-full" style={{ width: `${salaryPercent}%` }} />
            <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[hsl(var(--gold))] border-2 border-background shadow-[0_0_8px_hsl(var(--gold)/0.5)]" style={{ left: `${salaryPercent}%`, marginLeft: "-6px" }} />
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle size={10} className="text-[hsl(var(--gold))]" />
            <span className="font-body text-[10px] text-[hsl(var(--gold))]">AI-recommended: {insights.salary.currency}{insights.salary.aiTarget}k p.a.</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const StaffingModule = () => {
  const [activeCategory, setActiveCategory] = useState("estate");
  const candidates = candidateData[activeCategory] || [];
  const { deals, sourcingResults, vendorOutreach, loading: liveLoading } = useModuleData("staffing");

  return (
    <div className="space-y-6">
      <ModuleLiveDeals deals={deals} sourcingResults={sourcingResults} vendorOutreach={vendorOutreach} loading={liveLoading} categoryLabel="Staffing" />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-[hsl(var(--gold))]" strokeWidth={1.5} />
            <p className="font-body text-[10px] tracking-[0.3em] uppercase text-[hsl(var(--gold))]/70">Module 3</p>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl text-foreground">Staffing Intelligence</h2>
          <p className="font-body text-xs text-[hsl(var(--gold))]/60 mt-1">Your private staffing ecosystem — curated, vetted, and orchestrated.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 border border-border hover:border-[hsl(var(--gold))]/30 transition-colors"><Search size={14} className="text-muted-foreground" /></button>
          <button className="p-2 border border-border hover:border-[hsl(var(--gold))]/30 transition-colors"><SlidersHorizontal size={14} className="text-muted-foreground" /></button>
          <button className="p-2 border border-border hover:border-[hsl(var(--gold))]/30 transition-colors"><Bookmark size={14} className="text-muted-foreground" /></button>
          <button className="p-2 border border-border hover:border-[hsl(var(--gold))]/30 transition-colors"><GitCompare size={14} className="text-muted-foreground" /></button>
        </div>
      </div>

      {/* Three-Zone Grid */}
      <div className="flex flex-col xl:flex-row gap-5">
        {/* Left — Categories */}
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

        {/* Center — Candidates */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={activeCategory} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="grid md:grid-cols-2 gap-4">
              {candidates.map((c, i) => (
                <CandidateCard key={c.name} candidate={c} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right — Insights */}
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

export default StaffingModule;
