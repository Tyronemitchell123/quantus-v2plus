import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Briefcase, MessageSquare, FileText, BarChart3,
  DollarSign, Settings2, Bell, Star, Clock, CheckCircle2,
  ArrowRight, Upload, TrendingUp, AlertTriangle, Shield, Send,
  Paperclip, Globe, Phone, Mail, Users, ChevronRight, Building2,
} from "lucide-react";
import useDocumentHead from "@/hooks/use-document-head";
import ParticleGrid from "@/components/ParticleGrid";

type PortalSection = "dashboard" | "requests" | "messages" | "documents" | "performance" | "billing" | "settings";

const navItems: { key: PortalSection; icon: typeof LayoutDashboard; label: string }[] = [
  { key: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { key: "requests", icon: Briefcase, label: "Requests" },
  { key: "messages", icon: MessageSquare, label: "Messages" },
  { key: "documents", icon: FileText, label: "Documents" },
  { key: "performance", icon: BarChart3, label: "Performance" },
  { key: "billing", icon: DollarSign, label: "Billing" },
  { key: "settings", icon: Settings2, label: "Settings" },
];

/* ── mock data ────────────────────────────────────────── */
const mockRequests = [
  { id: "REQ-2741", category: "Aviation", title: "Super-mid charter — EBBR → OMDB", deadline: "Apr 12, 2026", responseTime: "4h", status: "Pending" as const },
  { id: "REQ-2738", category: "Medical", title: "Specialist consultation — orthopaedic surgery", deadline: "Apr 8, 2026", responseTime: "2h", status: "In Progress" as const },
  { id: "REQ-2735", category: "Staffing", title: "Private chef placement — London", deadline: "Apr 15, 2026", responseTime: "6h", status: "Completed" as const },
  { id: "REQ-2729", category: "Lifestyle", title: "Villa booking — Côte d'Azur, Jul 2026", deadline: "Apr 20, 2026", responseTime: "8h", status: "Pending" as const },
];

const mockMessages = [
  { id: 1, from: "Quantus Operations", preview: "Regarding REQ-2741 — can you confirm availability for the Falcon 8X?", time: "12 min ago", unread: true },
  { id: 2, from: "Quantus Operations", preview: "Updated requirements for REQ-2738 attached.", time: "2 hours ago", unread: true },
  { id: 3, from: "Quantus Operations", preview: "REQ-2735 successfully closed. Commission processed.", time: "1 day ago", unread: false },
];

const complianceDocs = [
  { name: "Non-Disclosure Agreement", status: "valid" as const, expires: "Dec 2026" },
  { name: "Professional Liability Insurance", status: "valid" as const, expires: "Sep 2026" },
  { name: "Business Registration Certificate", status: "valid" as const, expires: "Mar 2027" },
  { name: "Privacy Tier Alignment", status: "expiring" as const, expires: "May 2026" },
  { name: "Industry Accreditation", status: "missing" as const, expires: "—" },
];

const mockPayments = [
  { deal: "REQ-2735", description: "Private chef placement — London", amount: "£12,750", status: "Paid" as const, date: "Mar 28, 2026" },
  { deal: "REQ-2701", description: "Aviation charter — Teterboro", amount: "£24,500", status: "Paid" as const, date: "Mar 15, 2026" },
  { deal: "REQ-2738", description: "Medical consultation referral", amount: "£8,200", status: "Pending" as const, date: "Apr 15, 2026" },
  { deal: "REQ-2741", description: "Aviation charter — Brussels", amount: "£18,400", status: "Upcoming" as const, date: "Apr 30, 2026" },
];

const performanceMetrics = [
  { label: "Response Speed", value: "1.8h", pct: 92, benchmark: "Network avg: 3.2h" },
  { label: "Acceptance Rate", value: "94%", pct: 94, benchmark: "Network avg: 82%" },
  { label: "Reliability", value: "96%", pct: 96, benchmark: "Network avg: 89%" },
  { label: "Privacy Compliance", value: "100%", pct: 100, benchmark: "Required: 100%" },
  { label: "Deal Outcomes", value: "4.8/5", pct: 96, benchmark: "Network avg: 4.2" },
];

const statusColor = (s: string) =>
  s === "Pending" ? "text-[hsl(var(--gold))]" :
  s === "In Progress" ? "text-[hsl(var(--gold))]/80" :
  s === "Completed" ? "text-muted-foreground" : "text-muted-foreground";

const complianceColor = (s: string) =>
  s === "valid" ? "text-emerald-400" :
  s === "expiring" ? "text-amber-400" :
  "text-red-400";

/* ── stagger helpers ─────────────────────────────────── */
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const PartnerPortal = () => {
  useDocumentHead({ title: "Partner Portal — Quantus V2+", description: "Elite vendor operations suite." });
  const [section, setSection] = useState<PortalSection>("dashboard");
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [liveDeals, setLiveDeals] = useState<typeof mockRequests>([]);
  const [liveCommissions, setLiveCommissions] = useState<{ total: number; count: number }>({ total: 0, count: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const { supabase } = await import("@/integrations/supabase/client");
      
      // Fetch deals for requests view
      const { data: deals } = await supabase
        .from("deals")
        .select("id, deal_number, category, status, intent, created_at, updated_at, timeline_days")
        .order("updated_at", { ascending: false })
        .limit(20);

      if (deals && deals.length > 0) {
        const mapped = deals.map(d => ({
          id: d.deal_number,
          category: d.category.charAt(0).toUpperCase() + d.category.slice(1),
          title: d.intent || `${d.category} request`,
          deadline: d.timeline_days ? new Date(Date.now() + d.timeline_days * 86400000).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" }) : "Open",
          responseTime: "—",
          status: (d.status === "completed" ? "Completed" : d.status === "intake" || d.status === "sourcing" ? "Pending" : "In Progress") as "Pending" | "In Progress" | "Completed",
        }));
        setLiveDeals(mapped);
      }

      // Fetch commission totals
      const { data: commissions } = await supabase
        .from("commission_logs")
        .select("commission_cents, status");

      if (commissions && commissions.length > 0) {
        const total = commissions.reduce((sum, c) => sum + (c.commission_cents || 0), 0);
        setLiveCommissions({ total: Math.round(total / 100), count: commissions.filter(c => c.status === "paid").length });
      }
    };
    fetchData();
  }, []);

  const activeRequests = liveDeals.length > 0 ? liveDeals : mockRequests;
  const openRequest = activeRequests.find(r => r.id === selectedRequest);

  return (
    <div className="min-h-screen bg-[#0A0A0C] flex relative overflow-hidden">
      {/* Atmospheric */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015] z-0"><ParticleGrid /></div>
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background: "radial-gradient(ellipse at 50% 30%, rgba(212,175,55,0.03) 0%, transparent 60%)" }} />
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background: "linear-gradient(180deg, #0A0A0C 0%, #111114 100%)" }} />

      {/* ── Left Navigation Rail ─────────────────────── */}
      <motion.nav initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }}
        className="hidden lg:flex flex-col w-[72px] min-h-screen border-r border-[hsl(var(--gold))]/[0.08] bg-[#0A0A0C]/80 backdrop-blur-xl z-20 relative">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-[hsl(var(--gold))]/[0.08]">
          <span className="font-display text-[10px] tracking-[0.3em] text-[hsl(var(--gold))]">Q</span>
        </div>

        <div className="flex-1 flex flex-col items-center py-6 gap-1">
          {navItems.map((item) => {
            const active = section === item.key;
            return (
              <button key={item.key} onClick={() => { setSection(item.key); setSelectedRequest(null); }}
                className={`group relative w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-300 ${
                  active ? "bg-[hsl(var(--gold))]/[0.08]" : "hover:bg-[hsl(var(--gold))]/[0.04]"
                }`}>
                {active && <motion.div layoutId="nav-active" className="absolute left-0 w-[2px] h-6 bg-[hsl(var(--gold))] rounded-r" />}
                <item.icon size={16} strokeWidth={1.5} className={active ? "text-[hsl(var(--gold))]" : "text-[#F5F5F7]/40 group-hover:text-[#F5F5F7]/70"} />
                {/* Tooltip */}
                <span className="absolute left-14 px-2 py-1 bg-[#1A1A1E] border border-[hsl(var(--gold))]/10 text-[9px] tracking-wider text-[#F5F5F7]/70 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </motion.nav>

      {/* ── Main Content ─────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Top bar */}
        <header className="h-16 flex items-center justify-between px-6 lg:px-8 border-b border-[hsl(var(--gold))]/[0.08] bg-[#0A0A0C]/60 backdrop-blur-xl">
          {/* Mobile nav */}
          <div className="flex lg:hidden items-center gap-2 overflow-x-auto">
            {navItems.map(item => (
              <button key={item.key} onClick={() => { setSection(item.key); setSelectedRequest(null); }}
                className={`p-2 rounded-lg ${section === item.key ? "bg-[hsl(var(--gold))]/[0.08] text-[hsl(var(--gold))]" : "text-[#F5F5F7]/40"}`}>
                <item.icon size={16} strokeWidth={1.5} />
              </button>
            ))}
          </div>

          <div className="hidden lg:block">
            <h1 className="font-display text-lg text-[#F5F5F7]">Welcome back, <span className="text-[hsl(var(--gold))]">Falcon Aviation Group</span></h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--gold))]/[0.06] border border-[hsl(var(--gold))]/[0.12]">
              <Star size={10} className="text-[hsl(var(--gold))]" />
              <span className="font-body text-[10px] tracking-wider text-[hsl(var(--gold))]">Score: 94</span>
            </div>
            <button className="relative text-[#F5F5F7]/40 hover:text-[#F5F5F7]/70 transition-colors">
              <Bell size={16} strokeWidth={1.5} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[hsl(var(--gold))]" />
            </button>
          </div>
        </header>

        {/* Subtitle bar */}
        <div className="px-6 lg:px-8 py-3 border-b border-[hsl(var(--gold))]/[0.05]">
          <p className="font-body text-xs text-[hsl(var(--gold))]/50">
            Your active requests and performance metrics are ready.
          </p>
        </div>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={section + (selectedRequest || "")} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>

              {/* ════════ DASHBOARD ════════ */}
              {section === "dashboard" && !selectedRequest && (
                <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
                  {/* Metrics row */}
                  <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: "Response Time", value: "1.8h", icon: Clock },
                      { label: "Reliability", value: "96%", icon: CheckCircle2 },
                      { label: "Deals Active", value: String(activeRequests.filter(r => r.status !== "Completed").length || 18), icon: Briefcase },
                      { label: "Commission Earned", value: liveCommissions.total > 0 ? `£${(liveCommissions.total / 1000).toFixed(0)}K` : "£124K", icon: DollarSign },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="bg-[#111114]/80 border border-[hsl(var(--gold))]/[0.08] rounded-xl p-5 text-center backdrop-blur-sm">
                        <Icon size={14} className="text-[hsl(var(--gold))]/60 mx-auto mb-2" strokeWidth={1.5} />
                        <p className="font-display text-xl text-[hsl(var(--gold))] mb-1">{value}</p>
                        <p className="font-body text-[9px] tracking-[0.2em] uppercase text-[#F5F5F7]/30">{label}</p>
                      </div>
                    ))}
                  </motion.div>

                  {/* Active Requests panel */}
                  <motion.div variants={fadeUp}>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-display text-sm text-[#F5F5F7]">Active Requests</h2>
                      <button onClick={() => setSection("requests")} className="font-body text-[9px] tracking-[0.2em] uppercase text-[hsl(var(--gold))]/50 hover:text-[hsl(var(--gold))] transition-colors">View All</button>
                    </div>
                    <div className="space-y-3">
                      {activeRequests.filter(r => r.status !== "Completed").map((req, i) => (
                        <motion.div key={req.id} variants={fadeUp}
                          onClick={() => setSelectedRequest(req.id)}
                          className="bg-[#111114]/80 border border-[hsl(var(--gold))]/[0.08] rounded-xl p-5 flex items-center justify-between hover:border-[hsl(var(--gold))]/20 transition-all duration-300 cursor-pointer group">
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--gold))]/[0.06] flex items-center justify-center">
                              <Briefcase size={14} className="text-[hsl(var(--gold))]/60" strokeWidth={1.5} />
                            </div>
                            <div>
                              <p className="font-body text-xs text-[#F5F5F7] mb-0.5">{req.title}</p>
                              <p className="font-body text-[10px] text-[#F5F5F7]/30">{req.id} · {req.category} · Due {req.deadline}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`font-body text-[9px] tracking-[0.15em] uppercase ${statusColor(req.status)}`}>{req.status}</span>
                            <div className="flex items-center gap-1 text-[#F5F5F7]/20">
                              <Clock size={10} />
                              <span className="font-body text-[10px]">{req.responseTime}</span>
                            </div>
                            <ChevronRight size={14} className="text-[hsl(var(--gold))]/20 group-hover:text-[hsl(var(--gold))]/50 transition-colors" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Bottom row: Compliance + Performance */}
                  <div className="grid lg:grid-cols-2 gap-6">
                    {/* Compliance */}
                    <motion.div variants={fadeUp} className="bg-[#111114]/80 border border-[hsl(var(--gold))]/[0.08] rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Shield size={14} className="text-[hsl(var(--gold))]/60" strokeWidth={1.5} />
                        <h3 className="font-display text-sm text-[#F5F5F7]">Compliance & Documents</h3>
                      </div>
                      <div className="space-y-2.5">
                        {complianceDocs.slice(0, 4).map(doc => (
                          <div key={doc.name} className="flex items-center justify-between py-2 border-b border-[hsl(var(--gold))]/[0.04] last:border-0">
                            <div className="flex items-center gap-2">
                              {doc.status === "valid" ? <CheckCircle2 size={10} className="text-emerald-400" /> :
                               doc.status === "expiring" ? <AlertTriangle size={10} className="text-amber-400" /> :
                               <AlertTriangle size={10} className="text-red-400" />}
                              <p className="font-body text-[11px] text-[#F5F5F7]/70">{doc.name}</p>
                            </div>
                            <span className={`font-body text-[9px] tracking-wider uppercase ${complianceColor(doc.status)}/60`}>{doc.status === "valid" ? `Valid · ${doc.expires}` : doc.status}</span>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => setSection("documents")} className="mt-4 w-full py-2.5 border border-[hsl(var(--gold))]/[0.15] rounded-lg font-body text-[10px] tracking-[0.2em] uppercase text-[hsl(var(--gold))]/60 hover:bg-[hsl(var(--gold))]/[0.04] hover:text-[hsl(var(--gold))] transition-all">
                        Upload Document
                      </button>
                    </motion.div>

                    {/* Performance snapshot */}
                    <motion.div variants={fadeUp} className="bg-[#111114]/80 border border-[hsl(var(--gold))]/[0.08] rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <BarChart3 size={14} className="text-[hsl(var(--gold))]/60" strokeWidth={1.5} />
                        <h3 className="font-display text-sm text-[#F5F5F7]">Performance Metrics</h3>
                      </div>
                      <div className="space-y-3">
                        {performanceMetrics.slice(0, 4).map(m => (
                          <div key={m.label}>
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-body text-[10px] text-[#F5F5F7]/50">{m.label}</p>
                              <p className="font-body text-xs text-[hsl(var(--gold))]">{m.value}</p>
                            </div>
                            <div className="h-1 rounded-full bg-[hsl(var(--gold))]/[0.08] overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${m.pct}%` }} transition={{ duration: 1, delay: 0.3 }}
                                className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--gold))]/40 to-[hsl(var(--gold))]" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* ════════ REQUEST DETAIL ════════ */}
              {selectedRequest && openRequest && (
                <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
                  <button onClick={() => setSelectedRequest(null)} className="font-body text-[10px] tracking-[0.2em] uppercase text-[hsl(var(--gold))]/50 hover:text-[hsl(var(--gold))] transition-colors mb-2">← Back to {section === "dashboard" ? "Dashboard" : "Requests"}</button>

                  <motion.div variants={fadeUp} className="bg-[#111114]/80 border border-[hsl(var(--gold))]/[0.08] rounded-xl p-6">
                    <p className="font-body text-[9px] tracking-[0.3em] uppercase text-[hsl(var(--gold))]/40 mb-2">Request from Quantus V2+</p>
                    <h2 className="font-display text-lg text-[#F5F5F7] mb-1">{openRequest.title}</h2>
                    <p className="font-body text-[10px] text-[#F5F5F7]/30">{openRequest.id} · {openRequest.category} · Due {openRequest.deadline} · Response within {openRequest.responseTime}</p>
                  </motion.div>

                  {/* Requirements */}
                  <motion.div variants={fadeUp} className="bg-[#111114]/80 border border-[hsl(var(--gold))]/[0.08] rounded-xl p-6">
                    <h3 className="font-display text-sm text-[#F5F5F7] mb-4">Requirements</h3>
                    <div className="space-y-2">
                      {["Aircraft type: Super-mid or above", "Route: EBBR → OMDB, one-way", "Passengers: 6 adults", "Date: April 18, 2026", "Special: Catering for dietary restrictions, ground transport on arrival"].map((r, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <ChevronRight size={10} className="text-[hsl(var(--gold))]/40 mt-0.5 shrink-0" />
                          <p className="font-body text-xs text-[#F5F5F7]/60">{r}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Response form */}
                  <motion.div variants={fadeUp} className="bg-[#111114]/80 border border-[hsl(var(--gold))]/[0.08] rounded-xl p-6">
                    <h3 className="font-display text-sm text-[#F5F5F7] mb-4">Your Response</h3>
                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="font-body text-[9px] tracking-[0.2em] uppercase text-[#F5F5F7]/30 block mb-2">Pricing</label>
                        <input placeholder="e.g. £42,000" className="w-full bg-[#0A0A0C] border border-[hsl(var(--gold))]/[0.1] rounded-lg px-4 py-3 font-body text-sm text-[#F5F5F7] placeholder:text-[#F5F5F7]/20 focus:outline-none focus:border-[hsl(var(--gold))]/30 transition-colors" />
                      </div>
                      <div>
                        <label className="font-body text-[9px] tracking-[0.2em] uppercase text-[#F5F5F7]/30 block mb-2">Availability</label>
                        <input placeholder="e.g. Confirmed — Apr 18" className="w-full bg-[#0A0A0C] border border-[hsl(var(--gold))]/[0.1] rounded-lg px-4 py-3 font-body text-sm text-[#F5F5F7] placeholder:text-[#F5F5F7]/20 focus:outline-none focus:border-[hsl(var(--gold))]/30 transition-colors" />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="font-body text-[9px] tracking-[0.2em] uppercase text-[#F5F5F7]/30 block mb-2">Notes</label>
                      <textarea rows={3} placeholder="Additional details..." className="w-full bg-[#0A0A0C] border border-[hsl(var(--gold))]/[0.1] rounded-lg px-4 py-3 font-body text-sm text-[#F5F5F7] placeholder:text-[#F5F5F7]/20 focus:outline-none focus:border-[hsl(var(--gold))]/30 transition-colors resize-none" />
                    </div>
                    <div className="flex items-center gap-3">
                      <button className="flex items-center gap-2 px-3 py-2 border border-[hsl(var(--gold))]/[0.15] rounded-lg font-body text-[10px] text-[hsl(var(--gold))]/60 hover:bg-[hsl(var(--gold))]/[0.04] transition-colors">
                        <Upload size={12} /> Attach Files
                      </button>
                    </div>
                  </motion.div>

                  {/* AI Suggestions */}
                  <motion.div variants={fadeUp} className="bg-[#111114]/80 border border-[hsl(var(--gold))]/[0.12] rounded-xl p-6">
                    <p className="font-body text-[9px] tracking-[0.3em] uppercase text-[hsl(var(--gold))]/40 mb-3">Quantus V2+ Core Suggestions</p>
                    <div className="space-y-2">
                      {["Your typical rate for super-mid charters on this route is £38,000–£44,000.", "Similar past requests were accepted at £41,500 average.", "Adding ground transport increases acceptance probability by 22%."].map((s, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <TrendingUp size={10} className="text-[hsl(var(--gold))]/50 mt-0.5 shrink-0" />
                          <p className="font-body text-[11px] text-[#F5F5F7]/50">{s}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Submit */}
                  <motion.div variants={fadeUp}>
                    <button className="w-full py-4 bg-gradient-to-r from-[hsl(var(--gold))] to-[hsl(var(--gold-soft))] text-[#0A0A0C] font-body text-xs tracking-[0.25em] uppercase rounded-xl hover:opacity-90 transition-opacity">
                      Submit Response
                    </button>
                  </motion.div>
                </motion.div>
              )}

              {/* ════════ REQUESTS ════════ */}
              {section === "requests" && !selectedRequest && (
                <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
                  <motion.div variants={fadeUp} className="flex items-center justify-between">
                    <h2 className="font-display text-lg text-[#F5F5F7]">Active Requests</h2>
                    <div className="flex gap-2">
                      {["All", "Pending", "In Progress", "Completed"].map(f => (
                        <button key={f} className="px-3 py-1.5 border border-[hsl(var(--gold))]/[0.1] rounded-lg font-body text-[9px] tracking-[0.15em] uppercase text-[#F5F5F7]/30 hover:text-[hsl(var(--gold))] hover:border-[hsl(var(--gold))]/20 transition-colors">{f}</button>
                      ))}
                    </div>
                  </motion.div>

                  <div className="space-y-3">
                    {activeRequests.map((req) => (
                      <motion.div key={req.id} variants={fadeUp}
                        onClick={() => setSelectedRequest(req.id)}
                        className="bg-[#111114]/80 border border-[hsl(var(--gold))]/[0.08] rounded-xl p-5 hover:border-[hsl(var(--gold))]/20 transition-all duration-300 cursor-pointer group">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-body text-xs text-[#F5F5F7] mb-0.5">{req.title}</p>
                            <p className="font-body text-[10px] text-[#F5F5F7]/30">{req.id} · {req.category}</p>
                          </div>
                          <span className={`font-body text-[9px] tracking-[0.15em] uppercase ${statusColor(req.status)}`}>{req.status}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-[#F5F5F7]/20">
                              <Clock size={10} />
                              <span className="font-body text-[10px]">Respond within {req.responseTime}</span>
                            </div>
                            <span className="font-body text-[10px] text-[#F5F5F7]/20">Due {req.deadline}</span>
                          </div>
                          {req.status !== "Completed" && (
                            <button className="px-4 py-2 bg-gradient-to-r from-[hsl(var(--gold))] to-[hsl(var(--gold-soft))] text-[#0A0A0C] font-body text-[10px] tracking-[0.15em] uppercase rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              Respond Now
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ════════ MESSAGES ════════ */}
              {section === "messages" && (
                <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
                  <motion.div variants={fadeUp}>
                    <h2 className="font-display text-lg text-[#F5F5F7] mb-1">Messages</h2>
                    <p className="font-body text-[10px] text-[#F5F5F7]/30">Secure communications — no client identity disclosed.</p>
                  </motion.div>

                  <div className="space-y-3">
                    {mockMessages.map(msg => (
                      <motion.div key={msg.id} variants={fadeUp}
                        className={`bg-[#111114]/80 border rounded-xl p-5 hover:border-[hsl(var(--gold))]/20 transition-all duration-300 cursor-pointer ${msg.unread ? "border-[hsl(var(--gold))]/[0.15]" : "border-[hsl(var(--gold))]/[0.06]"}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {msg.unread && <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--gold))]" />}
                            <p className="font-body text-xs text-[#F5F5F7]">{msg.from}</p>
                          </div>
                          <span className="font-body text-[9px] text-[hsl(var(--gold))]/30">{msg.time}</span>
                        </div>
                        <p className="font-body text-[11px] text-[#F5F5F7]/40 leading-relaxed">{msg.preview}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Compose */}
                  <motion.div variants={fadeUp} className="bg-[#111114]/80 border border-[hsl(var(--gold))]/[0.08] rounded-xl p-5">
                    <p className="font-body text-[9px] tracking-[0.2em] uppercase text-[hsl(var(--gold))]/40 mb-3">New Message</p>
                    <textarea rows={3} placeholder="Type your message..." className="w-full bg-[#0A0A0C] border border-[hsl(var(--gold))]/[0.1] rounded-lg px-4 py-3 font-body text-sm text-[#F5F5F7] placeholder:text-[#F5F5F7]/20 focus:outline-none focus:border-[hsl(var(--gold))]/30 transition-colors resize-none mb-3" />
                    <div className="flex items-center justify-between">
                      <button className="flex items-center gap-1.5 text-[#F5F5F7]/20 hover:text-[hsl(var(--gold))]/50 transition-colors">
                        <Paperclip size={12} /> <span className="font-body text-[10px]">Attach</span>
                      </button>
                      <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[hsl(var(--gold))] to-[hsl(var(--gold-soft))] text-[#0A0A0C] font-body text-[10px] tracking-[0.15em] uppercase rounded-lg hover:opacity-90 transition-opacity">
                        <Send size={10} /> Send
                      </button>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* ════════ DOCUMENTS ════════ */}
              {section === "documents" && (
                <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
                  <motion.div variants={fadeUp}>
                    <h2 className="font-display text-lg text-[#F5F5F7] mb-1">Compliance & Documents</h2>
                    <p className="font-body text-[10px] text-[#F5F5F7]/30">Maintain trust and alignment with the Quantus network.</p>
                  </motion.div>

                  {/* Upload zone */}
                  <motion.div variants={fadeUp} className="bg-[#111114]/80 border-2 border-dashed border-[hsl(var(--gold))]/[0.12] rounded-xl p-10 text-center hover:border-[hsl(var(--gold))]/25 transition-colors cursor-pointer">
                    <Upload size={28} className="text-[hsl(var(--gold))]/20 mx-auto mb-3" strokeWidth={1.5} />
                    <p className="font-body text-xs text-[#F5F5F7]/40 mb-1">Drag & drop files here</p>
                    <p className="font-body text-[10px] text-[#F5F5F7]/20">or click to browse</p>
                  </motion.div>

                  {/* Doc list */}
                  <div className="space-y-2.5">
                    {complianceDocs.map(doc => (
                      <motion.div key={doc.name} variants={fadeUp}
                        className="bg-[#111114]/80 border border-[hsl(var(--gold))]/[0.08] rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {doc.status === "valid" ? <CheckCircle2 size={12} className="text-emerald-400" /> :
                           doc.status === "expiring" ? <AlertTriangle size={12} className="text-amber-400" /> :
                           <AlertTriangle size={12} className="text-red-400" />}
                          <div>
                            <p className="font-body text-xs text-[#F5F5F7]/70">{doc.name}</p>
                            <p className="font-body text-[9px] text-[#F5F5F7]/20">{doc.status === "missing" ? "Not uploaded" : `Expires ${doc.expires}`}</p>
                          </div>
                        </div>
                        <span className={`font-body text-[9px] tracking-[0.15em] uppercase ${complianceColor(doc.status)}`}>{doc.status}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ════════ PERFORMANCE ════════ */}
              {section === "performance" && (
                <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
                  <motion.div variants={fadeUp}>
                    <h2 className="font-display text-lg text-[#F5F5F7] mb-1">Performance Scorecard</h2>
                    <p className="font-body text-[10px] text-[#F5F5F7]/30">Your reputation within the Quantus partner network.</p>
                  </motion.div>

                  {/* Dial gauges */}
                  <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {performanceMetrics.map((m, i) => (
                      <div key={m.label} className="bg-[#111114]/80 border border-[hsl(var(--gold))]/[0.08] rounded-xl p-5 text-center">
                        <div className="relative w-16 h-16 mx-auto mb-3">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--gold) / 0.08)" strokeWidth="2" />
                            <motion.circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--gold))" strokeWidth="2" strokeLinecap="round"
                              strokeDasharray={`${m.pct * 0.942} 100`} initial={{ strokeDasharray: "0 100" }} animate={{ strokeDasharray: `${m.pct * 0.942} 100` }} transition={{ duration: 1.2, delay: i * 0.1 }} />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center font-display text-sm text-[hsl(var(--gold))]">{m.value}</span>
                        </div>
                        <p className="font-body text-[9px] tracking-[0.15em] uppercase text-[#F5F5F7]/30 mb-1">{m.label}</p>
                        <p className="font-body text-[8px] text-[#F5F5F7]/15">{m.benchmark}</p>
                      </div>
                    ))}
                  </motion.div>

                  {/* Trend insights */}
                  <motion.div variants={fadeUp} className="bg-[#111114]/80 border border-[hsl(var(--gold))]/[0.12] rounded-xl p-6">
                    <p className="font-body text-[9px] tracking-[0.3em] uppercase text-[hsl(var(--gold))]/40 mb-4">AI Insights</p>
                    <div className="space-y-3">
                      {[
                        "Your response speed is in the top 5% of all partners.",
                        "Improving your document accuracy by 2% unlocks Tier 1 status.",
                        "You are trending as a top aviation partner this quarter.",
                        "Maintaining 100% privacy compliance qualifies you for premium requests.",
                      ].map((insight, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <TrendingUp size={10} className="text-[hsl(var(--gold))]/40 mt-0.5 shrink-0" />
                          <p className="font-body text-[11px] text-[#F5F5F7]/40">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* ════════ BILLING ════════ */}
              {section === "billing" && (
                <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
                  <motion.div variants={fadeUp}>
                    <h2 className="font-display text-lg text-[#F5F5F7] mb-1">Billing & Commissions</h2>
                  </motion.div>

                  <motion.div variants={fadeUp} className="grid sm:grid-cols-3 gap-4">
                    {[
                      { label: "Total Earned", value: "£124,500" },
                      { label: "Pending Payouts", value: "£20,950" },
                      { label: "Upcoming", value: "£18,400" },
                    ].map(s => (
                      <div key={s.label} className="bg-[#111114]/80 border border-[hsl(var(--gold))]/[0.08] rounded-xl p-5 text-center">
                        <p className="font-display text-xl text-[hsl(var(--gold))] mb-1">{s.value}</p>
                        <p className="font-body text-[9px] tracking-[0.2em] uppercase text-[#F5F5F7]/30">{s.label}</p>
                      </div>
                    ))}
                  </motion.div>

                  <div className="space-y-3">
                    {mockPayments.map((p, i) => (
                      <motion.div key={i} variants={fadeUp}
                        className="bg-[#111114]/80 border border-[hsl(var(--gold))]/[0.08] rounded-xl p-5 flex items-center justify-between">
                        <div>
                          <p className="font-body text-xs text-[#F5F5F7] mb-0.5">{p.description}</p>
                          <p className="font-body text-[10px] text-[#F5F5F7]/20">{p.deal} · {p.date}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`font-body text-[9px] tracking-[0.15em] uppercase ${
                            p.status === "Paid" ? "text-emerald-400" : p.status === "Pending" ? "text-[hsl(var(--gold))]" : "text-[#F5F5F7]/30"
                          }`}>{p.status}</span>
                          <p className="font-display text-sm text-[#F5F5F7]">{p.amount}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ════════ SETTINGS ════════ */}
              {section === "settings" && (
                <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
                  <motion.div variants={fadeUp}>
                    <h2 className="font-display text-lg text-[#F5F5F7] mb-1">Partner Settings</h2>
                  </motion.div>

                  <div className="space-y-3">
                    {[
                      { title: "Company Profile", desc: "Name, logo, and description", icon: Building2 },
                      { title: "Contact Details", desc: "Email, phone, and address", icon: Mail },
                      { title: "Regions Served", desc: "Geographic coverage areas", icon: Globe },
                      { title: "Categories", desc: "Aviation, medical, staffing, etc.", icon: Briefcase },
                      { title: "Privacy Tier", desc: "Data handling and NDA levels", icon: Shield },
                      { title: "Team Members", desc: "Manage team access and roles", icon: Users },
                      { title: "Notification Preferences", desc: "Email, SMS, and in-app alerts", icon: Bell },
                      { title: "Contact Support", desc: "Direct line to Quantus operations", icon: Phone },
                    ].map(setting => (
                      <motion.div key={setting.title} variants={fadeUp}
                        className="bg-[#111114]/80 border border-[hsl(var(--gold))]/[0.08] rounded-xl p-5 flex items-center justify-between hover:border-[hsl(var(--gold))]/20 transition-all duration-300 cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--gold))]/[0.06] flex items-center justify-center">
                            <setting.icon size={14} className="text-[hsl(var(--gold))]/40" strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="font-body text-xs text-[#F5F5F7]">{setting.title}</p>
                            <p className="font-body text-[10px] text-[#F5F5F7]/25">{setting.desc}</p>
                          </div>
                        </div>
                        <ArrowRight size={14} className="text-[hsl(var(--gold))]/15 group-hover:text-[hsl(var(--gold))]/40 transition-colors" />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="hidden lg:flex px-6 py-3 border-t border-[hsl(var(--gold))]/[0.05] items-center justify-between">
          <p className="font-body text-[8px] tracking-[0.25em] uppercase text-[#F5F5F7]/15">Quantus V2+ — Partner Network</p>
          <p className="font-body text-[8px] text-[#F5F5F7]/10">v1.0.0</p>
        </footer>
      </div>
    </div>
  );
};

export default PartnerPortal;
