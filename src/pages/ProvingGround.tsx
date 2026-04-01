import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useDocumentHead from "@/hooks/use-document-head";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import MobileBottomNav from "@/components/mobile/MobileBottomNav";
import ParticleGrid from "@/components/ParticleGrid";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import {
  Plane, Shield, Lock, TrendingDown, TrendingUp, Zap, Clock,
  ArrowUpRight, Send, Loader2, Terminal, CheckCircle2, Eye,
  AlertTriangle, Gauge,
} from "lucide-react";

// Mock arbitrage data (replaced by Firecrawl in production)
const mockArbitrageDeals = [
  { id: 1, origin: "London Luton", destination: "Teterboro, NJ", aircraft: "G650", tail: "G650-N12345", internalPrice: 4200000, competitorPrice: 4850000, competitor: "VistaJet", expiresIn: "8h", isPerishing: true },
  { id: 2, origin: "Paris Le Bourget", destination: "Dubai Al Maktoum", aircraft: "Global 7500", tail: "GL7T-C-GXRS", internalPrice: 6800000, competitorPrice: 7200000, competitor: "AirCharterService", expiresIn: "36h", isPerishing: false },
  { id: 3, origin: "Nice Côte d'Azur", destination: "London City", aircraft: "Citation X", tail: "C750-G-LEAA", internalPrice: 980000, competitorPrice: 1250000, competitor: "NetJets", expiresIn: "4h", isPerishing: true },
  { id: 4, origin: "Geneva", destination: "Moscow Vnukovo", aircraft: "Falcon 8X", tail: "F8X-VP-BNE", internalPrice: 3200000, competitorPrice: 3100000, competitor: "GlobeAir", expiresIn: "24h", isPerishing: false },
];

const mockGhostedLeads = [
  { id: 1, name: "Mr. Sterling", tail: "G650-N12345", route: "LTN → TEB", value: 4200000, lastContact: "12 days ago", savings: 650000 },
  { id: 2, name: "Lady Ashworth", tail: "GL7T-C-GXRS", route: "LBG → DXB", value: 6800000, lastContact: "8 days ago", savings: 400000 },
  { id: 3, name: "Dr. Nazari", tail: "C750-G-LEAA", route: "NCE → LCY", value: 980000, lastContact: "21 days ago", savings: 270000 },
  { id: 4, name: "Sheikh Al-Fahim", tail: "F8X-VP-BNE", route: "GVA → VKO", value: 3200000, lastContact: "5 days ago", savings: 0 },
  { id: 5, name: "Mrs. Chen-Whitfield", tail: "G650-N12345", route: "LTN → LAX", value: 8500000, lastContact: "15 days ago", savings: 1200000 },
];

const auditLog = [
  { time: "08:00", text: "System boot — Pilot tenant Bitlux_Pilot_01 authenticated." },
  { time: "08:01", text: "Firecrawl initiated manifest scan — 4 routes parsed." },
  { time: "08:03", text: "Arbitrage detected: G650-N12345 LTN→TEB — $6,500 below VistaJet." },
  { time: "08:05", text: "Claude drafted 5 recovery messages for ghosted HNW leads." },
  { time: "08:06", text: "All credentials verified — AES-256 Vault status: GREEN." },
];

const ProvingGround = () => {
  useDocumentHead({ title: "Proving Ground — Quantus V2+", description: "Tier-1 charter broker pilot dashboard." });
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [approved, setApproved] = useState<Set<number>>(new Set());

  const formatCents = (cents: number) => `$${(cents / 100).toLocaleString("en-US")}`;

  const generateDraft = async (lead: typeof mockGhostedLeads[0]) => {
    setGenerating(true);
    try {
      // Simulate AI draft generation
      await new Promise(r => setTimeout(r, 1500));
      const draft = `Mr. ${lead.name.split(" ").pop()}, I'm reaching out regarding ${lead.tail} on the ${lead.route} route. We've identified a ${formatCents(lead.savings)} saving compared to current market rates — this positions your ${lead.route.split("→")[1]?.trim()} arrival at a significantly better value than the $${(lead.value / 100).toLocaleString()} public listing. Given the asset expires within hours, I've secured a 30-minute priority window for your consideration.`;
      setDrafts(prev => ({ ...prev, [lead.id]: draft }));
      toast.success(`Draft generated for ${lead.name}`);
    } catch {
      toast.error("Draft generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const approveDraft = (leadId: number) => {
    setApproved(prev => new Set(prev).add(leadId));
    toast.success("Approved — WhatsApp dispatch logged. 10% commission timer started.");
  };

  const totalLeakage = mockArbitrageDeals.reduce((s, d) => {
    const delta = d.competitorPrice - d.internalPrice;
    return s + (delta > 0 ? delta : 0);
  }, 0);

  const perishingCount = mockArbitrageDeals.filter(d => d.isPerishing).length;

  return (
    <div className="min-h-screen bg-background flex relative">
      <div className="fixed inset-0 pointer-events-none opacity-10 z-0"><ParticleGrid /></div>
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background: "radial-gradient(ellipse at center, transparent 60%, hsl(var(--background)) 100%)" }} />

      <DashboardSidebar />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <DashboardTopBar onMobileMenuToggle={() => {}} notifications={[]} />

        {/* Tenant Header */}
        <div className="border-b border-border/50 bg-card/50 px-4 md:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Plane size={16} className="text-primary" />
              </div>
              <div>
                <h1 className="font-display text-sm font-semibold text-foreground">Proving Ground — Bitlux Aviation</h1>
                <p className="font-body text-[10px] text-muted-foreground">Tenant: Bitlux_Pilot_01 • Sector: Aviation • RLS: Isolated</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Hardened Audit Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
                <Shield size={12} className="text-emerald-400" />
                <span className="font-body text-[9px] tracking-[0.15em] uppercase text-emerald-400">Hardened Audit</span>
              </div>
              {/* Vault Status */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/5">
                <Lock size={12} className="text-primary" />
                <span className="font-body text-[9px] tracking-[0.15em] uppercase text-primary">AES-256 Vault: Active</span>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24 lg:pb-8 space-y-6">
          {/* KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Revenue Advantage", value: formatCents(totalLeakage), icon: TrendingUp, accent: "text-emerald-400" },
              { label: "Perishing Assets", value: String(perishingCount), icon: AlertTriangle, accent: "text-amber-400" },
              { label: "Ghosted HNW Leads", value: String(mockGhostedLeads.length), icon: Eye, accent: "text-red-400" },
              { label: "Commission Potential", value: formatCents(Math.floor(totalLeakage * 0.1)), icon: Zap, accent: "text-[#D4AF37]" },
            ].map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <kpi.icon size={14} className={kpi.accent} />
                  <span className="font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground">{kpi.label}</span>
                </div>
                <p className="font-display text-xl font-semibold text-foreground">{kpi.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Arbitrage Tracker */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Gauge size={16} className="text-primary" />
              <h2 className="font-display text-sm font-semibold text-foreground">Arbitrage Tracker</h2>
              <span className="ml-auto font-body text-[10px] text-muted-foreground">Bitlux Manifest vs Market</span>
            </div>

            <div className="space-y-2">
              {mockArbitrageDeals.map((deal, i) => {
                const delta = deal.competitorPrice - deal.internalPrice;
                const deltaPct = ((delta / deal.competitorPrice) * 100).toFixed(1);
                const isAdvantage = delta > 0;

                return (
                  <motion.div
                    key={deal.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className={`glass-card p-4 flex items-center gap-4 transition-all ${
                      deal.isPerishing
                        ? "border-[#D4AF37]/30 shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                        : ""
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${deal.isPerishing ? "bg-[#D4AF37]/10 text-[#D4AF37]" : "bg-primary/10 text-primary"}`}>
                      <Plane size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-xs text-foreground truncate">
                        {deal.tail} — {deal.origin} → {deal.destination}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="font-body text-[10px] text-muted-foreground">{deal.aircraft}</span>
                        <span className="font-body text-[10px] text-muted-foreground">vs {deal.competitor}</span>
                        <span className="font-body text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock size={10} /> {deal.expiresIn}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display text-sm font-medium text-foreground">{formatCents(deal.internalPrice)}</p>
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        {isAdvantage ? (
                          <>
                            <TrendingDown size={10} className="text-emerald-400" />
                            <span className="font-body text-[10px] text-emerald-400">{deltaPct}% below</span>
                          </>
                        ) : (
                          <>
                            <TrendingUp size={10} className="text-red-400" />
                            <span className="font-body text-[10px] text-red-400">{Math.abs(Number(deltaPct))}% above</span>
                          </>
                        )}
                      </div>
                    </div>
                    {deal.isPerishing && (
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="px-2 py-1 rounded border border-[#D4AF37]/40 bg-[#D4AF37]/10"
                      >
                        <span className="font-body text-[8px] tracking-[0.2em] uppercase text-[#D4AF37]">Perishing</span>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* One-Tap Closer */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Send size={16} className="text-primary" />
              <h2 className="font-display text-sm font-semibold text-foreground">One-Tap Closer — Ghosted HNW Leads</h2>
            </div>

            <div className="space-y-3">
              {mockGhostedLeads.map((lead, i) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  className="glass-card p-4 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-lg bg-red-400/10 text-red-400">
                      <Eye size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-xs text-foreground">{lead.name}</p>
                      <p className="font-body text-[10px] text-muted-foreground">
                        {lead.tail} • {lead.route} • Ghosted {lead.lastContact}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display text-sm font-medium text-foreground">{formatCents(lead.value)}</p>
                      {lead.savings > 0 && (
                        <p className="font-body text-[10px] text-emerald-400">Saves {formatCents(lead.savings)}</p>
                      )}
                    </div>
                  </div>

                  {/* Draft area */}
                  {drafts[lead.id] ? (
                    <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
                      <p className="font-mono text-[11px] text-foreground/80 leading-relaxed">{drafts[lead.id]}</p>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-2">
                    {!drafts[lead.id] && (
                      <button
                        onClick={() => generateDraft(lead)}
                        disabled={generating}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-body tracking-wider uppercase border border-primary/30 text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                      >
                        {generating ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                        Generate Draft
                      </button>
                    )}

                    {drafts[lead.id] && !approved.has(lead.id) && (
                      <button
                        onClick={() => approveDraft(lead.id)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-body tracking-wider uppercase transition-all duration-300 bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/10 border border-[#D4AF37]/40 text-[#D4AF37] hover:border-[#D4AF37]/60 hover:shadow-[0_0_25px_rgba(212,175,55,0.2)]"
                      >
                        <Send size={13} />
                        Approve & Send to WhatsApp
                      </button>
                    )}

                    {approved.has(lead.id) && (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
                        <CheckCircle2 size={13} className="text-emerald-400" />
                        <span className="font-body text-[10px] tracking-wider uppercase text-emerald-400">Sent — Commission Timer Active</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Security Hand-Off & Audit Terminal */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Vault Status Card */}
            <div className="glass-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Lock size={14} className="text-primary" />
                <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Vault Status</span>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Encryption", value: "AES-256-GCM", status: "active" },
                  { label: "Client Credentials", value: "Encrypted at Rest", status: "active" },
                  { label: "API Keys", value: "Supabase Vault", status: "active" },
                  { label: "PII Exposure", value: "Zero Client-Side", status: "active" },
                  { label: "RLS Isolation", value: "Bitlux_Pilot_01 Only", status: "active" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="font-body text-[11px] text-muted-foreground">{item.label}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-body text-[11px] text-foreground">{item.value}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Terminal */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Terminal size={14} className="text-primary" />
                <span className="font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Audit Terminal</span>
              </div>
              <div className="bg-muted/20 rounded-lg p-3 space-y-1.5 max-h-48 overflow-y-auto font-mono text-[11px]">
                {auditLog.map((entry, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-primary shrink-0">[{entry.time}]</span>
                    <span className="text-foreground/70">{entry.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        <footer className="hidden lg:flex px-6 py-3 border-t border-border/50 items-center justify-between">
          <p className="font-body text-[9px] tracking-[0.2em] uppercase text-muted-foreground/40">Quantus V2+ — Proving Ground</p>
          <p className="font-body text-[9px] text-muted-foreground/30">Pilot: Bitlux_Pilot_01</p>
        </footer>
      </div>

      <MobileBottomNav onAIOpen={() => {}} onMessagingOpen={() => {}} onTabChange={() => {}} activeTab="feed" />
    </div>
  );
};

export default ProvingGround;
