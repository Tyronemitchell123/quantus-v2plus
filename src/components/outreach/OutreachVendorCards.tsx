import { motion, AnimatePresence } from "framer-motion";
import {
  Send, MessageSquare, Clock, CheckCircle2, AlertTriangle,
  ChevronDown, ChevronUp, Mail, Phone, Building2, FileText,
  RefreshCw, Shield, Target, User, MailOpen, Reply, Loader2,
} from "lucide-react";
import OutreachResponseTimer from "./OutreachResponseTimer";

type VendorOutreach = {
  id: string;
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
  negotiation_ready: boolean;
  negotiation_prep: Record<string, any>;
  documents_requested: string[];
  created_at: string;
};

type VendorMessage = {
  id: string;
  outreach_id: string;
  direction: string;
  subject: string | null;
  body: string;
  metadata: Record<string, any>;
};

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: "Pending", color: "text-accent border-accent/30 bg-accent/10", icon: Clock },
  sent: { label: "Contacted", color: "text-primary border-primary/30 bg-primary/10", icon: Send },
  responded: { label: "Responded", color: "text-success border-success/30 bg-success/10", icon: Reply },
  negotiation_ready: { label: "Negotiating", color: "text-primary border-primary/30 bg-primary/10", icon: Target },
  closed: { label: "Closed", color: "text-muted-foreground border-border bg-secondary/30", icon: CheckCircle2 },
};

interface Props {
  outreachList: VendorOutreach[];
  messagesMap: Record<string, VendorMessage[]>;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  onSendOutreach: (id: string) => void;
  onFollowUp: (id: string) => void;
  onLogResponse: (id: string) => void;
  onPrepNegotiation: (id: string) => void;
  sending: string | null;
}

const OutreachVendorCards = ({
  outreachList, messagesMap, expandedId, setExpandedId,
  onSendOutreach, onFollowUp, onLogResponse, onPrepNegotiation, sending,
}: Props) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-soft/50">
          Vendor Communications ({outreachList.length})
        </p>
      </div>

      <div className="space-y-3">
        {outreachList.map((o, i) => {
          const st = statusConfig[o.status] || statusConfig.pending;
          const StIcon = st.icon;
          const expanded = expandedId === o.id;
          const msgs = messagesMap[o.id] || [];
          const initialMsg = msgs.find((m) => m.direction === "outbound" && !m.metadata?.type);
          const responses = msgs.filter((m) => m.direction === "inbound");

          return (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`glass-card rounded-xl overflow-hidden transition-all ${
                expanded ? "border-primary/30" : "hover:border-gold-soft/20"
              }`}
            >
              {/* Header */}
              <button onClick={() => setExpandedId(expanded ? null : o.id)} className="w-full text-left p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center shrink-0">
                  <User size={14} className="text-primary/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-body tracking-widest uppercase border rounded ${st.color}`}>
                      <StIcon size={9} /> {st.label}
                    </span>
                    {o.vendor_score > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-border text-[9px] font-body text-muted-foreground rounded">
                        <Shield size={8} /> {o.vendor_score}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-sm text-foreground truncate">{o.vendor_name}</h3>
                  {o.vendor_company && (
                    <p className="font-body text-[10px] text-muted-foreground flex items-center gap-1">
                      <Building2 size={9} /> {o.vendor_company}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                  {o.response_time_hours ? (
                    <p className="font-body text-[9px] text-success flex items-center gap-1 justify-end">
                      <Clock size={8} /> {o.response_time_hours}h
                    </p>
                  ) : (
                    <OutreachResponseTimer createdAt={o.created_at} status={o.status} />
                  )}
                </div>
                {expanded ? <ChevronUp size={14} className="text-muted-foreground shrink-0" /> : <ChevronDown size={14} className="text-muted-foreground shrink-0" />}
              </button>

              {/* Expanded content */}
              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                    style={{ pointerEvents: "auto" }}
                  >
                    <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4">
                      {/* Contact */}
                      <div className="flex flex-wrap gap-3 text-xs font-body">
                        {o.vendor_email && (
                          <span className="flex items-center gap-1 text-primary/70"><Mail size={10} /> {o.vendor_email}</span>
                        )}
                        {o.vendor_phone && (
                          <span className="flex items-center gap-1 text-foreground/60"><Phone size={10} /> {o.vendor_phone}</span>
                        )}
                      </div>

                      {/* Strategy */}
                      {o.outreach_strategy?.negotiation_angle && (
                        <div className="glass-card rounded-lg p-3">
                          <p className="font-body text-[9px] tracking-wider uppercase text-muted-foreground mb-1">Strategy</p>
                          <p className="font-body text-[11px] text-foreground/70">{o.outreach_strategy.negotiation_angle}</p>
                        </div>
                      )}

                      {/* Messages */}
                      {initialMsg && (
                        <div className="border border-border/50 bg-card/50 p-3 rounded-lg">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Send size={9} className="text-primary/60" />
                            <span className="font-body text-[9px] tracking-wider uppercase text-primary/60">Initial Outreach</span>
                          </div>
                          <p className="font-body text-[11px] text-foreground/70 whitespace-pre-wrap leading-relaxed line-clamp-4">{initialMsg.body}</p>
                        </div>
                      )}

                      {responses.map((msg) => (
                        <div key={msg.id} className="border border-success/20 bg-success/5 p-3 rounded-lg">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <MailOpen size={9} className="text-success" />
                            <span className="font-body text-[9px] tracking-wider uppercase text-success">Vendor Response</span>
                          </div>
                          <p className="font-body text-[11px] text-foreground/70 whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                        </div>
                      ))}

                      {/* Negotiation prep */}
                      {o.negotiation_ready && o.negotiation_prep?.leverage_points && (
                        <div className="glass-card rounded-lg p-3 border-primary/20">
                          <p className="font-body text-[9px] tracking-wider uppercase text-primary mb-2">Negotiation Brief</p>
                          <ul className="space-y-1">
                            {o.negotiation_prep.leverage_points.map((p: string, j: number) => (
                              <li key={j} className="font-body text-[10px] text-foreground/60 flex items-start gap-1.5">
                                <CheckCircle2 size={9} className="text-success shrink-0 mt-0.5" /> {p}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                        {o.status === "pending" && (
                          <button onClick={() => onSendOutreach(o.id)} disabled={sending === o.id}
                            className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground font-body text-[9px] tracking-widest uppercase rounded-lg hover:brightness-110 disabled:opacity-50 transition-all">
                            {sending === o.id ? <Loader2 size={9} className="animate-spin" /> : <Send size={9} />} Send Email
                          </button>
                        )}
                        {(o.status === "sent" || o.status === "pending") && (
                          <button onClick={() => onFollowUp(o.id)} disabled={sending === o.id}
                            className="flex items-center gap-1.5 px-3 py-2 border border-border font-body text-[9px] tracking-widest uppercase text-muted-foreground hover:text-foreground rounded-lg transition-all disabled:opacity-50">
                            <RefreshCw size={9} /> Follow Up
                          </button>
                        )}
                        {o.status !== "negotiation_ready" && (
                          <button onClick={() => onLogResponse(o.id)}
                            className="flex items-center gap-1.5 px-3 py-2 border border-border font-body text-[9px] tracking-widest uppercase text-muted-foreground hover:text-foreground rounded-lg transition-all">
                            <MessageSquare size={9} /> Log Response
                          </button>
                        )}
                        {o.status === "responded" && !o.negotiation_ready && (
                          <button onClick={() => onPrepNegotiation(o.id)} disabled={sending === o.id}
                            className="flex items-center gap-1.5 px-3 py-2 border border-primary/30 bg-primary/5 text-primary font-body text-[9px] tracking-widest uppercase rounded-lg hover:bg-primary/10 disabled:opacity-50 transition-all">
                            {sending === o.id ? <Loader2 size={9} className="animate-spin" /> : <Target size={9} />} Prep Negotiation
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default OutreachVendorCards;
