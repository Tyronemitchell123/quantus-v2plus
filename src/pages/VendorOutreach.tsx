import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane, Heart, Users, Globe, Truck, Handshake, Sparkles, Loader2,
  Send, MessageSquare, Clock, CheckCircle2, AlertTriangle, ArrowLeft,
  ChevronDown, ChevronUp, Mail, Phone, Building2, FileText, Zap,
  RefreshCw, Shield, Target, ArrowRight, User, MailOpen, Reply,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useDocumentHead from "@/hooks/use-document-head";

type VendorOutreach = {
  id: string;
  deal_id: string;
  sourcing_result_id: string;
  vendor_name: string;
  vendor_company: string | null;
  vendor_email: string | null;
  vendor_phone: string | null;
  category: string;
  status: string;
  outreach_strategy: Record<string, any>;
  vendor_score: number;
  response_time_hours: number | null;
  follow_up_count: number;
  next_follow_up_at: string | null;
  negotiation_ready: boolean;
  negotiation_prep: Record<string, any>;
  documents_requested: string[];
  documents_received: string[];
  created_at: string;
  updated_at: string;
};

type VendorMessage = {
  id: string;
  outreach_id: string;
  direction: string;
  channel: string;
  subject: string | null;
  body: string;
  tone: string;
  ai_generated: boolean;
  metadata: Record<string, any>;
  sent_at: string | null;
  created_at: string;
};

type Deal = {
  id: string;
  deal_number: string;
  category: string;
  sub_category: string | null;
  intent: string | null;
  priority_score: number;
  status: string;
  budget_max: number | null;
  budget_currency: string;
};

const categoryIcons: Record<string, typeof Plane> = {
  aviation: Plane, medical: Heart, staffing: Users,
  lifestyle: Globe, logistics: Truck, partnerships: Handshake,
};

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Awaiting Send", color: "text-amber-400", icon: Clock },
  sent: { label: "Sent", color: "text-blue-400", icon: Send },
  responded: { label: "Responded", color: "text-emerald-400", icon: Reply },
  negotiation_ready: { label: "Ready to Negotiate", color: "text-primary", icon: Target },
  closed: { label: "Closed", color: "text-muted-foreground", icon: CheckCircle2 },
};

function VendorScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "text-emerald-400 border-emerald-400/30" : score >= 60 ? "text-blue-400 border-blue-400/30" : score >= 40 ? "text-amber-400 border-amber-400/30" : "text-muted-foreground border-border";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 border text-[10px] font-body tracking-wider ${color}`}>
      <Shield size={9} /> {score}
    </span>
  );
}

function OutreachCard({
  outreach, messages, expanded, onToggle, onSendOutreach, onFollowUp, onLogResponse, onPrepNegotiation, sending,
}: {
  outreach: VendorOutreach;
  messages: VendorMessage[];
  expanded: boolean;
  onToggle: () => void;
  onSendOutreach: (id: string) => void;
  onFollowUp: (id: string) => void;
  onLogResponse: (id: string) => void;
  onPrepNegotiation: (id: string) => void;
  sending: string | null;
}) {
  const st = statusConfig[outreach.status] || statusConfig.pending;
  const StIcon = st.icon;
  const initialMessage = messages.find(m => m.direction === "outbound" && !m.metadata?.type);
  const followUpTemplate = messages.find(m => m.metadata?.type === "follow_up_template");
  const responses = messages.filter(m => m.direction === "inbound");

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className={`border bg-card overflow-hidden transition-colors ${expanded ? "border-primary/30" : "border-border hover:border-border/80"}`}
    >
      <button onClick={onToggle} className="w-full text-left p-5 flex items-center gap-4">
        <div className="w-10 h-10 bg-muted border border-border flex items-center justify-center shrink-0">
          <User size={16} className="text-primary/60" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`inline-flex items-center gap-1 text-[10px] font-body tracking-widest uppercase ${st.color}`}>
              <StIcon size={10} /> {st.label}
            </span>
            {outreach.vendor_score > 0 && <VendorScoreBadge score={outreach.vendor_score} />}
            {outreach.follow_up_count > 0 && (
              <span className="text-[10px] font-body text-muted-foreground">
                {outreach.follow_up_count} follow-up{outreach.follow_up_count > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <h3 className="font-display text-base text-foreground truncate">{outreach.vendor_name}</h3>
          {outreach.vendor_company && (
            <p className="font-body text-xs text-muted-foreground flex items-center gap-1">
              <Building2 size={10} /> {outreach.vendor_company}
            </p>
          )}
        </div>
        <div className="text-right shrink-0 space-y-1">
          {outreach.vendor_email && (
            <p className="font-body text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
              <Mail size={9} /> {outreach.vendor_email}
            </p>
          )}
          {outreach.response_time_hours && (
            <p className="font-body text-[10px] text-emerald-400 flex items-center gap-1 justify-end">
              <Clock size={9} /> {outreach.response_time_hours}h response
            </p>
          )}
        </div>
        {expanded ? <ChevronUp size={16} className="text-muted-foreground shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="px-5 pb-5 space-y-5 border-t border-border/50 pt-5">

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4 text-xs font-body">
                {outreach.vendor_email && (
                  <a href={`mailto:${outreach.vendor_email}`} className="flex items-center gap-1.5 text-primary hover:underline">
                    <Mail size={12} /> {outreach.vendor_email}
                  </a>
                )}
                {outreach.vendor_phone && (
                  <a href={`tel:${outreach.vendor_phone}`} className="flex items-center gap-1.5 text-foreground/70">
                    <Phone size={12} /> {outreach.vendor_phone}
                  </a>
                )}
              </div>

              {/* Outreach Strategy */}
              {outreach.outreach_strategy?.key_questions && (
                <div>
                  <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">Outreach Strategy</p>
                  <div className="space-y-2">
                    {outreach.outreach_strategy.tone && (
                      <p className="font-body text-xs text-foreground/70">
                        <span className="text-muted-foreground">Tone:</span> <span className="capitalize">{outreach.outreach_strategy.tone}</span>
                      </p>
                    )}
                    {outreach.outreach_strategy.negotiation_angle && (
                      <p className="font-body text-xs text-foreground/70">
                        <span className="text-muted-foreground">Angle:</span> {outreach.outreach_strategy.negotiation_angle}
                      </p>
                    )}
                    <div>
                      <p className="font-body text-[10px] text-muted-foreground mb-1">Key Questions</p>
                      <ul className="space-y-1">
                        {outreach.outreach_strategy.key_questions.map((q: string, i: number) => (
                          <li key={i} className="font-body text-xs text-foreground/60 pl-3 border-l border-border">{q}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Messages Thread */}
              <div>
                <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">Communication Thread</p>
                <div className="space-y-3">
                  {initialMessage && (
                    <div className="border border-border/50 bg-muted/20 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Send size={10} className="text-primary/60" />
                        <span className="font-body text-[10px] tracking-wider uppercase text-primary/60">Initial Outreach</span>
                        {initialMessage.subject && <span className="font-body text-[10px] text-muted-foreground">— {initialMessage.subject}</span>}
                      </div>
                      <p className="font-body text-xs text-foreground/70 whitespace-pre-wrap leading-relaxed">{initialMessage.body}</p>
                    </div>
                  )}

                  {responses.map((msg) => (
                    <div key={msg.id} className="border border-emerald-400/20 bg-emerald-400/5 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MailOpen size={10} className="text-emerald-400" />
                        <span className="font-body text-[10px] tracking-wider uppercase text-emerald-400">Vendor Response</span>
                      </div>
                      <p className="font-body text-xs text-foreground/70 whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents */}
              {outreach.documents_requested.length > 0 && (
                <div>
                  <p className="font-body text-xs tracking-[0.2em] uppercase text-muted-foreground mb-2">Required Documents</p>
                  <div className="flex flex-wrap gap-1.5">
                    {outreach.documents_requested.map((doc: string, i: number) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted border border-border text-[10px] font-body text-muted-foreground">
                        <FileText size={9} /> {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Negotiation Prep */}
              {outreach.negotiation_ready && outreach.negotiation_prep?.leverage_points && (
                <div className="border border-primary/20 bg-primary/5 p-4 space-y-3">
                  <p className="font-body text-xs tracking-[0.2em] uppercase text-primary">Negotiation Brief</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <p className="font-body text-[10px] text-emerald-400/70 mb-1">Leverage Points</p>
                      <ul className="space-y-1">
                        {outreach.negotiation_prep.leverage_points.map((p: string, i: number) => (
                          <li key={i} className="font-body text-xs text-foreground/60 flex items-start gap-1.5">
                            <CheckCircle2 size={10} className="text-emerald-400 shrink-0 mt-0.5" /> {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-body text-[10px] text-amber-400/70 mb-1">Risk Factors</p>
                      <ul className="space-y-1">
                        {outreach.negotiation_prep.risk_factors?.map((r: string, i: number) => (
                          <li key={i} className="font-body text-xs text-foreground/60 flex items-start gap-1.5">
                            <AlertTriangle size={10} className="text-amber-400 shrink-0 mt-0.5" /> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {outreach.negotiation_prep.recommended_approach && (
                    <p className="font-body text-xs text-foreground/70">
                      <span className="text-muted-foreground">Approach:</span> {outreach.negotiation_prep.recommended_approach}
                    </p>
                  )}
                  {outreach.negotiation_prep.next_message_draft && (
                    <div className="border border-border/50 bg-card p-3 mt-2">
                      <p className="font-body text-[10px] text-primary/60 mb-1">Draft Counter-Message</p>
                      <p className="font-body text-xs text-foreground/60 whitespace-pre-wrap">{outreach.negotiation_prep.next_message_draft}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-border/50">
                {outreach.status === "pending" && (
                  <button onClick={() => onSendOutreach(outreach.id)} disabled={sending === outreach.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-body text-[10px] tracking-widest uppercase hover:bg-primary/90 transition-all disabled:opacity-50">
                    {sending === outreach.id ? <Loader2 size={10} className="animate-spin" /> : <Send size={10} />} Mark as Sent
                  </button>
                )}
                {(outreach.status === "sent" || outreach.status === "pending") && (
                  <button onClick={() => onFollowUp(outreach.id)} disabled={sending === outreach.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-muted border border-border text-foreground font-body text-[10px] tracking-widest uppercase hover:bg-muted/80 transition-all disabled:opacity-50">
                    <RefreshCw size={10} /> Follow Up
                  </button>
                )}
                {outreach.status !== "negotiation_ready" && (
                  <button onClick={() => onLogResponse(outreach.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-muted border border-border text-foreground font-body text-[10px] tracking-widest uppercase hover:bg-muted/80 transition-all">
                    <MessageSquare size={10} /> Log Response
                  </button>
                )}
                {outreach.status === "responded" && !outreach.negotiation_ready && (
                  <button onClick={() => onPrepNegotiation(outreach.id)} disabled={sending === outreach.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary/10 border border-primary/30 text-primary font-body text-[10px] tracking-widest uppercase hover:bg-primary/20 transition-all disabled:opacity-50">
                    {sending === outreach.id ? <Loader2 size={10} className="animate-spin" /> : <Target size={10} />} Prepare Negotiation
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function VendorOutreach() {
  useDocumentHead({
    title: "Vendor Outreach — Quantus A.I",
    description: "Automated vendor engagement and negotiation preparation.",
  });

  const [searchParams] = useSearchParams();
  const dealId = searchParams.get("deal");
  const [deal, setDeal] = useState<Deal | null>(null);
  const [outreachList, setOutreachList] = useState<VendorOutreach[]>([]);
  const [messagesMap, setMessagesMap] = useState<Record<string, VendorMessage[]>>({});
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [responseModal, setResponseModal] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");

  useEffect(() => {
    if (dealId) loadData(dealId);
  }, [dealId]);

  async function loadData(id: string) {
    setLoading(true);
    const { data: d } = await supabase.from("deals").select("*").eq("id", id).single();
    if (d) setDeal(d as unknown as Deal);

    const { data: outreach } = await supabase
      .from("vendor_outreach")
      .select("*")
      .eq("deal_id", id)
      .order("created_at", { ascending: true });

    if (outreach && outreach.length > 0) {
      setOutreachList(outreach as unknown as VendorOutreach[]);
      // Load messages for all outreach
      const ids = outreach.map((o: any) => o.id);
      const { data: msgs } = await supabase
        .from("vendor_messages")
        .select("*")
        .in("outreach_id", ids)
        .order("created_at", { ascending: true });

      if (msgs) {
        const map: Record<string, VendorMessage[]> = {};
        (msgs as unknown as VendorMessage[]).forEach((m) => {
          if (!map[m.outreach_id]) map[m.outreach_id] = [];
          map[m.outreach_id].push(m);
        });
        setMessagesMap(map);
      }
    }
    setLoading(false);
  }

  async function generateOutreach() {
    if (!dealId || generating) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("vendor-outreach", {
        body: { action: "generate", deal_id: dealId },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      toast.success(`Outreach prepared for ${data.total} vendors`);
      await loadData(dealId);
    } catch (e: any) {
      toast.error(e.message || "Failed to generate outreach");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSendOutreach(outreachId: string) {
    setSending(outreachId);
    await supabase.from("vendor_outreach").update({ status: "sent" }).eq("id", outreachId);
    setOutreachList((prev) => prev.map((o) => o.id === outreachId ? { ...o, status: "sent" } : o));
    toast.success("Outreach marked as sent");
    setSending(null);
  }

  async function handleFollowUp(outreachId: string) {
    setSending(outreachId);
    try {
      const { data, error } = await supabase.functions.invoke("vendor-outreach", {
        body: { action: "follow_up", outreach_id: outreachId },
      });
      if (error) throw new Error(error.message);
      toast.success(`Follow-up #${data.follow_up_count} recorded`);
      if (dealId) await loadData(dealId);
    } catch (e: any) {
      toast.error(e.message || "Follow-up failed");
    } finally {
      setSending(null);
    }
  }

  async function handleLogResponse(outreachId: string) {
    setResponseModal(outreachId);
  }

  async function submitResponse() {
    if (!responseModal || !responseText.trim()) return;
    setSending(responseModal);
    try {
      const { data, error } = await supabase.functions.invoke("vendor-outreach", {
        body: { action: "log_response", outreach_id: responseModal, response_text: responseText },
      });
      if (error) throw new Error(error.message);
      toast.success(`Response logged — Vendor score: ${data.vendor_score}`);
      setResponseModal(null);
      setResponseText("");
      if (dealId) await loadData(dealId);
    } catch (e: any) {
      toast.error(e.message || "Failed to log response");
    } finally {
      setSending(null);
    }
  }

  async function handlePrepNegotiation(outreachId: string) {
    setSending(outreachId);
    try {
      const { data, error } = await supabase.functions.invoke("vendor-outreach", {
        body: { action: "prepare_negotiation", outreach_id: outreachId },
      });
      if (error) throw new Error(error.message);
      toast.success("Negotiation brief prepared");
      if (dealId) await loadData(dealId);
    } catch (e: any) {
      toast.error(e.message || "Negotiation prep failed");
    } finally {
      setSending(null);
    }
  }

  const CatIcon = deal ? categoryIcons[deal.category] || Sparkles : Sparkles;
  const stats = {
    total: outreachList.length,
    sent: outreachList.filter((o) => o.status !== "pending").length,
    responded: outreachList.filter((o) => ["responded", "negotiation_ready"].includes(o.status)).length,
    ready: outreachList.filter((o) => o.negotiation_ready).length,
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="container mx-auto px-6 max-w-5xl">
        <Link to={dealId ? `/sourcing?deal=${dealId}` : "/sourcing"} className="inline-flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft size={14} /> Back to Sourcing
        </Link>

        {loading ? (
          <div className="text-center py-20">
            <Loader2 size={24} className="animate-spin text-primary mx-auto" />
          </div>
        ) : !deal ? (
          <div className="text-center py-20">
            <p className="font-body text-sm text-muted-foreground">No deal selected. <Link to="/intake" className="text-primary hover:underline">Submit a request first</Link>.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-card border border-border flex items-center justify-center">
                  <CatIcon size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-body text-xs tracking-[0.3em] uppercase text-primary/60 mb-1">Phase 3 — Vendor Outreach</p>
                  <h1 className="font-display text-3xl md:text-4xl font-medium text-foreground mb-2">{deal.intent || deal.sub_category || "Deal"}</h1>
                  <div className="flex flex-wrap gap-3 font-body text-xs text-muted-foreground">
                    <span className="capitalize">{deal.category}</span>
                    <span>·</span>
                    <span>{deal.deal_number}</span>
                    <span>·</span>
                    <span>Priority: {deal.priority_score}</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              {outreachList.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mb-8">
                  {[
                    { label: "Total Vendors", value: stats.total, icon: Users },
                    { label: "Contacted", value: stats.sent, icon: Send },
                    { label: "Responded", value: stats.responded, icon: MessageSquare },
                    { label: "Negotiation Ready", value: stats.ready, icon: Target },
                  ].map((s) => (
                    <div key={s.label} className="bg-card border border-border p-4">
                      <s.icon size={14} className="text-primary/40 mb-2" />
                      <p className="font-display text-2xl text-foreground">{s.value}</p>
                      <p className="font-body text-[10px] tracking-wider uppercase text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Generate Button */}
              {outreachList.length === 0 && !generating && (
                <button onClick={generateOutreach}
                  className="flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground font-body text-xs tracking-widest uppercase hover:bg-primary/90 transition-all">
                  <Zap size={14} /> Generate Vendor Outreach
                </button>
              )}
            </motion.div>

            {/* Generating */}
            <AnimatePresence>
              {generating && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16">
                  <div className="inline-flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center">
                      <Loader2 size={24} className="animate-spin text-primary" />
                    </div>
                    <div>
                      <p className="font-display text-lg text-foreground mb-1">Preparing Vendor Outreach</p>
                      <p className="font-body text-xs text-muted-foreground">Crafting personalized messages with strategic negotiation angles…</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Outreach List */}
            {outreachList.length > 0 && !generating && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground">Vendor Communications</p>
                  <div className="flex items-center gap-3">
                    {stats.ready > 0 && (
                      <Link to={`/negotiation?deal=${dealId}`} className="font-body text-xs text-primary hover:underline flex items-center gap-1">
                        Phase 4: Negotiation <ArrowRight size={12} />
                      </Link>
                    )}
                    <Link to={`/sourcing?deal=${dealId}`} className="font-body text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                      View Sourcing <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
                {outreachList.map((o) => (
                  <OutreachCard
                    key={o.id}
                    outreach={o}
                    messages={messagesMap[o.id] || []}
                    expanded={expandedId === o.id}
                    onToggle={() => setExpandedId(expandedId === o.id ? null : o.id)}
                    onSendOutreach={handleSendOutreach}
                    onFollowUp={handleFollowUp}
                    onLogResponse={handleLogResponse}
                    onPrepNegotiation={handlePrepNegotiation}
                    sending={sending}
                  />
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Response Modal */}
      <AnimatePresence>
        {responseModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
            onClick={() => setResponseModal(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-card border border-border p-6 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}>
              <h3 className="font-display text-lg text-foreground mb-4">Log Vendor Response</h3>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Paste or type the vendor's response..."
                className="w-full h-40 bg-muted border border-border p-3 font-body text-sm text-foreground resize-none focus:outline-none focus:border-primary/50"
              />
              <div className="flex gap-3 mt-4">
                <button onClick={submitResponse} disabled={!responseText.trim() || sending === responseModal}
                  className="flex items-center gap-1.5 px-6 py-2 bg-primary text-primary-foreground font-body text-xs tracking-widest uppercase hover:bg-primary/90 disabled:opacity-50">
                  {sending === responseModal ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle2 size={10} />} Save Response
                </button>
                <button onClick={() => setResponseModal(null)}
                  className="px-6 py-2 bg-muted border border-border font-body text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
