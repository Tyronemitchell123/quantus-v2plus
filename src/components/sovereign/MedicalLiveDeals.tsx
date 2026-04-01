import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Stethoscope, Zap, Send, Loader2, Ghost, RefreshCcw,
  DollarSign, Clock, MessageSquare, Bot, Heart,
  AlertTriangle, Shield, Mail, CheckCircle,
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

type RecoveryCard = Lead & {
  procedureType: string;
  patientUuid: string;
  ltvRisk: string;
  draftMessage: string | null;
  isDrafting: boolean;
  isSending: boolean;
  channel: "email" | "sms";
};

function parseMedicalLead(lead: Lead): { procedureType: string; patientUuid: string; ltvRisk: string } {
  const summary = lead.ai_summary || "";
  const procedureMatch = summary.match(/\[(?:No-Show|Cancelled)\]\s*(.+?)\s*—/);
  const uuidMatch = summary.match(/Patient\s+([\w-]+)/);
  const ltvMatch = summary.includes("HIGH") ? "HIGH" : "Standard";
  return {
    procedureType: procedureMatch?.[1] || "Unknown Procedure",
    patientUuid: uuidMatch?.[1] || "UNKNOWN",
    ltvRisk: ltvMatch,
  };
}

const statusConfig: Record<string, { icon: typeof Ghost; color: string; label: string }> = {
  Ghosted: { icon: Ghost, color: "text-red-400 bg-red-400/10", label: "Ghosted" },
  Sent: { icon: Send, color: "text-purple-400 bg-purple-400/10", label: "Outreach Sent" },
  Recovered: { icon: RefreshCcw, color: "text-emerald-400 bg-emerald-400/10", label: "Recovered" },
  Monitoring: { icon: Stethoscope, color: "text-blue-400 bg-blue-400/10", label: "Monitoring" },
};

const MedicalLiveDeals = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<RecoveryCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoPilot, setAutoPilot] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const fetchLeads = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Get medical tenant
    const { data: tenant } = await supabase
      .from("tenants")
      .select("id")
      .eq("user_id", user.id)
      .eq("sector", "Medical")
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

    const cards: RecoveryCard[] = (data || []).map((lead: Lead) => {
      const parsed = parseMedicalLead(lead);
      return {
        ...lead,
        ...parsed,
        draftMessage: null,
        isDrafting: false,
        isSending: false,
        channel: "email" as const, // Medical = privacy-first = email default
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

    try {
      const { data, error } = await supabase.functions.invoke("negotiate", {
        body: {
          action: "clinical-recovery",
          sector: "Medical",
          lead_id: leadId,
          context_data: {
            patient_uuid: lead.patientUuid,
            procedure_type: lead.procedureType,
            lost_revenue: lead.potential_value,
          },
          custom_prompt: `You are a Continuity of Care Coordinator at a premium clinic. The patient (ID: ${lead.patientUuid}) missed a ${lead.procedureType} appointment valued at $${lead.potential_value.toLocaleString()}.

STRATEGY — "Clinical Empathy" (NOT Sales):
- Frame as health continuity, not revenue recovery
- Reference the specific procedure and its clinical importance
- Offer flexible rescheduling, never pressure
- Mention that pre-authorization may still be valid
- Keep under 60 words

TONE: Warm, professional, health-focused. NEVER mention cost or revenue. NEVER reveal AI authorship. Address as "Hello" (no name — HIPAA compliance).`,
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
    if (!lead || !user) return;

    try {
      await supabase.from("leads").update({ status: "Sent" }).eq("id", leadId);

      const { data: tenantData } = await supabase
        .from("tenants")
        .select("id")
        .eq("user_id", user.id)
        .eq("sector", "Medical")
        .maybeSingle();

      if (tenantData) {
        await supabase.from("commissions").insert({
          lead_id: leadId,
          user_id: user.id,
          total_value: lead.potential_value,
          quantus_cut: lead.potential_value * 0.1,
          payout_status: "Pending",
        });

        await supabase.from("system_logs" as any).insert({
          tenant_id: tenantData.id,
          user_id: user.id,
          action_type: autoPilot ? "Medical_AutoPilot_Send" : "Medical_Manual_Send",
          description: `Recovery outreach sent via ${lead.channel} for ${lead.procedureType} (${lead.patientUuid}). Potential commission: $${(lead.potential_value * 0.1).toLocaleString()}`,
        } as any);
      }

      setLeads(prev => prev.map(l =>
        l.id === leadId ? { ...l, status: "Sent", isSending: false } : l
      ));
      toast.success(`Recovery outreach sent via ${lead.channel}. Potential commission: $${(lead.potential_value * 0.1).toLocaleString()}`);
    } catch (err: any) {
      toast.error("Send failed: " + (err.message || "Unknown error"));
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, isSending: false } : l));
    }
  };

  // Auto-pilot: auto-send for high-LTV ghosted leads
  useEffect(() => {
    if (!autoPilot) return;
    leads.forEach(lead => {
      if (
        lead.ltvRisk === "HIGH" &&
        lead.status === "Ghosted" &&
        lead.draftMessage &&
        !lead.isSending
      ) {
        sendOutreach(lead.id);
      }
    });
  }, [autoPilot, leads]);

  const filtered = filter === "all" ? leads : leads.filter(l => l.status === filter);

  const totalPotentialCommission = filtered
    .filter(l => l.status !== "Recovered")
    .reduce((s, l) => s + l.potential_value * 0.1, 0);

  const totalLostRevenue = filtered.reduce((s, l) => s + l.potential_value, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground ml-2">Loading recovery pipeline...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Heart className="h-4 w-4 text-emerald-400" />
            Patient Recovery Pipeline
          </h2>
          <Badge variant="outline" className="text-[9px] border-border/50 text-muted-foreground">
            {leads.length} patients
          </Badge>
          <Badge variant="outline" className="text-[9px] border-red-400/30 text-red-400">
            ${totalLostRevenue.toLocaleString()} at risk
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          {/* Auto-Pilot */}
          <div className="flex items-center gap-2">
            <Bot className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground">Auto-Recovery</span>
            <Switch
              checked={autoPilot}
              onCheckedChange={setAutoPilot}
              className="data-[state=checked]:bg-emerald-500"
            />
          </div>

          {/* Commission Ticker */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5">
            <DollarSign className="h-3 w-3 text-[#D4AF37]" />
            <span className="text-[10px] text-[#D4AF37]/70">Recovery Commission</span>
            <span className="text-xs font-bold text-[#D4AF37] font-mono">
              ${totalPotentialCommission.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: "All" },
          { id: "Ghosted", label: "Ghosted" },
          { id: "Sent", label: "Outreach Sent" },
          { id: "Recovered", label: "Recovered" },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-medium tracking-wider uppercase shrink-0 transition-all ${
              filter === f.id
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
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
            className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 flex items-center gap-2"
          >
            <Shield className="h-4 w-4 text-emerald-400" />
            <span className="text-xs text-emerald-400">
              <strong>Auto-Recovery Active:</strong> HIGH LTV-risk patients with drafted messages will receive outreach automatically via email. All actions HIPAA-logged.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recovery Cards */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 border border-border/30 rounded-xl">
            <Stethoscope className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">No patients match this filter. Run a CRM scan to detect no-shows.</p>
          </div>
        )}

        {filtered.map((deal, i) => {
          const sc = statusConfig[deal.status] || statusConfig.Ghosted;
          const StatusIcon = sc.icon;
          const isHighLtv = deal.ltvRisk === "HIGH";

          return (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`rounded-xl border backdrop-blur-sm p-4 transition-all ${
                isHighLtv
                  ? "border-red-400/30 bg-red-400/[0.02]"
                  : "border-border/40 bg-card/60"
              }`}
            >
              <div className="flex flex-wrap items-start gap-4">
                {/* Status + Procedure */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className={`p-1.5 rounded-md ${sc.color}`}>
                      <StatusIcon className="h-3 w-3" />
                    </div>
                    <span className="text-xs font-semibold text-foreground truncate">
                      {deal.procedureType}
                    </span>
                    {isHighLtv && (
                      <Badge className="bg-red-400/20 text-red-400 border-red-400/30 text-[9px]">
                        <AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> HIGH LTV RISK
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-2">
                    <Shield className="h-3 w-3" /> Patient {deal.patientUuid}
                    <span className="text-muted-foreground/50">·</span>
                    <Clock className="h-2.5 w-2.5" />
                    {new Date(deal.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short" })}
                    <span className="text-muted-foreground/50">·</span>
                    <Mail className="h-2.5 w-2.5" /> {deal.channel}
                  </p>
                </div>

                {/* Value */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground font-mono">
                      ${deal.potential_value.toLocaleString()}
                    </p>
                    <p className="text-[9px] text-muted-foreground">lost revenue</p>
                  </div>
                </div>
              </div>

              {/* AI Draft — Clinical Empathy */}
              {deal.draftMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 p-3 rounded-lg bg-emerald-900/20 border border-emerald-700/20"
                >
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Heart className="h-3 w-3 text-emerald-400" />
                    <span className="text-[9px] tracking-[0.1em] uppercase text-emerald-400">Clinical Empathy Draft</span>
                  </div>
                  <p className="text-xs text-foreground font-mono leading-relaxed whitespace-pre-wrap">
                    {deal.draftMessage}
                  </p>
                </motion.div>
              )}

              {/* Commission + Actions */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="h-3 w-3 text-[#D4AF37]" />
                  <span className="text-[10px] text-[#D4AF37] font-mono font-bold">
                    ${(deal.potential_value * 0.1).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[9px] text-muted-foreground">recovery commission</span>
                </div>

                <div className="flex items-center gap-2">
                  {deal.status !== "Sent" && deal.status !== "Recovered" && (
                    <>
                      {!deal.draftMessage ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateDraft(deal.id)}
                          disabled={deal.isDrafting}
                          className="text-[10px] h-7 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                        >
                          {deal.isDrafting ? (
                            <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Drafting...</>
                          ) : (
                            <><Heart className="h-3 w-3 mr-1" /> Draft Recovery</>
                          )}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => sendOutreach(deal.id)}
                          disabled={deal.isSending}
                          className="text-[10px] h-7 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                        >
                          {deal.isSending ? (
                            <><Loader2 className="h-3 w-3 animate-spin mr-1" /> Sending...</>
                          ) : (
                            <><Send className="h-3 w-3 mr-1" /> Send via Email</>
                          )}
                        </Button>
                      )}
                    </>
                  )}
                  {deal.status === "Sent" && (
                    <Badge variant="outline" className="text-[9px] border-purple-400/30 text-purple-400">
                      <CheckCircle className="h-2.5 w-2.5 mr-1" /> Awaiting Response
                    </Badge>
                  )}
                  {deal.status === "Recovered" && (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px]">
                      <CheckCircle className="h-2.5 w-2.5 mr-1" /> Recovered ✓
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

export default MedicalLiveDeals;
