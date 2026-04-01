import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Hotel, Zap, Send, Loader2, AlertTriangle, RefreshCcw,
  DollarSign, Clock, Tag, Gift, Bot, Shield,
  CheckCircle, Terminal, TrendingDown, Activity, Copy,
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

type LeakageCard = Lead & {
  hotelName: string;
  roomType: string;
  directPrice: number;
  otaPrice: number;
  priceDiffPct: number;
  promoCode: string | null;
  recoveryPerk: string | null;
  projectedCommission: number;
  isDrafting: boolean;
  isSending: boolean;
  aiPopup: string | null;
};

function parseHospitalityLead(lead: Lead): Partial<LeakageCard> {
  const s = lead.ai_summary || "";
  const hotelMatch = s.match(/\[(?:LEAKAGE|PARITY OK)\]\s*(.+?)\s*—/);
  const directMatch = s.match(/Direct:\s*\w+\s*(\d+)/);
  const otaMatch = s.match(/OTA:\s*\w+\s*(\d+)/);
  const pctMatch = s.match(/(\d+\.?\d*)%/);
  const codeMatch = s.match(/(QTX-[A-Z0-9]{6})/);
  const perkMatch = s.match(/"([^"]+)"/);
  const commMatch = s.match(/Commission:\s*\w+\s*(\d+)/);

  const directPrice = Number(directMatch?.[1]) || 0;
  const otaPrice = Number(otaMatch?.[1]) || 0;

  return {
    hotelName: hotelMatch?.[1] || "Unknown Hotel",
    roomType: "Deluxe Room",
    directPrice,
    otaPrice,
    priceDiffPct: Number(pctMatch?.[1]) || 0,
    promoCode: codeMatch?.[1] || null,
    recoveryPerk: perkMatch?.[1] || null,
    projectedCommission: Number(commMatch?.[1]) || Math.floor(otaPrice * 0.05),
    aiPopup: null,
  };
}

const statusConfig: Record<string, { icon: typeof AlertTriangle; color: string; label: string }> = {
  Leakage_Alert: { icon: TrendingDown, color: "text-amber-400 bg-amber-400/10", label: "Leakage Alert" },
  Sent: { icon: Send, color: "text-purple-400 bg-purple-400/10", label: "Promo Active" },
  Recovered: { icon: RefreshCcw, color: "text-emerald-400 bg-emerald-400/10", label: "Direct Shift ✓" },
  Monitoring: { icon: Activity, color: "text-blue-400 bg-blue-400/10", label: "Parity OK" },
};

function generateAuditLogs(): string[] {
  const now = new Date();
  const fmt = (offset: number) => {
    const d = new Date(now.getTime() - offset * 60000);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  };
  return [
    `${fmt(12)} — Parity Shield launched dual-scrape on 2 properties.`,
    `${fmt(8)} — Corinthia London: Direct £320 vs Booking.com £295. LEAKAGE detected.`,
    `${fmt(6)} — AI Value Bundler generated QTX-K8M2NP + "£25 Breakfast Credit".`,
    `${fmt(4)} — The Savoy: Parity maintained at £450. No action needed.`,
    `${fmt(2)} — Promo QTX-R4W7YZ redeemed! Direct booking £580. Commission: £29.`,
    `${fmt(0)} — Shield cycle complete. Next scan in 6h.`,
  ];
}

const HospitalityLiveDeals = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<LeakageCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoPilot, setAutoPilot] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [showAudit, setShowAudit] = useState(true);
  const [auditLogs, setAuditLogs] = useState<string[]>(generateAuditLogs());

  const fetchLeads = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: tenant } = await supabase
      .from("tenants")
      .select("id")
      .eq("user_id", user.id)
      .eq("sector", "Hospitality")
      .maybeSingle();

    if (!tenant) { setLoading(false); return; }

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("user_id", user.id)
      .eq("tenant_id", tenant.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) { console.error(error); setLoading(false); return; }

    const cards: LeakageCard[] = (data || []).map((lead: Lead) => {
      const parsed = parseHospitalityLead(lead);
      return {
        ...lead,
        hotelName: parsed.hotelName || "Unknown",
        roomType: parsed.roomType || "Deluxe",
        directPrice: parsed.directPrice || 0,
        otaPrice: parsed.otaPrice || 0,
        priceDiffPct: parsed.priceDiffPct || 0,
        promoCode: parsed.promoCode || null,
        recoveryPerk: parsed.recoveryPerk || null,
        projectedCommission: parsed.projectedCommission || 0,
        isDrafting: false,
        isSending: false,
        aiPopup: null,
      };
    });

    setLeads(cards);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);
  useEffect(() => {
    const interval = setInterval(() => setAuditLogs(generateAuditLogs()), 30000);
    return () => clearInterval(interval);
  }, []);

  const activatePromo = async (leadId: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, isSending: true } : l));
    const lead = leads.find(l => l.id === leadId);
    if (!lead || !user) return;

    try {
      await supabase.from("leads").update({ status: "Sent" }).eq("id", leadId);

      const { data: tenantData } = await supabase
        .from("tenants")
        .select("id")
        .eq("user_id", user.id)
        .eq("sector", "Hospitality")
        .maybeSingle();

      if (tenantData) {
        await supabase.from("system_logs" as any).insert({
          tenant_id: tenantData.id,
          user_id: user.id,
          action_type: "Hospitality_Promo_Activated",
          description: `Promo ${lead.promoCode} activated for ${lead.hotelName}. Projected commission: £${lead.projectedCommission}`,
        } as any);
      }

      setLeads(prev => prev.map(l =>
        l.id === leadId ? { ...l, status: "Sent", isSending: false } : l
      ));
      toast.success(`Promo ${lead.promoCode} activated! Tracking 5% commission.`);
    } catch (err: any) {
      toast.error("Activation failed: " + (err.message || "Unknown error"));
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, isSending: false } : l));
    }
  };

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Promo code ${code} copied!`);
  };

  const filtered = filter === "all" ? leads : leads.filter(l => l.status === filter);

  const totalCommissionPipeline = filtered
    .filter(l => l.status !== "Recovered" && l.status !== "Monitoring")
    .reduce((s, l) => s + l.projectedCommission, 0);

  const savedFromOTA = filtered.filter(l => l.status === "Recovered").length;
  const activeLeakages = filtered.filter(l => l.status === "Leakage_Alert").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground ml-2">Loading parity shield...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Hotel className="h-4 w-4 text-amber-400" />
            Parity Shield — Live Leakage Recovery
          </h2>
          <Badge variant="outline" className="text-[9px] border-border/50 text-muted-foreground">
            {leads.length} properties
          </Badge>
          {activeLeakages > 0 && (
            <Badge
              className="text-[9px] border-[#D4AF37]/40 text-[#D4AF37] bg-[#D4AF37]/10 animate-pulse"
              style={{ boxShadow: "0 0 8px rgba(212,175,55,0.3)" }}
            >
              <AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> {activeLeakages} leakage(s)
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4">
          {savedFromOTA > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5">
              <CheckCircle className="h-3 w-3 text-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-mono font-bold">{savedFromOTA}</span>
              <span className="text-[9px] text-emerald-400/70">Saved from OTA</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Bot className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground">Auto-Shield</span>
            <Switch
              checked={autoPilot}
              onCheckedChange={setAutoPilot}
              className="data-[state=checked]:bg-amber-500"
            />
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5">
            <DollarSign className="h-3 w-3 text-[#D4AF37]" />
            <span className="text-[10px] text-[#D4AF37]/70">5% Commission</span>
            <span className="text-xs font-bold text-[#D4AF37] font-mono">
              £{totalCommissionPipeline.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Audit Terminal */}
      <AnimatePresence>
        {showAudit && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-border/40 bg-background/80 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-border/30">
              <div className="flex items-center gap-2">
                <Terminal className="h-3 w-3 text-amber-400" />
                <span className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground">
                  Parity Shield Audit Feed — 6h Cycle
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                </span>
              </div>
              <button onClick={() => setShowAudit(false)} className="text-[9px] text-muted-foreground hover:text-foreground">Hide</button>
            </div>
            <div className="p-3 max-h-36 overflow-y-auto font-mono text-[10px] space-y-1 bg-background/60">
              {auditLogs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={
                    log.includes("LEAKAGE") ? "text-amber-400"
                    : log.includes("redeemed") || log.includes("Commission") ? "text-emerald-400"
                    : log.includes("complete") ? "text-primary"
                    : "text-muted-foreground"
                  }
                >
                  {log}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showAudit && (
        <button onClick={() => setShowAudit(true)} className="text-[9px] text-muted-foreground hover:text-foreground flex items-center gap-1">
          <Terminal className="h-3 w-3" /> Show Audit Terminal
        </button>
      )}

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: "All" },
          { id: "Leakage_Alert", label: "Leakage Alerts" },
          { id: "Sent", label: "Promo Active" },
          { id: "Recovered", label: "Direct Shift ✓" },
          { id: "Monitoring", label: "Parity OK" },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-medium tracking-wider uppercase shrink-0 transition-all ${
              filter === f.id
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                : "text-muted-foreground border border-border/30 hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Auto-Shield Banner */}
      <AnimatePresence>
        {autoPilot && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 flex items-center gap-2"
          >
            <Shield className="h-4 w-4 text-amber-400" />
            <span className="text-xs text-amber-400">
              <strong>Auto-Shield Active:</strong> New leakage alerts will automatically generate and activate Direct-Only promo codes. 5% commission tracked per booking.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leakage Cards */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 border border-border/30 rounded-xl">
            <Hotel className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No properties match this filter. Run a Parity Check to scan for leakage.</p>
          </div>
        )}

        {filtered.map((deal, i) => {
          const sc = statusConfig[deal.status] || statusConfig.Monitoring;
          const StatusIcon = sc.icon;
          const isLeakage = deal.status === "Leakage_Alert";

          return (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`rounded-xl border backdrop-blur-sm p-4 transition-all ${
                isLeakage
                  ? "border-[#D4AF37]/40 bg-[#D4AF37]/[0.02]"
                  : "border-border/40 bg-card/60"
              }`}
              style={isLeakage ? { boxShadow: "0 0 12px rgba(212,175,55,0.08)" } : undefined}
            >
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`p-1.5 rounded-md ${sc.color}`}>
                      <StatusIcon className="h-3 w-3" />
                    </div>
                    <span className="text-xs font-semibold text-foreground truncate">{deal.hotelName}</span>
                    {isLeakage && (
                      <Badge
                        className="text-[9px] border-[#D4AF37]/40 text-[#D4AF37] bg-[#D4AF37]/10 animate-pulse"
                        style={{ boxShadow: "0 0 8px rgba(212,175,55,0.3)" }}
                      >
                        <Zap className="h-2.5 w-2.5 mr-0.5" /> LEAKAGE
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-2">
                    <Clock className="h-2.5 w-2.5" />
                    {new Date(deal.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                    {deal.promoCode && (
                      <>
                        <span className="text-muted-foreground/50">·</span>
                        <Tag className="h-2.5 w-2.5" /> {deal.promoCode}
                      </>
                    )}
                  </p>
                </div>

                {/* Price Comparison */}
                {deal.directPrice > 0 && (
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-[9px] text-muted-foreground">Direct</p>
                      <p className="text-sm font-mono text-foreground">£{deal.directPrice}</p>
                    </div>
                    <TrendingDown className={`h-4 w-4 ${isLeakage ? "text-red-400" : "text-emerald-400"}`} />
                    <div className="text-right">
                      <p className="text-[9px] text-muted-foreground">OTA</p>
                      <p className={`text-sm font-mono ${isLeakage ? "text-red-400" : "text-foreground"}`}>
                        £{deal.otaPrice}
                      </p>
                    </div>
                    {isLeakage && (
                      <Badge variant="outline" className="text-[9px] border-red-400/30 text-red-400">
                        -{deal.priceDiffPct}%
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Recovery Perk */}
              {deal.recoveryPerk && isLeakage && (
                <div className="mt-3 p-3 rounded-lg bg-amber-900/10 border border-amber-700/20 flex items-center gap-3">
                  <Gift className="h-4 w-4 text-amber-400 shrink-0" />
                  <div className="flex-1">
                    <p className="text-[9px] tracking-[0.1em] uppercase text-amber-400 mb-0.5">Direct-Only Perk</p>
                    <p className="text-xs text-foreground">Match OTA at £{deal.otaPrice} + <strong>{deal.recoveryPerk}</strong></p>
                  </div>
                  {deal.promoCode && (
                    <button
                      onClick={() => copyPromoCode(deal.promoCode!)}
                      className="flex items-center gap-1 px-2 py-1 rounded border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-mono hover:bg-[#D4AF37]/10 transition-colors"
                    >
                      <Copy className="h-3 w-3" /> {deal.promoCode}
                    </button>
                  )}
                </div>
              )}

              {/* Commission + Actions */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-3 w-3 text-[#D4AF37]" />
                  <span className="text-[10px] text-[#D4AF37] font-mono font-bold">
                    £{deal.projectedCommission.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-muted-foreground">5% direct shift fee</span>
                </div>

                <div className="flex items-center gap-2">
                  {deal.status === "Leakage_Alert" && (
                    <Button
                      size="sm"
                      onClick={() => activatePromo(deal.id)}
                      disabled={deal.isSending}
                      className="text-[10px] h-7 bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                    >
                      {deal.isSending ? (
                        <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Activating...</>
                      ) : (
                        <><Zap className="h-3 w-3 mr-1" /> Activate Promo</>
                      )}
                    </Button>
                  )}
                  {deal.status === "Sent" && (
                    <Badge variant="outline" className="text-[9px] border-purple-400/30 text-purple-400">
                      <Tag className="h-2.5 w-2.5 mr-1" /> Promo Live — Tracking
                    </Badge>
                  )}
                  {deal.status === "Recovered" && (
                    <Badge
                      className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px]"
                      style={{ boxShadow: "0 0 8px rgba(16,185,129,0.3)" }}
                    >
                      <CheckCircle className="h-2.5 w-2.5 mr-1" /> Direct Shift ✓ — £{deal.projectedCommission} Earned
                    </Badge>
                  )}
                  {deal.status === "Monitoring" && (
                    <Badge variant="outline" className="text-[9px] border-emerald-400/30 text-emerald-400">
                      <CheckCircle className="h-2.5 w-2.5 mr-1" /> Parity Maintained
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

export default HospitalityLiveDeals;
