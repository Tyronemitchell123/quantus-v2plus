import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Sparkles, Brain, Zap, TrendingUp, Shield, Clock, Target,
  ChevronRight, Lightbulb, BarChart3, FileText, Users,
  Plane, Heart, Palmtree, Truck, Handshake, Eye, Play,
  AlertTriangle, CheckCircle2, ArrowRight, Layers,
} from "lucide-react";
import ParticleGrid from "@/components/ParticleGrid";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import MobileBottomNav from "@/components/mobile/MobileBottomNav";

/* ── Types ── */
interface Recommendation {
  id: string;
  type: "proactive" | "playbook" | "risk" | "opportunity";
  module: string;
  moduleIcon: any;
  title: string;
  description: string;
  confidence: number;
  urgency: "low" | "medium" | "high" | "critical";
  impact: string;
  action: string;
  actionTo: string;
  reasoning: string[];
  timeframe?: string;
}

interface Playbook {
  id: string;
  title: string;
  module: string;
  steps: string[];
  estimatedTime: string;
  successRate: number;
  basedOn: number;
}

/* ── Data ── */
const recommendations: Recommendation[] = [
  {
    id: "r1",
    type: "proactive",
    module: "Aviation",
    moduleIcon: Plane,
    title: "Pre-position G700 for December window",
    description: "Based on your travel patterns, a Gulfstream G700 should be pre-positioned in London Luton by Dec 12 to avoid peak charter pricing.",
    confidence: 94,
    urgency: "high",
    impact: "Save £48,000 on charter costs",
    action: "Create Deal",
    actionTo: "/intake",
    reasoning: [
      "3 December flights in past 2 years",
      "G700 availability drops 60% after Dec 10",
      "Preferred operator has 2 units available now",
    ],
    timeframe: "Act within 5 days",
  },
  {
    id: "r2",
    type: "opportunity",
    module: "Medical",
    moduleIcon: Heart,
    title: "Longevity protocol timing optimal",
    description: "Dr. Nazari at Lanserhof has an opening in January — aligned with your annual screening cadence.",
    confidence: 88,
    urgency: "medium",
    impact: "Next available slot: March if missed",
    action: "Schedule",
    actionTo: "/intake",
    reasoning: [
      "Last screening: 11 months ago",
      "Preferred physician available Jan 8–15",
      "Wellness retreat pairs with Lech travel plan",
    ],
    timeframe: "2 weeks to confirm",
  },
  {
    id: "r3",
    type: "risk",
    module: "Staffing",
    moduleIcon: Users,
    title: "Estate manager contract expires in 30 days",
    description: "Current estate manager's contract renewal window opens in 12 days. Recommend initiating renewal or sourcing alternatives now.",
    confidence: 100,
    urgency: "critical",
    impact: "Avoid operational gap",
    action: "Review",
    actionTo: "/intake",
    reasoning: [
      "Contract end: Feb 28, 2026",
      "No renewal discussion initiated",
      "3 qualified alternatives on standby",
    ],
    timeframe: "Immediate",
  },
  {
    id: "r4",
    type: "playbook",
    module: "Lifestyle",
    moduleIcon: Palmtree,
    title: "Summer villa procurement playbook ready",
    description: "Based on past preferences, a curated playbook for Côte d'Azur villa procurement has been generated — 7 steps to secure by April.",
    confidence: 91,
    urgency: "low",
    impact: "Optimal booking window closes April 15",
    action: "View Playbook",
    actionTo: "/intake",
    reasoning: [
      "2 previous summer villa requests",
      "Preferred regions: Cap Ferrat, Saint-Tropez",
      "Budget aligned with premium tier options",
    ],
    timeframe: "6 weeks optimal",
  },
  {
    id: "r5",
    type: "proactive",
    module: "Logistics",
    moduleIcon: Truck,
    title: "Classic car transport window available",
    description: "Enclosed transport from Monaco to London available next week at preferred rate. Your Ferrari 250 GTO maintenance is due.",
    confidence: 82,
    urgency: "medium",
    impact: "£2,400 savings vs. standard booking",
    action: "Book Transport",
    actionTo: "/intake",
    reasoning: [
      "Maintenance schedule: overdue by 2 weeks",
      "Preferred transporter has London-bound route",
      "Combined with existing logistics movement",
    ],
  },
  {
    id: "r6",
    type: "opportunity",
    module: "Partnerships",
    moduleIcon: Handshake,
    title: "New verified vendor: Aman Residences",
    description: "Aman Residences has joined the Quantus partner network with Obsidian-tier privacy clearance. Matches your hospitality preferences.",
    confidence: 95,
    urgency: "low",
    impact: "Expanded access to ultra-private properties",
    action: "View Vendor",
    actionTo: "/dashboard/modules",
    reasoning: [
      "NDA signed and verified",
      "Obsidian privacy tier confirmed",
      "Portfolio overlaps with 4 past requests",
    ],
  },
];

const playbooks: Playbook[] = [
  {
    id: "p1",
    title: "UHNW Villa Acquisition",
    module: "Lifestyle",
    steps: ["Define preferences", "Source options (3–5)", "Site inspection", "Negotiation", "Legal review", "Contract execution", "Handover"],
    estimatedTime: "4–8 weeks",
    successRate: 94,
    basedOn: 47,
  },
  {
    id: "p2",
    title: "Private Charter Optimization",
    module: "Aviation",
    steps: ["Route analysis", "Operator matching", "Cost optimization", "Safety audit", "Booking confirmation", "Pre-flight coordination"],
    estimatedTime: "48–72 hours",
    successRate: 98,
    basedOn: 132,
  },
  {
    id: "p3",
    title: "Executive Health Protocol",
    module: "Medical",
    steps: ["Physician matching", "Availability check", "Pre-screening questionnaire", "Schedule confirmation", "Travel coordination", "Post-visit follow-up"],
    estimatedTime: "1–2 weeks",
    successRate: 96,
    basedOn: 89,
  },
];

const urgencyColor: Record<string, string> = {
  low: "text-muted-foreground border-border",
  medium: "text-primary border-primary/20",
  high: "text-primary border-primary/30",
  critical: "text-destructive border-destructive/30",
};

const typeIcon: Record<string, any> = {
  proactive: Lightbulb,
  playbook: FileText,
  risk: AlertTriangle,
  opportunity: TrendingUp,
};

const typeLabel: Record<string, string> = {
  proactive: "Proactive",
  playbook: "Playbook",
  risk: "Risk Alert",
  opportunity: "Opportunity",
};

/* ── Page ── */
const RecommendationEngine = () => {
  const [filter, setFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"recommendations" | "playbooks">("recommendations");

  const filtered = filter === "all" ? recommendations : recommendations.filter((r) => r.type === filter);

  const filters = [
    { id: "all", label: "All Insights" },
    { id: "proactive", label: "Proactive" },
    { id: "risk", label: "Risk Alerts" },
    { id: "opportunity", label: "Opportunities" },
    { id: "playbook", label: "Playbooks" },
  ];

  return (
    <div className="min-h-screen bg-background flex relative">
      {/* Atmospheric */}
      <div className="fixed inset-0 pointer-events-none opacity-15 z-0">
        <ParticleGrid />
      </div>
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        background: "radial-gradient(ellipse at 30% 20%, hsl(var(--gold) / 0.03) 0%, transparent 60%), radial-gradient(ellipse at center, transparent 60%, hsl(var(--background)) 100%)",
      }} />

      <DashboardSidebar />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <DashboardTopBar onMobileMenuToggle={() => {}} notifications={[]} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 border border-primary/20 flex items-center justify-center">
                <Brain size={16} className="text-primary" />
              </div>
              <h1 className="font-display text-2xl md:text-3xl text-foreground">
                Recommendation Engine
              </h1>
            </div>
            <p className="font-body text-sm text-muted-foreground max-w-xl">
              Anticipatory intelligence across all modules — surfacing insights before you need them.
            </p>
            <motion.div
              className="w-16 h-px bg-gradient-to-r from-primary to-transparent mt-4"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{ transformOrigin: "left" }}
            />
          </motion.div>

          {/* Intelligence Summary Strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8"
          >
            {[
              { icon: Sparkles, label: "Active Insights", value: "6", sub: "across 5 modules" },
              { icon: AlertTriangle, label: "Risk Alerts", value: "1", sub: "critical" },
              { icon: TrendingUp, label: "Opportunities", value: "2", sub: "time-sensitive" },
              { icon: Target, label: "Confidence Avg", value: "92%", sub: "high accuracy" },
            ].map((stat, i) => (
              <div key={stat.label} className="border border-border bg-card/50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <stat.icon size={12} className="text-primary/70" />
                  <span className="font-body text-[9px] tracking-[0.15em] uppercase text-muted-foreground">
                    {stat.label}
                  </span>
                </div>
                <p className="font-display text-xl text-foreground">{stat.value}</p>
                <p className="font-body text-[10px] text-muted-foreground mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </motion.div>

          {/* View Toggle */}
          <div className="flex items-center gap-4 mb-6">
            {(["recommendations", "playbooks"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setActiveView(v)}
                className={`font-body text-[11px] tracking-[0.15em] uppercase pb-2 transition-all border-b-2 ${
                  activeView === v
                    ? "text-foreground border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                {v === "recommendations" ? "Live Insights" : "Generated Playbooks"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeView === "recommendations" ? (
              <motion.div
                key="recs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-hide">
                  {filters.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFilter(f.id)}
                      className={`px-3 py-1.5 shrink-0 font-body text-[10px] tracking-[0.12em] uppercase transition-all border ${
                        filter === f.id
                          ? "border-primary/30 text-primary bg-primary/[0.06]"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Recommendation Cards */}
                <div className="space-y-4">
                  {filtered.map((rec, i) => {
                    const TypeIcon = typeIcon[rec.type];
                    const expanded = expandedId === rec.id;

                    return (
                      <motion.div
                        key={rec.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="border border-border bg-card/50 overflow-hidden"
                      >
                        {/* Card header */}
                        <button
                          onClick={() => setExpandedId(expanded ? null : rec.id)}
                          className="w-full text-left p-4 md:p-5"
                        >
                          <div className="flex items-start gap-3">
                            {/* Module icon */}
                            <div className="w-9 h-9 border border-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                              <rec.moduleIcon size={15} className="text-primary/70" />
                            </div>

                            <div className="flex-1 min-w-0">
                              {/* Meta row */}
                              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <span className={`px-2 py-0.5 text-[7px] tracking-wider uppercase border ${urgencyColor[rec.urgency]}`}>
                                  {rec.urgency}
                                </span>
                                <span className="flex items-center gap-1 text-[8px] tracking-wider uppercase text-muted-foreground">
                                  <TypeIcon size={8} />
                                  {typeLabel[rec.type]}
                                </span>
                                <span className="text-[8px] text-muted-foreground/50">•</span>
                                <span className="text-[8px] text-muted-foreground">{rec.module}</span>
                              </div>

                              {/* Title */}
                              <h3 className="font-display text-sm md:text-base text-foreground mb-1">
                                {rec.title}
                              </h3>
                              <p className="font-body text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                                {rec.description}
                              </p>

                              {/* Impact + Confidence */}
                              <div className="flex items-center gap-4 mt-3">
                                <div className="flex items-center gap-1.5">
                                  <Zap size={9} className="text-primary/70" />
                                  <span className="font-body text-[10px] text-primary/80">{rec.impact}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Target size={9} className="text-muted-foreground/50" />
                                  <span className="font-body text-[10px] text-muted-foreground">{rec.confidence}% confidence</span>
                                </div>
                              </div>
                            </div>

                            {/* Expand indicator */}
                            <motion.div
                              animate={{ rotate: expanded ? 90 : 0 }}
                              className="shrink-0 mt-2"
                            >
                              <ChevronRight size={14} className="text-muted-foreground/30" />
                            </motion.div>
                          </div>
                        </button>

                        {/* Expanded reasoning */}
                        <AnimatePresence>
                          {expanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 md:px-5 pb-4 md:pb-5 border-t border-border/50 pt-4">
                                {/* Reasoning */}
                                <p className="font-body text-[9px] tracking-[0.15em] uppercase text-muted-foreground mb-2">
                                  Reasoning
                                </p>
                                <ul className="space-y-1.5 mb-4">
                                  {rec.reasoning.map((r, ri) => (
                                    <li key={ri} className="flex items-start gap-2">
                                      <CheckCircle2 size={10} className="text-primary/50 mt-0.5 shrink-0" />
                                      <span className="font-body text-[11px] text-foreground/70">{r}</span>
                                    </li>
                                  ))}
                                </ul>

                                {rec.timeframe && (
                                  <div className="flex items-center gap-1.5 mb-4">
                                    <Clock size={10} className="text-primary/50" />
                                    <span className="font-body text-[10px] text-primary/70">{rec.timeframe}</span>
                                  </div>
                                )}

                                {/* Confidence bar */}
                                <div className="mb-4">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-body text-[9px] text-muted-foreground">Confidence</span>
                                    <span className="font-body text-[9px] text-primary">{rec.confidence}%</span>
                                  </div>
                                  <div className="h-1 bg-secondary rounded-full overflow-hidden">
                                    <motion.div
                                      className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${rec.confidence}%` }}
                                      transition={{ duration: 0.8 }}
                                    />
                                  </div>
                                </div>

                                {/* Action CTA */}
                                <Link
                                  to={rec.actionTo}
                                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-body text-[10px] tracking-[0.15em] uppercase transition-all hover:bg-primary/90"
                                >
                                  {rec.action}
                                  <ArrowRight size={12} />
                                </Link>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              /* ── Playbooks View ── */
              <motion.div
                key="playbooks"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {playbooks.map((pb, i) => (
                  <motion.div
                    key={pb.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="border border-border bg-card/50 p-4 md:p-5"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="font-body text-[8px] tracking-[0.15em] uppercase text-primary/60 mb-1 block">
                          {pb.module} Playbook
                        </span>
                        <h3 className="font-display text-base text-foreground">{pb.title}</h3>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-lg text-primary">{pb.successRate}%</p>
                        <p className="font-body text-[8px] text-muted-foreground">success rate</p>
                      </div>
                    </div>

                    {/* Steps timeline */}
                    <div className="space-y-0 mb-4">
                      {pb.steps.map((step, si) => (
                        <div key={si} className="flex items-start gap-3">
                          <div className="flex flex-col items-center">
                            <div className="w-5 h-5 border border-primary/20 flex items-center justify-center shrink-0">
                              <span className="font-body text-[8px] text-primary/60">{si + 1}</span>
                            </div>
                            {si < pb.steps.length - 1 && (
                              <div className="w-px h-4 bg-border" />
                            )}
                          </div>
                          <p className="font-body text-[11px] text-foreground/70 pt-0.5">{step}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <Clock size={10} className="text-muted-foreground/50" />
                          <span className="font-body text-[10px] text-muted-foreground">{pb.estimatedTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Layers size={10} className="text-muted-foreground/50" />
                          <span className="font-body text-[10px] text-muted-foreground">Based on {pb.basedOn} deals</span>
                        </div>
                      </div>
                      <Link
                        to="/intake"
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-primary/20 text-primary font-body text-[9px] tracking-wider uppercase hover:bg-primary/5 transition-all"
                      >
                        <Play size={8} />
                        Execute
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <MobileBottomNav onAIOpen={() => {}} />
    </div>
  );
};

export default RecommendationEngine;
