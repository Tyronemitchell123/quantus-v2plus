import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, Lightbulb, ToggleLeft, ToggleRight,
  Send, FileText, CheckCircle2, Copy,
} from "lucide-react";
import { toast } from "sonner";

const categoryDrafts: Record<string, { title: string; preview: string; body: string }[]> = {
  aviation: [
    { title: "Negotiation draft for broker", preview: "We are seeking competitive terms for a super-mid...", body: "We are seeking competitive terms for a super-mid jet charter. Our client requires flexible cancellation and guaranteed availability for the specified dates. Please respond with your best offer including all associated fees." },
    { title: "Availability confirmation", preview: "Please confirm current availability and...", body: "Please confirm current availability and provide a detailed breakdown of costs including positioning, fuel surcharges, and crew expenses. We require a response within 48 hours to proceed." },
  ],
  medical: [
    { title: "Clinic inquiry follow-up", preview: "Following up on our request for executive screening...", body: "Following up on our request for executive screening packages. We require confirmed availability, pricing for a comprehensive health assessment, and details of specialist consultants included in the programme." },
    { title: "Scheduling confirmation", preview: "Please confirm the earliest available slots...", body: "Please confirm the earliest available slots for our client. We require a minimum 2-hour consultation window with a senior specialist. Discretion and priority scheduling are essential." },
  ],
  staffing: [
    { title: "Candidate shortlist request", preview: "We require candidates meeting the following criteria...", body: "We require candidates meeting the following criteria: 5+ years experience, verified references, and immediate availability. Please provide CVs and expected compensation ranges within 72 hours." },
    { title: "Reference verification", preview: "Please provide references for the shortlisted...", body: "Please provide references for the shortlisted candidates. We require at least two professional references per candidate, ideally from their most recent engagements." },
  ],
  lifestyle: [
    { title: "Charter availability check", preview: "Confirming availability for the specified dates...", body: "Confirming availability for the specified dates. Our client requires a luxury vessel with full crew, catering provisions, and specific itinerary flexibility. Please provide options." },
    { title: "Experience customization", preview: "Our client has specific preferences regarding...", body: "Our client has specific preferences regarding the experience. Please confirm which customization options are available and any associated premium costs." },
  ],
  logistics: [
    { title: "Transport quote request", preview: "Requesting a detailed quote for the recovery of...", body: "Requesting a detailed quote for the recovery and transport of a high-value asset. Please include insurance coverage details, estimated timeline, and chain of custody documentation." },
    { title: "Insurance verification", preview: "Please confirm insurance coverage for high-value...", body: "Please confirm insurance coverage for high-value transport. We require proof of coverage up to the declared value, with named perils and transit-specific endorsements." },
  ],
  partnerships: [
    { title: "Partnership proposal draft", preview: "We are exploring strategic partnership opportunities...", body: "We are exploring strategic partnership opportunities in your sector. We believe there is mutual value in a referral arrangement. Please review the attached terms and confirm interest." },
    { title: "Commission terms outline", preview: "Proposed commission structure for the arrangement...", body: "Proposed commission structure for the arrangement: tiered rates based on deal value with quarterly settlements. Please review and propose any amendments." },
  ],
};

interface Props {
  outreachList: { status: string; vendor_name: string; negotiation_ready: boolean }[];
  messagesMap: Record<string, { direction: string }[]>;
  category: string;
}

const OutreachAIPanel = ({ outreachList, messagesMap, category }: Props) => {
  const [autoFollowUp, setAutoFollowUp] = useState(true);
  const [autoNegotiation, setAutoNegotiation] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState<number | null>(null);
  const [appliedInsight, setAppliedInsight] = useState<number | null>(null);

  const drafts = categoryDrafts[category] || categoryDrafts.aviation;
  const responded = outreachList.filter((o) => o.status === "responded" || o.negotiation_ready);

  const insights = [
    responded.length > 0 && `${responded[0]?.vendor_name} has the fastest response time.`,
    outreachList.some((o) => o.negotiation_ready) && "One or more vendors are ready for negotiation.",
    outreachList.length > 2 && "Multiple vendors allow for competitive positioning.",
    "Quantus V2+ recommends a formal tone for initial outreach.",
  ].filter(Boolean) as string[];

  const handleCopyDraft = async (index: number, draft: typeof drafts[0]) => {
    try {
      await navigator.clipboard.writeText(draft.body);
      setCopiedDraft(index);
      toast.success(`"${draft.title}" copied to clipboard`);
      setTimeout(() => setCopiedDraft(null), 2000);
    } catch {
      toast.info(draft.body.slice(0, 100) + "…", { description: "Draft message ready" });
    }
  };

  const handleApplyInsight = (index: number, insight: string) => {
    setAppliedInsight(index);
    toast.success("Recommendation noted", { description: insight });
    setTimeout(() => setAppliedInsight(null), 2000);
  };

  return (
    <div className="space-y-4">
      <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-soft/50 mb-2">
        Negotiation & AI Actions
      </p>

      {/* Drafted Messages */}
      <div className="glass-card rounded-xl p-5 border-primary/10">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={12} className="text-primary" />
          <span className="font-display text-xs text-foreground">Drafted Messages</span>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex-1 h-px bg-primary/20 origin-left"
          />
        </div>
        <div className="space-y-2">
          {drafts.map((draft, i) => (
            <motion.button
              key={i}
              type="button"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              onClick={(e) => { e.stopPropagation(); handleCopyDraft(i, draft); }}
              className="w-full text-left border border-border/50 rounded-lg p-3 hover:border-primary/20 transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="font-body text-[11px] text-foreground group-hover:text-primary transition-colors">{draft.title}</p>
                {copiedDraft === i ? (
                  <CheckCircle2 size={9} className="text-success shrink-0" />
                ) : (
                  <Copy size={9} className="text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                )}
              </div>
              <p className="font-body text-[10px] text-muted-foreground line-clamp-1">{draft.preview}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="glass-card rounded-xl p-5 border-primary/10">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={12} className="text-primary" />
          <span className="font-display text-xs text-foreground">AI Recommendations</span>
        </div>
        <div className="space-y-2.5">
          {insights.map((insight, i) => (
            <motion.button
              key={i}
              type="button"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              onClick={(e) => { e.stopPropagation(); handleApplyInsight(i, insight); }}
              className="w-full flex items-start gap-2 text-left hover:bg-primary/5 rounded-lg p-1.5 -m-1.5 transition-colors group"
            >
              {appliedInsight === i ? (
                <CheckCircle2 size={10} className="text-success mt-0.5 shrink-0" />
              ) : (
                <Lightbulb size={10} className="text-primary/60 group-hover:text-primary mt-0.5 shrink-0" />
              )}
              <p className="font-body text-[11px] text-foreground/70 leading-relaxed group-hover:text-foreground transition-colors">{insight}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Auto-Actions */}
      <div className="glass-card rounded-xl p-5 border-primary/10">
        <p className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-3">Auto-Actions</p>
        <div className="space-y-3">
          {[
            { label: "Auto Follow-ups", desc: "Send follow-ups after 24h of no response", active: autoFollowUp, toggle: () => setAutoFollowUp(!autoFollowUp) },
            { label: "Auto Negotiation", desc: "Generate negotiation briefs when vendors respond", active: autoNegotiation, toggle: () => setAutoNegotiation(!autoNegotiation) },
          ].map((action) => (
            <button
              key={action.label}
              onClick={(e) => { e.stopPropagation(); action.toggle(); }}
              className="w-full flex items-center justify-between p-2.5 border border-border/50 rounded-lg hover:border-primary/20 transition-all"
            >
              <div className="text-left">
                <p className="font-body text-[11px] text-foreground">{action.label}</p>
                <p className="font-body text-[9px] text-muted-foreground">{action.desc}</p>
              </div>
              {action.active ? (
                <ToggleRight size={18} className="text-primary shrink-0" />
              ) : (
                <ToggleLeft size={18} className="text-muted-foreground/40 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OutreachAIPanel;