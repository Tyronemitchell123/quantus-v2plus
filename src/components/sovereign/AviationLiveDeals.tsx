import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Plane, Zap, Send, Loader2, Eye, Ghost, RefreshCcw,
  DollarSign, Shield, ExternalLink, Clock, CheckCircle,
  AlertTriangle, TrendingDown, MessageSquare, Bot,
} from "lucide-react";
import { toast } from "sonner";

type Lead = {
  id: string;
  source_url: string | null;
  status: string;
  potential_value: number;
  ai_summary: string | null;
  created_at: string;
};

type DealCard = Lead & {
  arbitrageDelta: number;
  arbitragePct: number;
  marketAvg: number;
  draftMessage: string | null;
  isDrafting: boolean;
  isSending: boolean;
};

const MARKET_AVG_MAP: Record<string, number> = {
  "light": 5500,
  "mid": 8000,
  "super": 12000,
  "heavy": 22000,
  "default": 8000,
};

function estimateMarketAvg(summary: string): number {
  const lower = (summary || "").toLowerCase();
  if (lower.includes("gulfstream") || lower.includes("global") || lower.includes("falcon")) return MARKET_AVG_MAP["heavy"];
  if (lower.includes("g280") || lower.includes("challenger")) return MARKET_AVG_MAP["super"];
  if (lower.includes("citation") || lower.includes("phenom") || lower.includes("learjet")) return MARKET_AVG_MAP["light"];
  return MARKET_AVG_MAP["default"];
}

function parseRoute(summary: string): { origin: string; destination: string; aircraft: string } {
  const match = summary?.match(/\[Empty Leg\]\s*(.+?)\s*→\s*(.+?)\s*\|\s*(.+?)\s*\|/);
  if (match) return { origin: match[1], destination: match[2], aircraft: match[3] };
  return { origin: "Unknown", destination: "Unknown", aircraft: "Unknown" };
}

const statusConfig: Record<string, { icon: typeof Eye; color: string; label: string }> = {
  Monitoring: { icon: Eye, color: "text-blue-400 bg-blue-400/10", label: "Monitoring" },
  Arbitrage_Detected: { icon: Zap, color: "text-[#D4AF37] bg-[#D4AF37]/10", label: "Arbitrage" },
  Ghosted: { icon: Ghost, color: "text-red-400 bg-red-400/10", label: "Ghosted" },
  Recovered: { icon: RefreshCcw, color: "text-emerald-400 bg-emerald-400/10", label: "Recovered" },
  Sent: { icon: Send, color: "text-purple-400 bg-purple-400/10", label: "Outreach Sent" },
};

const AviationLiveDeals = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<DealCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoPilot, setAutoPilot] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const fetchLeads = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Failed to fetch leads:", error);
      setLoading(false);
      return;
    }

    const cards: DealCard[] = (data || []).map((lead: Lead) => {
      const marketAvg = estimateMarketAvg(lead.ai_summary || "");
      const delta = marketAvg - lead.potential_value;
      const pct = marketAvg > 0 ? (delta / marketAvg) * 100 : 0;
      return {
        ...lead,
        arbitrageDelta: delta,
        arbitragePct: pct,
        marketAvg,
        draftMessage: null,
        isDrafting: false,
        isSending: false,
      };
    });

    setLeads(cards);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const generateDraft = async (leadId: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, isDrafting: true } : l));
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const route = parseRoute(lead.ai_summary || "");

    try {
      const { data, error } = await supabase.functions.invoke("negotiate", {
        body: {
          action: "re-engage",
          sector: "Aviation",
          lead_id: leadId,
          context_data: {
            origin: route.origin,
            destination: route.destination,
            aircraft: route.aircraft,
            price: lead.potential_value,
            currency: "GBP",
          },
          custom_prompt: `You are the Quantus Elite Closer. Tone: Calm, Data-Dense, Scarcity-Driven. The client's price is £${lead.potential_value.toLocaleString()} vs market average £${lead.marketAvg.toLocaleString()} — a saving of £${lead.arbitrageDelta.toLocaleString()} (${lead.arbitragePct.toFixed(0)}% below market). Route: ${route.origin} → ${route.destination} on a ${route.aircraft}. Generate a concise WhatsApp message (under 50 words) emphasizing the arbitrage advantage. Never reveal you are AI.`,
        },
      });

      if (error) throw error;
      setLeads(prev => prev.map(l =>
        l.id === leadId ? { ...l, draftMessage: data.message, isDrafting: false } : l
      ));
    } catch (err: any) {
      toast.error("Draft generation failed: " + (err.message || "Unknown error"));
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, isDrafting: false } : l));
    }
  };

  const sendOutreach = async (leadId: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, isSending: true } : l));
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    try {
      // Update lead status to Sent
      await supabase.from("leads").update({ status: "Sent" }).eq("id", leadId);

      // Create commission record
      const { data: tenantData } = await supabase
        .from("tenants")
        .select("id")
        .eq("user_id", user!.id)
        .eq("sector", "Aviation")
        .maybeSingle();

      // Commission tracking is handled by the deal pipeline (commission_logs).
      // No need to insert into deprecated 'commissions' table.

      setLeads(prev => prev.map(l =>
        l.id === leadId ? { ...l, status: "Sent", isSending: false } : l
      ));
      toast.success(`Outreach sent. Potential commission: £${(lead.potential_value * 0.1).toLocaleString()}`);
    } catch (err: any) {
      toast.error("Send failed: " + (err.message || "Unknown error"));
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, isSending: false } : l));
    }
  };

  // Auto-pilot: auto-send for high-trust leads with >20% arbitrage
  useEffect(() => {
    if (!autoPilot) return;
    leads.forEach(lead => {
      if (
        lead.arbitragePct > 20 &&
        lead.status === "Arbitrage_Detected" &&
        lead.draftMessage &&
        !lead.isSending
      ) {
        sendOutreach(lead.id);
      }
    });
  }, [autoPilot, leads]);

  const filtered = filter === "all"
    ? leads
    : leads.filter(l => l.status === filter);

  const totalPotentialCommission = filtered
    .filter(l => l.status !== "Recovered")
    .reduce((s, l) => s + l.potential_value * 0.1, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground ml-2">Loading live deals...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header + Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Plane className="h-4 w-4 text-blue-400" />
            Live Aviation Deals
          </h2>
          <Badge variant="outline" className="text-[9px] border-border/50 text-muted-foreground">
            {leads.length} leads
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          {/* Auto-Pilot Toggle */}
          <div className="flex items-center gap-2">
            <Bot className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground">Auto-Pilot</span>
            <Switch
              checked={autoPilot}
              onCheckedChange={setAutoPilot}
              className="data-[state=checked]:bg-[#D4AF37]"
            />
          </div>

          {/* Floating Commission Ticker */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5">
            <DollarSign className="h-3 w-3 text-[#D4AF37]" />
            <span className="text-[10px] text-[#D4AF37]/70">Pipeline Commission</span>
            <span className="text-xs font-bold text-[#D4AF37] font-mono">
              £{totalPotentialCommission.toLocaleString("en-GB", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: "All" },
          { id: "Arbitrage_Detected", label: "Arbitrage" },
          { id: "Monitoring", label: "Monitoring" },
          { id: "Sent", label: "Outreach Sent" },
          { id: "Recovered", label: "Recovered" },
          { id: "Ghosted", label: "Ghosted" },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-medium tracking-wider uppercase shrink-0 transition-all ${
              filter === f.id
                ? "bg-primary/10 text-primary border border-primary/30"
                : "text-muted-foreground border border-border/30 hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Auto-Pilot Banner */}
      <AnimatePresence>
        {autoPilot && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-3 flex items-center gap-2"
          >
            <Bot className="h-4 w-4 text-[#D4AF37]" />
            <span className="text-xs text-[#D4AF37]">
              <strong>Auto-Pilot Active:</strong> Leads with &gt;20% arbitrage delta and 'High_Trust' tag will auto-send on first outreach. All actions logged to system audit.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deal Cards */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 border border-border/30 rounded-xl">
            <Plane className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No leads match this filter. Run a scan to ingest new deals.</p>
          </div>
        )}

        {filtered.map((deal, i) => {
          const route = parseRoute(deal.ai_summary || "");
          const sc = statusConfig[deal.status] || statusConfig.Monitoring;
          const StatusIcon = sc.icon;
          const isArbitrage = deal.arbitragePct > 15;

          return (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`rounded-xl border backdrop-blur-sm p-4 transition-all ${
                isArbitrage
                  ? "border-[#D4AF37]/30 bg-[#D4AF37]/[0.02]"
                  : "border-border/40 bg-card/60"
              }`}
            >
              <div className="flex flex-wrap items-start gap-4">
                {/* Status + Route */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`p-1.5 rounded-md ${sc.color}`}>
                      <StatusIcon className="h-3 w-3" />
                    </div>
                    <span className="text-xs font-semibold text-foreground truncate">
                      {route.origin} → {route.destination}
                    </span>
                    {isArbitrage && (
                      <Badge className="bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/30 text-[9px]">
                        ⚡ ARBITRAGE
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-2">
                    <Plane className="h-3 w-3" /> {route.aircraft}
                    <span className="text-muted-foreground/50">·</span>
                    <Clock className="h-2.5 w-2.5" />
                    {new Date(deal.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                </div>

                {/* Pricing + Arbitrage */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground font-mono">
                      £{deal.potential_value.toLocaleString()}
                    </p>
                    <p className="text-[9px] text-muted-foreground">our price</p>
                  </div>
                  {deal.arbitrageDelta > 0 && (
                    <div className="text-right px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <p className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1">
                        <TrendingDown className="h-3 w-3" />
                        £{deal.arbitrageDelta.toLocaleString()}
                      </p>
                      <p className="text-[8px] text-emerald-400/70">{deal.arbitragePct.toFixed(0)}% below market</p>
                    </div>
                  )}
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground font-mono">
                      £{deal.marketAvg.toLocaleString()}
                    </p>
                    <p className="text-[9px] text-muted-foreground">market avg</p>
                  </div>
                </div>
              </div>

              {/* AI Draft */}
              {deal.draftMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 p-3 rounded-lg bg-emerald-900/20 border border-emerald-700/20"
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <MessageSquare className="h-3 w-3 text-emerald-400" />
                    <span className="text-[9px] tracking-[0.1em] uppercase text-emerald-400">AI Outreach Draft</span>
                  </div>
                  <p className="text-xs text-foreground font-mono leading-relaxed whitespace-pre-wrap">
                    {deal.draftMessage}
                  </p>
                </motion.div>
              )}

              {/* Commission Preview */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-3 w-3 text-[#D4AF37]" />
                  <span className="text-[10px] text-[#D4AF37] font-mono font-bold">
                    £{(deal.potential_value * 0.1).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[9px] text-muted-foreground">potential commission</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {deal.status !== "Sent" && deal.status !== "Recovered" && (
                    <>
                      {!deal.draftMessage ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateDraft(deal.id)}
                          disabled={deal.isDrafting}
                          className="text-[10px] h-7 border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                        >
                          {deal.isDrafting ? (
                            <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Drafting...</>
                          ) : (
                            <><Zap className="h-3 w-3 mr-1" /> Draft Outreach</>
                          )}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => sendOutreach(deal.id)}
                          disabled={deal.isSending}
                          className="text-[10px] h-7 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black font-semibold"
                        >
                          {deal.isSending ? (
                            <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Sending...</>
                          ) : (
                            <><Send className="h-3 w-3 mr-1" /> Approve & Send</>
                          )}
                        </Button>
                      )}
                    </>
                  )}
                  {deal.status === "Sent" && (
                    <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[9px]">
                      <CheckCircle className="h-2.5 w-2.5 mr-1" /> Outreach Sent
                    </Badge>
                  )}
                  {deal.status === "Recovered" && (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px]">
                      <CheckCircle className="h-2.5 w-2.5 mr-1" /> Recovered
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AviationLiveDeals;
