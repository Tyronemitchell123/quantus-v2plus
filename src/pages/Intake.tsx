import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Send, Plane, Heart, Users, Globe, Truck, Handshake,
  Clock, DollarSign, MapPin, AlertTriangle, CheckCircle2,
  Loader2, Sparkles, ChevronDown, Paperclip, Save,
  Shield, Zap, MessageSquare,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useDocumentHead from "@/hooks/use-document-head";
import { sendDealPhaseEmail } from "@/lib/deal-phase-emails";
import DealPhaseLayout from "@/components/deal/DealPhaseLayout";
import IntakeInputCard from "@/components/intake/IntakeInputCard";
import IntakeAIPanel from "@/components/intake/IntakeAIPanel";
import IntakeResultCard from "@/components/intake/IntakeResultCard";

type Deal = {
  id: string;
  deal_number: string;
  raw_input: string;
  category: string;
  sub_category: string;
  intent: string;
  budget_min: number | null;
  budget_max: number | null;
  budget_currency: string;
  timeline_days: number | null;
  location: string | null;
  constraints: string[];
  preferences: string[];
  requirements: Record<string, string[]>;
  priority_score: number;
  deal_value_estimate: number | null;
  complexity_score: number;
  urgency_score: number;
  probability_score: number;
  status: string;
  routed_engine: string;
  ai_confirmation: string;
  created_at: string;
};

export default function Intake() {
  useDocumentHead({
    title: "Deal Intake — Quantus A.I",
    description: "Submit a request and let Quantus A.I classify, score, and route it automatically.",
  });

  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [currentDeal, setCurrentDeal] = useState<Deal | null>(null);
  const [recentDeals, setRecentDeals] = useState<Deal[]>([]);

  useEffect(() => {
    fetchRecentDeals();
  }, []);

  async function fetchRecentDeals() {
    const { data } = await supabase
      .from("deals")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);
    if (data) setRecentDeals(data as unknown as Deal[]);
  }

  async function submit() {
    if (!message.trim() || loading) return;
    setLoading(true);
    setCurrentDeal(null);

    try {
      const { data, error } = await supabase.functions.invoke("intake-classify", {
        body: { message: message.trim(), channel: "web", category: category || undefined },
      });

      if (error) throw new Error(error.message || "Classification failed");
      if (data?.error) throw new Error(data.error);

      setCurrentDeal(data.deal as Deal);
      setMessage("");
      setCategory("");
      fetchRecentDeals();
      toast.success("Deal classified and routed");
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DealPhaseLayout
      currentPhase={1}
      phaseTitle="Intake & Definition"
      showBottomBar={false}
    >
      <div className="flex-1 min-h-0">
        <div className="container mx-auto px-4 md:px-6 max-w-6xl py-8 md:py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="font-display text-3xl md:text-[42px] font-medium text-foreground mb-3 leading-tight">
              Let's begin your <span className="text-gold-gradient italic">request.</span>
            </h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="w-20 h-px bg-primary/40 mx-auto mb-3"
            />
            <p className="font-body text-sm text-gold-soft/70 max-w-lg mx-auto">
              Quantus A.I will orchestrate the entire operation from here.
            </p>
          </motion.div>

          {/* Loading State */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16"
              >
                <div className="inline-flex items-center gap-3 px-6 py-3 glass-card rounded-xl">
                  <Loader2 size={16} className="animate-spin text-primary" />
                  <span className="font-body text-sm text-muted-foreground">
                    Quantus A.I is analyzing your request...
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Deal Result */}
          <AnimatePresence mode="wait">
            {currentDeal && !loading && (
              <IntakeResultCard deal={currentDeal} />
            )}
          </AnimatePresence>

          {/* Two-column cinematic split */}
          {!currentDeal && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="grid lg:grid-cols-[1.3fr_1fr] gap-6 items-start"
            >
              {/* Left — Request Definition */}
              <IntakeInputCard
                message={message}
                setMessage={setMessage}
                category={category}
                setCategory={setCategory}
                loading={loading}
                onSubmit={submit}
              />

              {/* Right — AI Anticipation Panel */}
              <IntakeAIPanel message={message} category={category} />
            </motion.div>
          )}

          {/* Recent Deals */}
          {recentDeals.length > 0 && !loading && !currentDeal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-12"
            >
              <p className="font-body text-[10px] tracking-[0.3em] uppercase text-muted-foreground/50 mb-4">Recent Requests</p>
              <div className="space-y-2">
                {recentDeals.map((deal) => {
                  const icons: Record<string, typeof Plane> = {
                    aviation: Plane, medical: Heart, staffing: Users,
                    lifestyle: Globe, logistics: Truck, partnerships: Handshake,
                  };
                  const Icon = icons[deal.category] || Sparkles;
                  return (
                    <button
                      key={deal.id}
                      onClick={() => setCurrentDeal(deal)}
                      className="w-full text-left flex items-center gap-4 p-4 glass-card rounded-lg transition-all hover:border-primary/30 group"
                    >
                      <Icon size={14} className="text-primary/60" />
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm text-foreground truncate">{deal.intent || deal.raw_input.substring(0, 60)}</p>
                        <p className="font-body text-[10px] text-muted-foreground capitalize">{deal.category} · {deal.sub_category}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono text-xs text-primary">{deal.priority_score}</div>
                        <p className="font-body text-[9px] text-muted-foreground">{deal.deal_number}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </DealPhaseLayout>
  );
}
