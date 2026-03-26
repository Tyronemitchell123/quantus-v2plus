import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane, Heart, Users, Globe, Truck, Handshake, Sparkles, Loader2,
  ArrowRight, Plus, Search, CheckCircle2, Clock, AlertTriangle,
  FileText, MessageSquare, Bot, Eye,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import useDocumentHead from "@/hooks/use-document-head";

const categoryIcons: Record<string, typeof Plane> = {
  aviation: Plane, medical: Heart, staffing: Users,
  lifestyle: Globe, logistics: Truck, partnerships: Handshake,
};

const phaseLabels = ["Intake", "Sourcing", "Outreach", "Negotiation", "Workflow", "Documents", "Completion"];
const statusToPhase: Record<string, number> = {
  classified: 1, sourcing: 2, outreach: 3, negotiation: 4, execution: 5, documentation: 6, completed: 7,
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
  useDocumentHead({ title: "Deal Engine — Quantus A.I", description: "The 7-phase orchestration engine." });
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const getPhaseLink = (deal: Deal) => {
    const phase = statusToPhase[deal.status] || 1;
    const paths = ["/intake", "/sourcing", "/outreach", "/negotiation", "/workflow", "/documents", "/deal-completion"];
    return `${paths[phase - 1]}?deal=${deal.id}`;
  };

  return (
    <div className="min-h-screen bg-background flex pt-16">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopBar title="Deal Engine" onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
              <div>
                <p className="font-body text-[10px] tracking-[0.3em] uppercase text-primary/60 mb-2">7-Phase Orchestration</p>
                <h1 className="font-display text-2xl md:text-3xl font-medium text-foreground">Deal Engine</h1>
              </div>
              <Link
                to="/intake"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-body text-[10px] tracking-[0.2em] uppercase hover:bg-primary/90 transition-all"
              >
                <Plus size={12} /> New Request
              </Link>
            </div>

            {/* Category filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-4 py-1.5 font-body text-[10px] tracking-[0.15em] uppercase border transition-all whitespace-nowrap ${
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
              <div className="glass-card p-12 text-center">
                <Search size={32} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="font-body text-sm text-muted-foreground mb-4">No deals found</p>
                <Link to="/intake" className="font-body text-xs text-primary hover:underline">
                  Submit your first request →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((deal, i) => {
                  const Icon = categoryIcons[deal.category] || Sparkles;
                  const phase = statusToPhase[deal.status] || 1;
                  const progress = Math.round(((phase - 1) / 6) * 100);

                  return (
                    <motion.div
                      key={deal.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link
                        to={getPhaseLink(deal)}
                        className="glass-card p-5 flex items-center gap-4 group hover:border-primary/20 transition-all duration-500 block"
                      >
                        {/* Icon */}
                        <div className="w-10 h-10 border border-border bg-muted flex items-center justify-center shrink-0">
                          <Icon size={16} className="text-primary/60" />
                        </div>

                        {/* Deal info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-body text-xs font-medium text-foreground">{deal.deal_number}</span>
                            <span className="font-body text-[10px] tracking-wider uppercase text-primary/50 capitalize">{deal.category}</span>
                            {deal.priority_score >= 80 && (
                              <span className="font-body text-[9px] tracking-wider uppercase text-destructive flex items-center gap-0.5">
                                <AlertTriangle size={8} /> High Priority
                              </span>
                            )}
                          </div>
                          <p className="font-body text-xs text-muted-foreground truncate">
                            {deal.intent || deal.sub_category || "Request pending classification"}
                          </p>
                        </div>

                        {/* Phase */}
                        <div className="shrink-0 text-right hidden sm:block">
                          <p className="font-body text-[10px] tracking-wider uppercase text-muted-foreground mb-1">
                            Phase {phase}/7 — {phaseLabels[phase - 1]}
                          </p>
                          <div className="w-24 h-1 bg-border rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                          </div>
                        </div>

                        {/* Status indicator */}
                        <div className="shrink-0">
                          {deal.status === "completed" ? (
                            <CheckCircle2 size={16} className="text-emerald-400" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          )}
                        </div>

                        <ArrowRight size={14} className="text-muted-foreground/30 group-hover:text-primary/50 transition-colors shrink-0" />
                      </Link>
                    </motion.div>
                  );
                })}
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
                  className="glass-card p-4 flex items-center gap-3 hover:border-primary/20 transition-all duration-300"
                >
                  <action.icon size={14} className="text-primary/60" />
                  <span className="font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground">
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-border flex items-center justify-between">
          <p className="font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground/40">
            Quantus A.I — The Obsidian Standard
          </p>
          <p className="font-body text-[9px] text-muted-foreground/30">v1.0.0</p>
        </footer>
      </div>
    </div>
  );
};

export default DealEngine;
