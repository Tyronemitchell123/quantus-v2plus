import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, Briefcase, ClipboardCheck, FileText, BarChart3,
  DollarSign, Settings2, Handshake, Bell, Star, Clock, CheckCircle2,
  ArrowRight, Upload, MessageSquare, TrendingUp, AlertTriangle,
} from "lucide-react";
import useDocumentHead from "@/hooks/use-document-head";
import DocumentsAIPanel from "@/components/documents/DocumentsAIPanel";

type PortalSection = "dashboard" | "deals" | "tasks" | "documents" | "performance" | "payments" | "settings";

const navItems: { key: PortalSection; icon: typeof LayoutDashboard; label: string }[] = [
  { key: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { key: "deals", icon: Briefcase, label: "Assigned Deals" },
  { key: "tasks", icon: ClipboardCheck, label: "Tasks" },
  { key: "documents", icon: FileText, label: "Documents" },
  { key: "performance", icon: BarChart3, label: "Performance" },
  { key: "payments", icon: DollarSign, label: "Payments" },
  { key: "settings", icon: Settings2, label: "Settings" },
];

const mockDeals = [
  { id: "QAI-AV-001", category: "Aviation", status: "In Progress", deadline: "Apr 12, 2026", phase: 3 },
  { id: "QAI-MD-014", category: "Medical", status: "Awaiting Response", deadline: "Apr 8, 2026", phase: 2 },
  { id: "QAI-ST-007", category: "Staffing", status: "Documents Needed", deadline: "Apr 15, 2026", phase: 4 },
];

const mockTasks = [
  { title: "Upload aircraft maintenance logs", deal: "QAI-AV-001", deadline: "Apr 10", status: "pending" },
  { title: "Confirm clinic availability", deal: "QAI-MD-014", deadline: "Apr 7", status: "pending" },
  { title: "Provide candidate shortlist", deal: "QAI-ST-007", deadline: "Apr 12", status: "pending" },
  { title: "Submit updated rate sheet", deal: "QAI-AV-001", deadline: "Apr 9", status: "completed" },
  { title: "Respond to pricing inquiry", deal: "QAI-MD-014", deadline: "Apr 6", status: "overdue" },
];

const mockPayments = [
  { deal: "QAI-AV-001", amount: "£24,500", status: "Paid", date: "Mar 28, 2026" },
  { deal: "QAI-MD-014", amount: "£8,200", status: "Pending", date: "Apr 15, 2026" },
  { deal: "QAI-ST-007", amount: "£12,750", status: "Upcoming", date: "Apr 30, 2026" },
];

const requiredDocs = [
  { name: "Aircraft Maintenance Logs", status: "missing" },
  { name: "Insurance Certificate", status: "uploaded" },
  { name: "Rate Sheet 2026", status: "uploaded" },
  { name: "Compliance Documentation", status: "missing" },
  { name: "Service Agreement (Signed)", status: "missing" },
];

const aiPrompts: Record<PortalSection, string[]> = {
  dashboard: ["View assigned deals", "Check pending tasks", "Review performance", "Download statements"],
  deals: ["Summarize deal requirements", "Check deadline status", "Prepare response", "Request extension"],
  tasks: ["Show overdue tasks", "Batch complete tasks", "Upload documents", "Notify Quantus team"],
  documents: ["Check document completeness", "Flag missing pages", "Generate summary", "Upload batch"],
  performance: ["Compare quarterly metrics", "Identify improvement areas", "View commission forecast", "Download report"],
  payments: ["Download invoice", "Request clarification", "View payment schedule", "Export history"],
  settings: ["Update company profile", "Manage team access", "Review commission terms", "API documentation"],
};

const PartnerPortal = () => {
  useDocumentHead({ title: "Partner Portal — Quantus A.I", description: "Partner access portal for vendors and service providers." });
  const [activeSection, setActiveSection] = useState<PortalSection>("dashboard");

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Handshake size={16} className="text-primary" />
              <p className="font-body text-xs tracking-[0.35em] uppercase text-primary/70">Partner Access</p>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-medium">Partner Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Star size={12} className="text-primary" />
              <span className="font-body text-xs text-primary">Score: 94</span>
            </div>
            <button className="relative text-muted-foreground hover:text-foreground transition-colors">
              <Bell size={16} />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Navigation */}
          <div className="lg:w-48 shrink-0">
            <div className="glass-card p-2 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
              {navItems.map((item) => {
                const active = activeSection === item.key;
                return (
                  <button key={item.key} onClick={() => setActiveSection(item.key)}
                    className={`flex items-center gap-3 px-4 py-2.5 text-left font-body text-xs transition-all duration-300 whitespace-nowrap shrink-0 ${active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"}`}>
                    <item.icon size={14} strokeWidth={1.5} />
                    <span className="hidden lg:inline">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div key={activeSection} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
                <div className="flex flex-col xl:flex-row gap-6">
                  <div className="flex-1 min-w-0 space-y-6">

                    {/* === DASHBOARD === */}
                    {activeSection === "dashboard" && (
                      <>
                        {/* Performance snapshot */}
                        <div className="grid sm:grid-cols-4 gap-4">
                          {[
                            { label: "Response Time", value: "1.8h", icon: Clock },
                            { label: "Reliability", value: "96%", icon: CheckCircle2 },
                            { label: "Deals Completed", value: "18", icon: Briefcase },
                            { label: "Commission Earned", value: "£124K", icon: DollarSign },
                          ].map(({ label, value, icon: Icon }) => (
                            <div key={label} className="glass-card p-5 text-center">
                              <Icon size={14} className="text-primary mx-auto mb-2" />
                              <p className="font-display text-xl font-medium text-primary mb-1">{value}</p>
                              <p className="font-body text-[9px] tracking-[0.15em] uppercase text-muted-foreground">{label}</p>
                            </div>
                          ))}
                        </div>

                        {/* Assigned deals */}
                        <div>
                          <h2 className="font-display text-sm font-medium mb-3">Assigned Deals</h2>
                          <div className="space-y-3">
                            {mockDeals.map((deal, i) => (
                              <motion.div key={deal.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                                className="glass-card p-4 flex items-center justify-between hover:border-primary/20 transition-colors cursor-pointer">
                                <div className="flex items-center gap-4">
                                  <div>
                                    <p className="font-body text-xs font-medium text-foreground font-mono">{deal.id}</p>
                                    <p className="font-body text-[10px] text-muted-foreground">{deal.category} · Phase {deal.phase}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="font-body text-[9px] tracking-[0.15em] uppercase text-primary/60">{deal.status}</span>
                                  <span className="font-body text-[10px] text-muted-foreground">{deal.deadline}</span>
                                  <ArrowRight size={12} className="text-primary" />
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* Tasks requiring action */}
                        <div>
                          <h2 className="font-display text-sm font-medium mb-3">Tasks Requiring Action</h2>
                          <div className="space-y-2">
                            {mockTasks.filter(t => t.status !== "completed").slice(0, 3).map((task, i) => (
                              <div key={i} className="glass-card p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {task.status === "overdue" ? <AlertTriangle size={12} className="text-destructive" /> : <ClipboardCheck size={12} className="text-primary" />}
                                  <div>
                                    <p className="font-body text-xs text-foreground">{task.title}</p>
                                    <p className="font-body text-[10px] text-muted-foreground">{task.deal} · Due {task.deadline}</p>
                                  </div>
                                </div>
                                <button className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary font-body text-[10px] hover:bg-primary/20 transition-colors">
                                  Complete
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* === ASSIGNED DEALS === */}
                    {activeSection === "deals" && (
                      <>
                        <h2 className="font-display text-lg font-medium">Assigned Deals</h2>
                        <div className="space-y-4">
                          {mockDeals.map((deal, i) => (
                            <motion.div key={deal.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                              className="glass-card p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <p className="font-body text-sm font-medium text-foreground font-mono mb-1">{deal.id}</p>
                                  <p className="font-body text-[10px] text-muted-foreground">{deal.category} · Phase {deal.phase} · {deal.status}</p>
                                </div>
                                <span className="font-body text-[10px] text-muted-foreground">Deadline: {deal.deadline}</span>
                              </div>

                              {/* Deal details */}
                              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                                {["Requirements", "Timeline", "Documents Needed", "Obligations"].map(field => (
                                  <div key={field} className="px-3 py-2 border border-border">
                                    <p className="font-body text-[9px] tracking-[0.15em] uppercase text-muted-foreground mb-1">{field}</p>
                                    <p className="font-body text-xs text-foreground/70">Awaiting specification</p>
                                  </div>
                                ))}
                              </div>

                              {/* Message thread preview */}
                              <div className="border border-border p-3 mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <MessageSquare size={10} className="text-primary" />
                                  <span className="font-body text-[9px] tracking-[0.15em] uppercase text-primary/60">Messages</span>
                                </div>
                                <div className="glass-card p-3">
                                  <p className="font-body text-xs text-muted-foreground italic">No messages yet for this deal.</p>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button className="px-3 py-1.5 bg-primary text-primary-foreground font-body text-[10px] tracking-wider hover:bg-primary/90 transition-colors">Open Deal</button>
                                <button className="px-3 py-1.5 border border-border font-body text-[10px] text-muted-foreground hover:text-foreground transition-colors">Reply</button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* === TASKS === */}
                    {activeSection === "tasks" && (
                      <>
                        <h2 className="font-display text-lg font-medium">Tasks</h2>
                        <div className="flex gap-2 mb-4">
                          {["All", "Pending", "Overdue", "Completed"].map(f => (
                            <button key={f} className="px-3 py-1 border border-border font-body text-[10px] tracking-wider uppercase text-muted-foreground hover:text-primary hover:border-primary/20 transition-colors">{f}</button>
                          ))}
                        </div>
                        <div className="space-y-3">
                          {mockTasks.map((task, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                              className={`glass-card p-4 flex items-center justify-between ${task.status === "overdue" ? "border-destructive/30" : ""}`}>
                              <div className="flex items-center gap-3">
                                {task.status === "completed" ? <CheckCircle2 size={12} className="text-primary" /> :
                                 task.status === "overdue" ? <AlertTriangle size={12} className="text-destructive" /> :
                                 <Clock size={12} className="text-muted-foreground" />}
                                <div>
                                  <p className={`font-body text-xs ${task.status === "completed" ? "text-muted-foreground line-through" : "text-foreground"}`}>{task.title}</p>
                                  <p className="font-body text-[10px] text-muted-foreground">{task.deal} · Due {task.deadline}</p>
                                </div>
                              </div>
                              {task.status !== "completed" && (
                                <button className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary font-body text-[10px] hover:bg-primary/20 transition-colors">
                                  {task.title.toLowerCase().includes("upload") ? "Upload" : "Complete"}
                                </button>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* === DOCUMENTS === */}
                    {activeSection === "documents" && (
                      <>
                        <h2 className="font-display text-lg font-medium">Document Upload Center</h2>

                        {/* Drag & drop zone */}
                        <div className="glass-card p-8 border-dashed border-2 border-border text-center hover:border-primary/20 transition-colors cursor-pointer">
                          <Upload size={24} className="text-primary/40 mx-auto mb-3" />
                          <p className="font-body text-xs text-muted-foreground mb-1">Drag & drop files here</p>
                          <p className="font-body text-[10px] text-muted-foreground/60">or click to browse</p>
                        </div>

                        {/* Required documents */}
                        <div>
                          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-primary/60 mb-3">Required Documents</p>
                          <div className="space-y-2">
                            {requiredDocs.map((doc, i) => (
                              <div key={i} className="glass-card p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {doc.status === "uploaded" ? <CheckCircle2 size={12} className="text-primary" /> : <AlertTriangle size={12} className="text-destructive/60" />}
                                  <p className="font-body text-xs text-foreground">{doc.name}</p>
                                </div>
                                <span className={`font-body text-[9px] tracking-[0.15em] uppercase ${doc.status === "uploaded" ? "text-primary/60" : "text-destructive/60"}`}>
                                  {doc.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* === PERFORMANCE === */}
                    {activeSection === "performance" && (
                      <>
                        <h2 className="font-display text-lg font-medium">Performance Scorecard</h2>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[
                            { label: "Response Speed", value: "1.8h", benchmark: "Avg: 3.2h", trend: "above" },
                            { label: "Reliability", value: "96%", benchmark: "Avg: 89%", trend: "above" },
                            { label: "Document Accuracy", value: "98%", benchmark: "Avg: 91%", trend: "above" },
                            { label: "Commission Earned", value: "£124K", benchmark: "YTD", trend: "neutral" },
                            { label: "Deals Completed", value: "18", benchmark: "This Quarter: 6", trend: "neutral" },
                            { label: "Client Satisfaction", value: "4.8/5", benchmark: "Avg: 4.2", trend: "above" },
                          ].map((metric, i) => (
                            <motion.div key={metric.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                              className="glass-card p-5 text-center">
                              <p className="font-display text-2xl font-medium text-primary mb-1">{metric.value}</p>
                              <p className="font-body text-[9px] tracking-[0.15em] uppercase text-muted-foreground mb-2">{metric.label}</p>
                              <div className="flex items-center justify-center gap-1">
                                {metric.trend === "above" && <TrendingUp size={9} className="text-primary" />}
                                <span className="font-body text-[9px] text-muted-foreground">{metric.benchmark}</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>

                        {/* AI insights */}
                        <div className="glass-card p-5">
                          <p className="font-body text-[10px] tracking-[0.2em] uppercase text-primary/60 mb-3">AI Insights</p>
                          <div className="space-y-2">
                            {[
                              "Your response time is above network average.",
                              "You are trending as a top aviation partner this quarter.",
                              "Document accuracy increased 3% from last quarter.",
                            ].map((insight, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <TrendingUp size={10} className="text-primary mt-0.5 shrink-0" />
                                <p className="font-body text-xs text-muted-foreground">{insight}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* === PAYMENTS === */}
                    {activeSection === "payments" && (
                      <>
                        <h2 className="font-display text-lg font-medium">Payments & Commissions</h2>

                        <div className="grid sm:grid-cols-3 gap-4">
                          {[
                            { label: "Total Earned", value: "£124,500" },
                            { label: "Pending", value: "£20,950" },
                            { label: "Upcoming", value: "£12,750" },
                          ].map(s => (
                            <div key={s.label} className="glass-card p-5 text-center">
                              <p className="font-display text-xl font-medium text-primary mb-1">{s.value}</p>
                              <p className="font-body text-[9px] tracking-[0.15em] uppercase text-muted-foreground">{s.label}</p>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-3">
                          {mockPayments.map((payment, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                              className="glass-card p-4 flex items-center justify-between">
                              <div>
                                <p className="font-body text-xs font-medium text-foreground font-mono">{payment.deal}</p>
                                <p className="font-body text-[10px] text-muted-foreground">{payment.date}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className={`font-body text-[9px] tracking-[0.15em] uppercase ${payment.status === "Paid" ? "text-primary" : "text-muted-foreground"}`}>
                                  {payment.status}
                                </span>
                                <p className="font-body text-sm font-medium text-foreground">{payment.amount}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* === SETTINGS === */}
                    {activeSection === "settings" && (
                      <>
                        <h2 className="font-display text-lg font-medium">Partner Settings</h2>
                        <div className="space-y-3">
                          {[
                            { title: "Company Profile", desc: "Name, logo, and description" },
                            { title: "Contact Details", desc: "Email, phone, and address" },
                            { title: "Regions Served", desc: "Geographic coverage areas" },
                            { title: "Categories Served", desc: "Aviation, medical, staffing, etc." },
                            { title: "Commission Structure", desc: "Rates and payment terms" },
                            { title: "Notification Preferences", desc: "Email, SMS, and in-app alerts" },
                            { title: "API Integration", desc: "Programmatic access configuration" },
                            { title: "Team Members", desc: "Manage team access and roles" },
                          ].map((setting) => (
                            <div key={setting.title} className="glass-card p-4 flex items-center justify-between hover:border-primary/20 transition-colors cursor-pointer">
                              <div>
                                <p className="font-body text-xs font-medium text-foreground">{setting.title}</p>
                                <p className="font-body text-[10px] text-muted-foreground">{setting.desc}</p>
                              </div>
                              <ArrowRight size={12} className="text-primary/40" />
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Right AI Panel */}
                  <div className="xl:w-72 shrink-0">
                    <DocumentsAIPanel prompts={aiPrompts[activeSection]} />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerPortal;
