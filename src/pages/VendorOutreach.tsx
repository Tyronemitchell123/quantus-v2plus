import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane, Heart, Users, Globe, Truck, Handshake, Sparkles, Loader2,
  Send, MessageSquare, Clock, CheckCircle2, AlertTriangle,
  ChevronDown, ChevronUp, Mail, Phone, Building2, FileText, Zap,
  RefreshCw, Shield, Target, ArrowRight, User, MailOpen, Reply,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import useDocumentHead from "@/hooks/use-document-head";
import { sendDealPhaseEmail } from "@/lib/deal-phase-emails";
import DealPhaseLayout from "@/components/deal/DealPhaseLayout";
import OutreachTimeline from "@/components/outreach/OutreachTimeline";
import OutreachVendorCards from "@/components/outreach/OutreachVendorCards";
import OutreachAIPanel from "@/components/outreach/OutreachAIPanel";

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

export default function VendorOutreachPage() {
  const navigate = useNavigate();
  useDocumentHead({
    title: "Vendor Outreach — Quantus V2+",
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

      // Send vendor match email (non-blocking)
      if (deal) {
        sendDealPhaseEmail({
          template: "deal_vendor_match",
          data: { dealNumber: deal.deal_number, vendorCount: data.total },
        });
      }
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
    <DealPhaseLayout
      dealId={dealId}
      currentPhase={3}
      phaseTitle="Vendor Outreach & Engagement"
      showBottomBar={stats.ready > 0}
      onApprove={stats.ready > 0 ? () => window.location.href = `/negotiation?deal=${dealId}` : undefined}
      approveLabel="Proceed to Negotiation"
    >
      <div className="flex-1 min-h-0">
        {loading ? (
          <div className="text-center py-20">
            <Loader2 size={24} className="animate-spin text-primary mx-auto" />
          </div>
        ) : !deal ? (
          <div className="text-center py-20">
            <p className="font-body text-sm text-muted-foreground">
              No deal selected.{" "}
              <Link to="/intake" className="text-primary hover:underline">Submit a request first</Link>.
            </p>
          </div>
        ) : (
          <div className="container mx-auto px-4 md:px-6 max-w-7xl py-6 md:py-8">
            {/* Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center">
                  <CatIcon size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h1 className="font-display text-2xl md:text-3xl font-medium text-foreground mb-1">
                    Engaging your private network.
                  </h1>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="w-20 h-px bg-primary/40 origin-left mb-2"
                  />
                  <p className="font-body text-xs text-gold-soft/70">
                    Quantus V2+ is contacting verified vendors and securing availability.
                  </p>
                </div>
              </div>

              {/* Stats strip */}
              {outreachList.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Total Vendors", value: stats.total, icon: Users },
                    { label: "Contacted", value: stats.sent, icon: Send },
                    { label: "Responded", value: stats.responded, icon: MessageSquare },
                    { label: "Negotiation Ready", value: stats.ready, icon: Target },
                  ].map((s) => (
                    <motion.div
                      key={s.label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card rounded-xl p-4"
                    >
                      <s.icon size={14} className="text-primary/40 mb-2" />
                      <p className="font-display text-xl text-primary">{s.value}</p>
                      <p className="font-body text-[9px] tracking-[0.15em] uppercase text-muted-foreground">{s.label}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Generate CTA */}
            {outreachList.length === 0 && !generating && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-xl p-8 text-center mb-8"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Zap size={24} className="text-primary" />
                </div>
                <h2 className="font-display text-xl font-medium text-foreground mb-2">Ready to Engage Vendors</h2>
                <p className="font-body text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                  Quantus V2+ will craft personalized outreach with strategic negotiation angles for each vendor.
                </p>
                <button
                  onClick={generateOutreach}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-body text-xs tracking-[0.25em] uppercase hover:brightness-110 transition-all rounded-xl gold-glow"
                >
                  <Zap size={14} /> Generate Vendor Outreach
                </button>
              </motion.div>
            )}

            {/* Generating animation */}
            <AnimatePresence>
              {generating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16"
                >
                  <div className="inline-flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-2 border-primary/20 flex items-center justify-center">
                      <Loader2 size={24} className="animate-spin text-primary" />
                    </div>
                    <p className="font-display text-lg text-foreground mb-1">Preparing Vendor Outreach</p>
                    <p className="font-body text-xs text-muted-foreground">Crafting personalized messages with strategic negotiation angles…</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 3-Column Operational Grid */}
            {outreachList.length > 0 && !generating && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="grid lg:grid-cols-[1fr_1.5fr_1fr] gap-6">
                  {/* Left — Outreach Timeline */}
                  <OutreachTimeline outreachList={outreachList} messagesMap={messagesMap} />

                  {/* Center — Vendor Cards */}
                  <OutreachVendorCards
                    outreachList={outreachList}
                    messagesMap={messagesMap}
                    expandedId={expandedId}
                    setExpandedId={setExpandedId}
                    onSendOutreach={handleSendOutreach}
                    onFollowUp={handleFollowUp}
                    onLogResponse={handleLogResponse}
                    onPrepNegotiation={handlePrepNegotiation}
                    sending={sending}
                  />

                  {/* Right — AI Actions Panel */}
                  <OutreachAIPanel
                    outreachList={outreachList}
                    messagesMap={messagesMap}
                    category={deal.category}
                  />
                </div>

                {/* Review CTA */}
                {stats.ready > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6"
                  >
                    <Link
                      to={`/negotiation?deal=${dealId}`}
                      className="flex items-center justify-between glass-card rounded-xl p-5 border-primary/20 hover:border-primary/40 transition-all group"
                    >
                      <div>
                        <p className="font-body text-[10px] tracking-[0.2em] uppercase text-primary/60 mb-1">Outreach Complete</p>
                        <p className="font-body text-sm text-foreground">{stats.ready} vendor{stats.ready > 1 ? "s" : ""} ready for negotiation</p>
                      </div>
                      <div className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-body text-[10px] tracking-[0.2em] uppercase rounded-lg group-hover:brightness-110 transition-all gold-glow">
                        Review Responses <ArrowRight size={12} />
                      </div>
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Response Modal */}
      <AnimatePresence>
        {responseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
            onClick={() => setResponseModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="glass-card rounded-xl p-6 max-w-lg w-full border-primary/20"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display text-lg text-foreground mb-4">Log Vendor Response</h3>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Paste or type the vendor's response..."
                className="w-full h-40 bg-card border border-border rounded-lg p-3 font-body text-sm text-foreground resize-none focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground/40"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={submitResponse}
                  disabled={!responseText.trim() || sending === responseModal}
                  className="flex items-center gap-1.5 px-6 py-2.5 bg-primary text-primary-foreground font-body text-[10px] tracking-[0.2em] uppercase rounded-lg hover:brightness-110 disabled:opacity-50 transition-all"
                >
                  {sending === responseModal ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle2 size={10} />} Save Response
                </button>
                <button
                  onClick={() => setResponseModal(null)}
                  className="px-6 py-2.5 border border-border font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DealPhaseLayout>
  );
}
