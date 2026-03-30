import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane, Heart, Users, Globe, Truck, Handshake, Sparkles, Loader2,
  ArrowRight, Plus, Search, CheckCircle2, AlertTriangle,
  FileText, MessageSquare, Bot, Eye, Filter,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import useDocumentHead from "@/hooks/use-document-head";
import DealCard from "@/components/deal/DealCard";
import DealPhaseTimeline from "@/components/deal/DealPhaseTimeline";
import DealChatPanel from "@/components/chat/DealChatPanel";

const categoryIcons: Record<string, typeof Plane> = {
  aviation: Plane, medical: Heart, staffing: Users,
  lifestyle: Globe, logistics: Truck, partnerships: Handshake,
};

const phaseLabels = ["Intake", "Sourcing", "Outreach", "Shortlist", "Negotiation", "Workflow", "Documents", "Completion"];
const statusToPhase: Record<string, number> = {
  classified: 1, sourcing: 2, outreach: 3, shortlisting: 4, negotiation: 5, execution: 6, documentation: 7, completed: 8,
};

type Deal = {
  id: string;
  deal_number: string;
  category: string;
  sub_category: string | null;
  intent: string | null;
  priority_score: number;
  status: string;
  created_at: string;
  updated_at: string;
};

const DealEngine = () => {
  useDocumentHead({ title: "Deal Engine — Quantus V2+", description: "The 7-phase orchestration engine." });
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    const { data } = await supabase
      .from("deals")
      .select("id, deal_number, category, sub_category, intent, priority_score, status, created_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(50);
    setDeals((data as Deal[]) || []);
    setLoading(false);
  };

  const filtered = filter === "all" ? deals : deals.filter((d) => d.category === filter);
  const categories = ["all", ...new Set(deals.map((d) => d.category))];

  // Stats
  const totalDeals = deals.length;
  const activeDeals = deals.filter(d => d.status !== "completed").length;
  const completedDeals = deals.filter(d => d.status === "completed").length;
  const highPriority = deals.filter(d => d.priority_score >= 80).length;

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopBar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
              <div>
                <p className="font-body text-[10px] tracking-[0.3em] uppercase text-primary/60 mb-2">7-Phase Orchestration</p>
                <h1 className="font-display text-2xl md:text-3xl font-medium text-foreground">Deal Engine</h1>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="w-16 h-px bg-primary/40 origin-left mt-2"
                />
              </div>
              <Link
                to="/intake"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-body text-[10px] tracking-[0.2em] uppercase hover:bg-primary/90 transition-all rounded-lg gold-glow"
              >
                <Plus size={12} /> New Request
              </Link>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {[
                { label: "Total Deals", value: totalDeals },
                { label: "Active", value: activeDeals },
                { label: "Completed", value: completedDeals },
                { label: "High Priority", value: highPriority },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card p-4 rounded-xl text-center"
                >
                  <p className="font-display text-xl font-medium text-primary mb-1">{stat.value}</p>
                  <p className="font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* 7-Phase Pipeline Overview */}
            <DealPhaseTimeline deals={deals} />

            {/* Category filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-2 font-body text-[10px] tracking-[0.15em] uppercase border rounded-lg transition-all whitespace-nowrap ${
                    filter === cat
                      ? "border-primary/40 bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/20"
                  }`}
                >
                  {cat === "all" ? "All Deals" : cat}
                </button>
              ))}
            </div>

            {/* Deals list */}
            {loading ? (
              <div className="text-center py-20">
                <Loader2 size={24} className="animate-spin text-primary mx-auto" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="glass-card p-12 text-center rounded-xl">
                <Search size={32} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="font-body text-sm text-muted-foreground mb-4">No deals found</p>
                <Link to="/intake" className="font-body text-xs text-primary hover:underline">
                  Submit your first request →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((deal, i) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    index={i}
                    categoryIcons={categoryIcons}
                    statusToPhase={statusToPhase}
                    phaseLabels={phaseLabels}
                  />
                ))}
              </div>
            )}

            {/* Quick actions */}
            <div className="mt-8 grid sm:grid-cols-4 gap-3">
              {[
                { icon: FileText, label: "View Documents", to: "/documents" },
                { icon: MessageSquare, label: "Send Message", to: "/chat" },
                { icon: Bot, label: "AI Assistant", to: "/chat" },
                { icon: Eye, label: "Active Deals", to: "/intake" },
              ].map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className="glass-card p-4 rounded-xl flex items-center gap-3 hover:border-gold-soft/30 transition-all duration-300"
                >
                  <action.icon size={14} className="text-primary/60" />
                  <span className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>

            {/* Real-time Deal Chat */}
            <DealChatPanel channel="deal-engine" className="mt-6" />
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-border/50 flex items-center justify-between">
          <p className="font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground/40">
            Quantus V2+ — The Obsidian Standard
          </p>
          <p className="font-body text-[9px] text-muted-foreground/30">v1.0.0</p>
        </footer>
      </div>
    </div>
  );
};

export default DealEngine;
