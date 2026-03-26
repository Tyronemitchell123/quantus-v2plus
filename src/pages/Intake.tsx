import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Send, Plane, Heart, Users, Globe, Truck, Handshake, Clock, DollarSign, MapPin, AlertTriangle, CheckCircle2, Loader2, Sparkles, ArrowRight, ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useDocumentHead from "@/hooks/use-document-head";

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

const categoryIcons: Record<string, typeof Plane> = {
  aviation: Plane,
  medical: Heart,
  staffing: Users,
  lifestyle: Globe,
  logistics: Truck,
  partnerships: Handshake,
};

const categoryColors: Record<string, string> = {
  aviation: "text-blue-400",
  medical: "text-emerald-400",
  staffing: "text-amber-400",
  lifestyle: "text-purple-400",
  logistics: "text-orange-400",
  partnerships: "text-cyan-400",
};

const exampleRequests = [
  "Looking for a Gulfstream G450 under 18M, low hours, pedigree only, need options this week.",
  "Executive health screening for 4 people in Zurich or London, next month. Budget flexible.",
  "Need a private chef and estate manager for our Cotswolds property. Start ASAP.",
  "Planning a 2-week Mediterranean yacht charter, August, 8 guests, budget around 200K EUR.",
  "Vehicle recovery needed from Monaco to London warehouse, high-value classic car.",
  "Looking for strategic partnership opportunities with luxury concierge brands in the Middle East.",
];

function ScoreBar({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Clock }) {
  const color = value >= 80 ? "bg-red-500" : value >= 60 ? "bg-primary" : value >= 40 ? "bg-yellow-500" : "bg-muted-foreground";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="font-body text-xs text-muted-foreground flex items-center gap-1.5">
          <Icon size={12} /> {label}
        </span>
        <span className="font-body text-xs font-medium text-foreground">{value}</span>
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function formatCurrency(value: number | null, currency = "USD") {
  if (!value) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Intake() {
  useDocumentHead({
    title: "Deal Intake — Quantus A.I",
    description: "Submit a request and let Quantus A.I classify, score, and route it automatically.",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentDeal, setCurrentDeal] = useState<Deal | null>(null);
  const [recentDeals, setRecentDeals] = useState<Deal[]>([]);
  const [showExamples, setShowExamples] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchRecentDeals();
  }, []);

  async function fetchRecentDeals() {
    const { data } = await supabase
      .from("deals")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setRecentDeals(data as unknown as Deal[]);
  }

  async function submit() {
    if (!message.trim() || loading) return;
    setLoading(true);
    setCurrentDeal(null);

    try {
      const { data, error } = await supabase.functions.invoke("intake-classify", {
        body: { message: message.trim(), channel: "web" },
      });

      if (error) throw new Error(error.message || "Classification failed");
      if (data?.error) throw new Error(data.error);

      setCurrentDeal(data.deal as Deal);
      setMessage("");
      fetchRecentDeals();
      toast.success("Deal classified and routed");
    } catch (e: any) {
      toast.error(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const CatIcon = currentDeal ? categoryIcons[currentDeal.category] || Sparkles : Sparkles;

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <p className="font-body text-xs tracking-[0.4em] uppercase text-primary/60 mb-3">Phase 1 — Intake Engine</p>
          <h1 className="font-display text-4xl md:text-5xl font-medium text-foreground mb-4">
            What Do You <span className="text-gold-gradient italic">Need?</span>
          </h1>
          <p className="text-muted-foreground font-body text-sm max-w-xl mx-auto">
            Describe your request in natural language. Quantus A.I will classify, score, and route it to the right engine — instantly.
          </p>
        </motion.div>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative mb-8"
        >
          <div className="border border-border bg-card rounded-sm p-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
              }}
              placeholder="Describe your request... e.g. 'Looking for a Gulfstream G450 under 18M, low hours, pedigree only'"
              className="w-full bg-transparent text-foreground font-body text-sm p-4 resize-none h-28 focus:outline-none placeholder:text-muted-foreground/40"
              disabled={loading}
            />
            <div className="flex items-center justify-between px-3 pb-3">
              <button
                onClick={() => setShowExamples(!showExamples)}
                className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <Sparkles size={12} /> Examples <ChevronDown size={12} className={`transition-transform ${showExamples ? "rotate-180" : ""}`} />
              </button>
              <button
                onClick={submit}
                disabled={loading || !message.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-body text-xs tracking-widest uppercase hover:bg-primary/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {loading ? "Classifying..." : "Submit Request"}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showExamples && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 grid sm:grid-cols-2 gap-2"
              >
                {exampleRequests.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => { setMessage(ex); setShowExamples(false); textareaRef.current?.focus(); }}
                    className="text-left p-3 border border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card transition-all font-body text-xs text-muted-foreground hover:text-foreground rounded-sm"
                  >
                    {ex}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
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
              <div className="inline-flex items-center gap-3 px-6 py-3 border border-primary/20 bg-card">
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
            <motion.div
              key={currentDeal.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* AI Confirmation */}
              <div className="border border-primary/20 bg-card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-body text-xs tracking-[0.2em] uppercase text-primary/60 mb-2">Quantus A.I Response</p>
                    <p className="font-body text-sm text-foreground/90 leading-relaxed italic">
                      "{currentDeal.ai_confirmation}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Deal Profile Card */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Classification */}
                <div className="border border-border bg-card p-6 space-y-4">
                  <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground">Classification</p>
                  <div className="flex items-center gap-3">
                    <CatIcon size={20} className={categoryColors[currentDeal.category] || "text-primary"} />
                    <div>
                      <p className="font-display text-lg text-foreground capitalize">{currentDeal.category}</p>
                      <p className="font-body text-xs text-muted-foreground">{currentDeal.sub_category}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-border/50">
                    <p className="font-body text-xs text-muted-foreground">Intent</p>
                    <p className="font-body text-sm text-foreground">{currentDeal.intent}</p>
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-border/50">
                    <p className="font-body text-xs text-muted-foreground">Routed To</p>
                    <p className="font-body text-sm text-primary">{currentDeal.routed_engine}</p>
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-border/50">
                    <p className="font-body text-xs text-muted-foreground">Deal ID</p>
                    <p className="font-mono text-xs text-foreground/60">{currentDeal.deal_number}</p>
                  </div>
                </div>

                {/* Requirements */}
                <div className="border border-border bg-card p-6 space-y-4">
                  <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground">Requirements</p>
                  {currentDeal.budget_max && (
                    <div className="flex items-center gap-2">
                      <DollarSign size={14} className="text-primary/60" />
                      <span className="font-body text-sm text-foreground">
                        {currentDeal.budget_min ? `${formatCurrency(currentDeal.budget_min, currentDeal.budget_currency)} – ` : "Up to "}
                        {formatCurrency(currentDeal.budget_max, currentDeal.budget_currency)}
                      </span>
                    </div>
                  )}
                  {currentDeal.timeline_days && (
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-primary/60" />
                      <span className="font-body text-sm text-foreground">{currentDeal.timeline_days} days</span>
                    </div>
                  )}
                  {currentDeal.location && (
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-primary/60" />
                      <span className="font-body text-sm text-foreground">{currentDeal.location}</span>
                    </div>
                  )}
                  {currentDeal.constraints?.length > 0 && (
                    <div className="pt-2 border-t border-border/50">
                      <p className="font-body text-xs text-muted-foreground mb-2">Constraints</p>
                      <div className="flex flex-wrap gap-1.5">
                        {currentDeal.constraints.map((c: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-destructive/10 text-destructive font-body text-[10px] tracking-wide uppercase border border-destructive/20">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {currentDeal.preferences?.length > 0 && (
                    <div className="pt-2 border-t border-border/50">
                      <p className="font-body text-xs text-muted-foreground mb-2">Preferences</p>
                      <div className="flex flex-wrap gap-1.5">
                        {currentDeal.preferences.map((p: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary font-body text-[10px] tracking-wide uppercase border border-primary/20">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Scoring */}
                <div className="border border-border bg-card p-6 space-y-4">
                  <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground">Deal Intelligence</p>
                  <div className="text-center py-3">
                    <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-primary/30">
                      <span className="font-display text-2xl text-foreground">{currentDeal.priority_score}</span>
                    </div>
                    <p className="font-body text-xs text-muted-foreground mt-2">Priority Score</p>
                  </div>
                  <div className="space-y-3 pt-2">
                    <ScoreBar label="Urgency" value={currentDeal.urgency_score} icon={AlertTriangle} />
                    <ScoreBar label="Complexity" value={currentDeal.complexity_score} icon={Sparkles} />
                    <ScoreBar label="Probability" value={currentDeal.probability_score} icon={CheckCircle2} />
                  </div>
                  {currentDeal.deal_value_estimate && (
                    <div className="pt-3 border-t border-border/50 text-center">
                      <p className="font-body text-xs text-muted-foreground">Estimated Value</p>
                      <p className="font-display text-lg text-primary">
                        {formatCurrency(currentDeal.deal_value_estimate)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Next Action */}
              <Link
                to={`/sourcing?deal=${currentDeal.id}`}
                className="flex items-center justify-between border border-primary/20 bg-card p-5 hover:border-primary/40 transition-colors group"
              >
                <div>
                  <p className="font-body text-xs text-muted-foreground">Status</p>
                  <p className="font-body text-sm text-foreground capitalize">{currentDeal.status} Complete</p>
                </div>
                <div className="flex items-center gap-2 text-primary font-body text-xs tracking-widest uppercase group-hover:gap-3 transition-all">
                  <span>Begin Sourcing →</span>
                </div>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recent Deals */}
        {recentDeals.length > 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-16"
          >
            <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-6">Recent Requests</p>
            <div className="space-y-2">
              {recentDeals.map((deal) => {
                const Icon = categoryIcons[deal.category] || Sparkles;
                return (
                  <button
                    key={deal.id}
                    onClick={() => setCurrentDeal(deal)}
                    className={`w-full text-left flex items-center gap-4 p-4 border transition-all hover:border-primary/30 hover:bg-card ${
                      currentDeal?.id === deal.id ? "border-primary/40 bg-card" : "border-border/50 bg-transparent"
                    }`}
                  >
                    <Icon size={16} className={categoryColors[deal.category] || "text-primary"} />
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-foreground truncate">{deal.intent || deal.raw_input.substring(0, 60)}</p>
                      <p className="font-body text-xs text-muted-foreground capitalize">{deal.category} · {deal.sub_category}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono text-xs text-primary">{deal.priority_score}</div>
                      <p className="font-body text-[10px] text-muted-foreground">{deal.deal_number}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
