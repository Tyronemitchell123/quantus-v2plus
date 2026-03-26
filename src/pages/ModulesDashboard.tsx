import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Heart, Users, Globe, Truck, Handshake, MessageSquare, Search, Bell, BarChart3, FileText, DollarSign } from "lucide-react";
import { useDocumentHead } from "@/hooks/use-document-head";

type ModuleKey = "aviation" | "medical" | "staffing" | "travel" | "logistics" | "partnerships" | "communications";

const moduleConfig: { key: ModuleKey; icon: typeof Plane; label: string; color: string }[] = [
  { key: "aviation", icon: Plane, label: "Aviation", color: "text-primary" },
  { key: "medical", icon: Heart, label: "Medical", color: "text-primary" },
  { key: "staffing", icon: Users, label: "Staffing", color: "text-primary" },
  { key: "travel", icon: Globe, label: "Travel", color: "text-primary" },
  { key: "logistics", icon: Truck, label: "Logistics", color: "text-primary" },
  { key: "partnerships", icon: Handshake, label: "Partners", color: "text-primary" },
  { key: "communications", icon: MessageSquare, label: "Comms", color: "text-primary" },
];

const moduleContent: Record<ModuleKey, { title: string; subtitle: string; cards: { icon: typeof Search; title: string; desc: string }[] }> = {
  aviation: {
    title: "Aviation Intelligence",
    subtitle: "Aircraft sourcing, valuation, and deal orchestration.",
    cards: [
      { icon: Search, title: "Aircraft Search", desc: "On-market and off-market sourcing across global inventories." },
      { icon: BarChart3, title: "Jet Valuation", desc: "AI-driven market analysis and fair-value estimation." },
      { icon: FileText, title: "Deal Pipeline", desc: "Buyer-seller matching with automated negotiation templates." },
      { icon: DollarSign, title: "Commission Tracking", desc: "Real-time commission calculation: $50K–$500K per deal." },
    ],
  },
  medical: {
    title: "Medical Travel & Wellness",
    subtitle: "Clinic matching, itinerary building, and longevity programs.",
    cards: [
      { icon: Search, title: "Clinic Matching", desc: "AI-matched specialists based on condition, location, and tier." },
      { icon: FileText, title: "Itinerary Builder", desc: "End-to-end travel plans with pre-screening and logistics." },
      { icon: Heart, title: "Longevity Programs", desc: "Personalized wellness and optimization protocols." },
      { icon: Bell, title: "Post-Care Follow-Up", desc: "Automated check-ins and progress tracking workflows." },
    ],
  },
  staffing: {
    title: "Household & Staffing",
    subtitle: "Role definition, matchmaking, and estate operations.",
    cards: [
      { icon: Users, title: "Staffing Matchmaker", desc: "AI-powered matching across vetted household professionals." },
      { icon: FileText, title: "Role Definition", desc: "Structured role briefs with competency frameworks." },
      { icon: BarChart3, title: "Performance Analytics", desc: "Staff KPIs, reviews, and retention intelligence." },
      { icon: DollarSign, title: "Placement Fees", desc: "Automated fee calculation: 15–25% of annual salary." },
    ],
  },
  travel: {
    title: "Luxury Travel & Lifestyle",
    subtitle: "Ultra-luxury itineraries, hotel matching, and cultural curation.",
    cards: [
      { icon: Globe, title: "Itinerary Generator", desc: "Bespoke travel plans across villa, yacht, and hotel tiers." },
      { icon: Search, title: "Property Matching", desc: "AI-driven matching to hotels, villas, and superyacht charters." },
      { icon: FileText, title: "Visa & Compliance", desc: "Automated documentation and country-specific requirements." },
      { icon: DollarSign, title: "Commission Automation", desc: "10–20% commission tracking on all bookings." },
    ],
  },
  logistics: {
    title: "Operational Logistics",
    subtitle: "Dispatch automation, fleet analytics, and compliance.",
    cards: [
      { icon: Truck, title: "Dispatch Automation", desc: "Intelligent routing and real-time assignment optimization." },
      { icon: Bell, title: "Incident Triage", desc: "Automated classification, escalation, and resolution workflows." },
      { icon: BarChart3, title: "Fleet Analytics", desc: "Vehicle utilization, cost-per-mile, and maintenance forecasting." },
      { icon: FileText, title: "Compliance Docs", desc: "Auto-generated regulatory and operational documentation." },
    ],
  },
  partnerships: {
    title: "Partnership Intelligence",
    subtitle: "Partner scoring, revenue modeling, and ecosystem mapping.",
    cards: [
      { icon: Handshake, title: "Partner Scoring", desc: "Multi-criteria evaluation of potential partners and vendors." },
      { icon: DollarSign, title: "Revenue-Share Models", desc: "Scenario-based revenue projections and deal structures." },
      { icon: FileText, title: "Pilot Programs", desc: "Structured pilot program design and performance metrics." },
      { icon: BarChart3, title: "Ecosystem Mapping", desc: "Visual relationship mapping and opportunity identification." },
    ],
  },
  communications: {
    title: "Communication Engine",
    subtitle: "Cinematic messaging, onboarding, and narrative content.",
    cards: [
      { icon: MessageSquare, title: "Luxury Messaging", desc: "WhatsApp-style cinematic client communications." },
      { icon: FileText, title: "Client Updates", desc: "Narrative-driven status reports and intelligence briefs." },
      { icon: Bell, title: "Onboarding Sequences", desc: "High-touch automated welcome and activation flows." },
      { icon: BarChart3, title: "Follow-Up Automation", desc: "Scheduled touchpoints and relationship nurture workflows." },
    ],
  },
};

const ModulesDashboard = () => {
  useDocumentHead({ title: "Dashboard — Quantus A.I", description: "Multi-module intelligence dashboard." });
  const [activeModule, setActiveModule] = useState<ModuleKey>("aviation");
  const content = moduleContent[activeModule];

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <p className="font-body text-xs tracking-[0.35em] uppercase text-primary/70 mb-2">Intelligence Dashboard</p>
          <h1 className="font-display text-2xl sm:text-3xl font-medium">Quantus Core</h1>
        </div>

        {/* Module sidebar + content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-56 shrink-0">
            <div className="glass-card p-2 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
              {moduleConfig.map((mod) => {
                const active = activeModule === mod.key;
                return (
                  <button key={mod.key} onClick={() => setActiveModule(mod.key)}
                    className={`flex items-center gap-3 px-4 py-3 text-left font-body text-sm transition-all duration-300 whitespace-nowrap shrink-0 ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"}`}>
                    <mod.icon size={16} strokeWidth={1.5} />
                    <span className="hidden lg:inline">{mod.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div key={activeModule} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                <div className="mb-8">
                  <h2 className="font-display text-xl sm:text-2xl font-medium mb-2">{content.title}</h2>
                  <p className="font-body text-sm text-muted-foreground">{content.subtitle}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  {content.cards.map((card, i) => (
                    <motion.div key={card.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.4 }}
                      className="glass-card p-6 group hover:border-primary/20 transition-all duration-500 cursor-pointer">
                      <card.icon className="w-5 h-5 text-primary mb-4" strokeWidth={1.5} />
                      <h3 className="font-display text-base font-medium mb-2">{card.title}</h3>
                      <p className="font-body text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Quick stats placeholder */}
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {["Active Requests", "Pipeline Value", "This Month", "Conversion"].map((label, i) => (
                    <div key={label} className="glass-card p-5 text-center">
                      <p className="font-display text-2xl font-medium text-primary mb-1">
                        {["12", "£2.4M", "8", "67%"][i]}
                      </p>
                      <p className="font-body text-xs text-muted-foreground tracking-wider uppercase">{label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModulesDashboard;
