import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, FileText, CreditCard, Package, ArrowRight, Shield, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import useDocumentHead from "@/hooks/use-document-head";

const PHASES = ["intake", "sourcing", "matching", "shortlisted", "negotiation", "execution", "completed"];

const TrackDeal = () => {
  useDocumentHead({ title: "Track Your Deal — Quantus V2+", description: "Track the progress of your deal in real-time." });
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setError("No tracking token provided"); setLoading(false); return; }

    const fetchDeal = async () => {
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/deal-share?token=${token}`,
          { headers: { "Content-Type": "application/json" } }
        );
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load deal");
      } finally {
        setLoading(false);
      }
    };
    fetchDeal();
  }, [token]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="glass-card p-8 rounded-2xl max-w-md text-center">
        <Shield className="w-12 h-12 text-destructive mx-auto mb-4" />
        <h1 className="text-lg font-display text-foreground mb-2">Link Invalid or Expired</h1>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    </div>
  );

  const deal = data?.deal;
  const docs = data?.documents || [];
  const invoices = data?.invoices || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-6 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <p className="font-body text-[10px] tracking-[0.3em] uppercase text-primary/60 mb-2">Deal Tracker</p>
          <h1 className="text-2xl font-display text-foreground mb-1">Deal #{deal?.number}</h1>
          <p className="text-sm text-muted-foreground capitalize">{deal?.category} — {deal?.status}</p>
        </motion.div>

        {/* Progress bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-6 rounded-2xl mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-body text-muted-foreground">Phase {deal?.phase} of {deal?.totalPhases}</span>
            <span className="text-xs font-body text-primary">{deal?.progressPercent}%</span>
          </div>
          <div className="h-2 bg-border/30 rounded-full overflow-hidden mb-6">
            <motion.div className="h-full bg-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${deal?.progressPercent}%` }} transition={{ duration: 1, delay: 0.3 }} />
          </div>
          <div className="flex justify-between">
            {PHASES.map((phase, i) => {
              const isActive = i < (deal?.phase || 0);
              const isCurrent = i === (deal?.phase || 0) - 1;
              return (
                <div key={phase} className="flex flex-col items-center gap-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] ${
                    isActive ? "bg-primary text-primary-foreground" : isCurrent ? "border-2 border-primary text-primary" : "border border-border/50 text-muted-foreground/40"
                  }`}>
                    {isActive ? <CheckCircle2 size={12} /> : i + 1}
                  </div>
                  <span className={`text-[8px] uppercase tracking-wider hidden sm:block ${isActive ? "text-primary" : "text-muted-foreground/40"}`}>
                    {phase}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Documents */}
        {docs.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6 rounded-2xl mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={14} className="text-primary/60" />
              <span className="text-[11px] font-body uppercase tracking-[0.2em] text-muted-foreground">Documents</span>
            </div>
            <div className="space-y-2">
              {docs.map((doc: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                  <span className="text-xs text-foreground">{doc.title}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    doc.status === "signed" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>{doc.status}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Invoices */}
        {invoices.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6 rounded-2xl mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={14} className="text-primary/60" />
              <span className="text-[11px] font-body uppercase tracking-[0.2em] text-muted-foreground">Invoices</span>
            </div>
            <div className="space-y-2">
              {invoices.map((inv: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                  <div>
                    <span className="text-xs text-foreground">{inv.number}</span>
                    <span className="text-xs text-muted-foreground ml-2">{inv.amount}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    inv.status === "paid" ? "bg-primary/10 text-primary" : "bg-amber-500/10 text-amber-500"
                  }`}>{inv.status}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <div className="text-center mt-10">
          <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/40">
            Powered by Quantus V2+ — The Obsidian Standard
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrackDeal;
