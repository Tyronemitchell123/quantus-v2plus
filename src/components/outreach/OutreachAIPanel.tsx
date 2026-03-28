import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, Lightbulb, ToggleLeft, ToggleRight,
  Send, RefreshCw, CheckCircle2, FileText,
} from "lucide-react";

const categoryDrafts: Record<string, { title: string; preview: string }[]> = {
  aviation: [
    { title: "Negotiation draft for broker", preview: "We are seeking competitive terms for a super-mid..." },
    { title: "Availability confirmation", preview: "Please confirm current availability and..." },
  ],
  medical: [
    { title: "Clinic inquiry follow-up", preview: "Following up on our request for executive screening..." },
    { title: "Scheduling confirmation", preview: "Please confirm the earliest available slots..." },
  ],
  staffing: [
    { title: "Candidate shortlist request", preview: "We require candidates meeting the following criteria..." },
    { title: "Reference verification", preview: "Please provide references for the shortlisted..." },
  ],
  lifestyle: [
    { title: "Charter availability check", preview: "Confirming availability for the specified dates..." },
    { title: "Experience customization", preview: "Our client has specific preferences regarding..." },
  ],
  logistics: [
    { title: "Transport quote request", preview: "Requesting a detailed quote for the recovery of..." },
    { title: "Insurance verification", preview: "Please confirm insurance coverage for high-value..." },
  ],
  partnerships: [
    { title: "Partnership proposal draft", preview: "We are exploring strategic partnership opportunities..." },
    { title: "Commission terms outline", preview: "Proposed commission structure for the arrangement..." },
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

  const drafts = categoryDrafts[category] || categoryDrafts.aviation;
  const responded = outreachList.filter((o) => o.status === "responded" || o.negotiation_ready);

  const insights = [
    responded.length > 0 && `${responded[0]?.vendor_name} has the fastest response time.`,
    outreachList.some((o) => o.negotiation_ready) && "One or more vendors are ready for negotiation.",
    outreachList.length > 2 && "Multiple vendors allow for competitive positioning.",
    "Quantus V2+ recommends a formal tone for initial outreach.",
  ].filter(Boolean) as string[];

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
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className="border border-border/50 rounded-lg p-3 hover:border-primary/20 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <p className="font-body text-[11px] text-foreground group-hover:text-primary transition-colors">{draft.title}</p>
                <Send size={9} className="text-muted-foreground/40 group-hover:text-primary transition-colors" />
              </div>
              <p className="font-body text-[10px] text-muted-foreground line-clamp-1">{draft.preview}</p>
            </motion.div>
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
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              className="flex items-start gap-2"
            >
              <Lightbulb size={10} className="text-primary/60 mt-0.5 shrink-0" />
              <p className="font-body text-[11px] text-foreground/70 leading-relaxed">{insight}</p>
            </motion.div>
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
              onClick={action.toggle}
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
