import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BookOpen, Shield, Code2, Rocket, Bot, Radar, FolderOpen, Briefcase,
  Key, Webhook, AlertTriangle, Lock, CheckCircle2, ChevronRight,
  FileText, Users, CreditCard, Settings, Zap, Globe, Search,
  ArrowRight, Eye, PenTool, Database, Server,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useDocumentHead from "@/hooks/use-document-head";
import Footer from "@/components/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

/* ─── PLATFORM GUIDE DATA ─── */
const platformSections = [
  {
    icon: Briefcase,
    title: "Deal Engine — 8-Phase Pipeline",
    badge: "Core",
    content: [
      { heading: "1. Intake & Definition", text: "Navigate to /intake. Describe your requirement in natural language — the AI classifies it by category (Aviation, Medical, Staffing, Lifestyle, Logistics, Partnerships), extracts budget, timeline, and constraints, then routes it into the pipeline." },
      { heading: "2. Sourcing", text: "The AI activates vendor networks, scores options by quality, cost, and availability, and produces a ranked shortlist. View results at /sourcing." },
      { heading: "3. Vendor Outreach", text: "Automated luxury-toned engagement emails are drafted and sent to top-ranked vendors. Track status at /outreach." },
      { heading: "4. Shortlisting & Curation", text: "AI ranks the best-aligned options with pros/cons analysis. Review and approve at /shortlist." },
      { heading: "5. Negotiation", text: "Strategic leverage analysis and counter-offer suggestions. The AI prepares negotiation briefs at /negotiation." },
      { heading: "6. Workflow & Execution", text: "Modular operational blueprints with task assignments, timelines, and risk flags at /workflow." },
      { heading: "7. Documentation & Billing", text: "Contract generation, commission tracking, and invoice management at /documents." },
      { heading: "8. Deal Completion", text: "Final closeout, satisfaction scoring, and archival at /deal-completion." },
    ],
  },
  {
    icon: Bot,
    title: "AI Deal Autopilot",
    badge: "Premium",
    content: [
      { heading: "Enable Autopilot", text: "Navigate to /autopilot. Toggle the Autopilot switch to ON. The AI will autonomously process deals through all 8 phases without manual intervention." },
      { heading: "Create a Deal", text: "Click '+ New Deal' to open the quick-create dialog. Describe what you need, select a category, set an approximate budget, then choose 'Launch on Autopilot' or 'Manual Intake'." },
      { heading: "Monitor Progress", text: "The Live Pipeline tab shows all active deals with real-time progress bars, ETAs, and status indicators. Click any deal to expand details." },
      { heading: "Override Controls", text: "Pause any deal, retry a stage, or switch to manual mode at any time. High-value deals (>$500K) can require human approval via the Config tab." },
      { heading: "Activity Log", text: "Every AI action is logged with timestamps — classifications, vendor contacts, negotiations, and budget optimizations." },
    ],
  },
  {
    icon: Radar,
    title: "Market Intelligence",
    badge: "Premium",
    content: [
      { heading: "Signal Feed", text: "Navigate to /intelligence. Real-time market signals are scored by sentiment (bullish/bearish/neutral), impact level, and AI confidence. Filter by vertical." },
      { heading: "Opportunities", text: "AI-scored deal opportunities with revenue potential estimates and urgency ratings. Click 'Pursue' to create a deal from any opportunity." },
      { heading: "Competitor Watch", text: "Track competitor moves, threat levels, and strategic implications across all verticals." },
    ],
  },
  {
    icon: FolderOpen,
    title: "Document Vault",
    badge: "Premium",
    content: [
      { heading: "Generate Documents", text: "Navigate to /vault. Click 'Generate Document', choose a template (Service Agreement, NDA, SoW, Invoice, MoU, Commission Schedule), link it to a deal, and add special instructions." },
      { heading: "E-Signatures", text: "Send documents for digital signature. Track signing progress with real-time status updates. Send reminders for pending signatures." },
      { heading: "Encrypted Storage", text: "All documents are encrypted at rest. The vault shows encryption status for each file with a lock icon." },
      { heading: "Search & Filter", text: "Search by document title, filter by type or status. Download or preview any document." },
    ],
  },
  {
    icon: Users,
    title: "Vertical Modules",
    badge: "Core",
    content: [
      { heading: "Aviation", text: "Aircraft catalogs, charter sourcing, fleet management intelligence. Access via /dashboard/modules." },
      { heading: "Medical", text: "Medical tourism, specialist sourcing, clinic partnerships, and treatment coordination." },
      { heading: "Staffing", text: "Executive search, contract staffing, skill matching, and placement tracking." },
      { heading: "Lifestyle", text: "Luxury experiences, wellness retreats, property sourcing, and concierge services." },
      { heading: "Logistics", text: "Supply chain optimization, freight management, and warehouse coordination." },
      { heading: "Partnerships", text: "Strategic alliance facilitation, joint venture structuring, and partner matching." },
    ],
  },
  {
    icon: CreditCard,
    title: "Subscription & Billing",
    badge: "Account",
    content: [
      { heading: "Plans", text: "Free (100 AI queries/mo), Starter ($29/mo), Professional ($149/mo), Teams ($49/user/mo), Enterprise (custom). Manage at /account/subscription." },
      { heading: "Upgrade/Downgrade", text: "Switch plans anytime. Pro-rated billing applies. Annual plans save 20%." },
      { heading: "Usage Tracking", text: "Monitor AI queries, quantum jobs, API calls, and storage usage in real-time." },
      { heading: "Add-ons", text: "Purchase additional AI credits, quantum compute hours, API integrations, and premium support from the Add-on Marketplace on /pricing." },
    ],
  },
];

/* ─── SECURITY DATA ─── */
const securitySections = [
  {
    icon: Lock,
    title: "Authentication & Access Control",
    items: [
      "All authenticated routes are protected by the ProtectedRoute component that verifies JWT tokens.",
      "Role-based access control (RBAC) uses a dedicated user_roles table with admin, moderator, user, and partner roles.",
      "Admin status is verified server-side via the has_role() SECURITY DEFINER function — never client-side storage.",
      "Email verification is required before sign-in (auto-confirm is disabled by default).",
      "Password requirements enforce minimum length and complexity.",
    ],
  },
  {
    icon: Database,
    title: "Row-Level Security (RLS)",
    items: [
      "Every table has RLS enabled with granular policies controlling SELECT, INSERT, UPDATE, and DELETE.",
      "Users can only access their own data via auth.uid() = user_id checks.",
      "Admin access uses the has_role() function to prevent recursive policy issues.",
      "Sensitive tables (subscriptions, payments, usage_records) are read-only for users — mutations go through edge functions.",
      "Credit balances should only be modified via server-side SECURITY DEFINER functions.",
    ],
  },
  {
    icon: Server,
    title: "Edge Function Security",
    items: [
      "All user-facing edge functions validate JWT tokens from the Authorization header.",
      "Administrative functions (scheduled-content, expire-api-keys) use cron-secret header verification.",
      "Rate limiting is enforced at 30 requests/minute per IP on critical endpoints.",
      "Input validation uses Zod schemas on all request bodies before processing.",
      "API keys are SHA-256 hashed before storage — raw keys are never persisted.",
    ],
  },
  {
    icon: Shield,
    title: "Payment Security",
    items: [
      "Stripe handles all payment processing — no card data touches our servers.",
      "Checkout sessions are created server-side with authenticated user context.",
      "Webhook signatures must be verified before processing payment events.",
      "Subscription status is verified directly against Stripe on every check-subscription call.",
      "TrueLayer webhook verification should use Tl-Signature header validation in production.",
    ],
  },
  {
    icon: Eye,
    title: "Privacy & GDPR Compliance",
    items: [
      "Privacy Policy and Terms of Service are accessible at /privacy and /terms.",
      "Cookie consent banner allows users to accept or decline non-essential cookies.",
      "Email unsubscribe functionality with one-click tokens at /unsubscribe.",
      "Suppressed email list prevents sending to users who have opted out.",
      "Audit logs track all user actions with timestamps, IP addresses, and metadata.",
      "Obsidian Mode provides one-tap masking of sensitive client and vendor data.",
    ],
  },
];

/* ─── DEVELOPER/API DATA ─── */
const apiEndpoints = [
  { method: "POST", path: "create-checkout", desc: "Create a Stripe checkout session for subscription purchase", auth: "JWT" },
  { method: "POST", path: "check-subscription", desc: "Verify user's active subscription status and tier from Stripe", auth: "JWT" },
  { method: "POST", path: "customer-portal", desc: "Generate a Stripe Customer Portal session URL", auth: "JWT" },
  { method: "POST", path: "intake-classify", desc: "Classify a deal request using AI (category, intent, priority)", auth: "JWT" },
  { method: "POST", path: "sourcing-engine", desc: "Run AI-powered vendor sourcing for a deal", auth: "JWT" },
  { method: "POST", path: "vendor-outreach", desc: "Generate and send vendor outreach communications", auth: "JWT" },
  { method: "POST", path: "negotiation-engine", desc: "AI negotiation analysis and counter-offer generation", auth: "JWT" },
  { method: "POST", path: "workflow-engine", desc: "Generate workflow tasks and operational blueprints", auth: "JWT" },
  { method: "POST", path: "deal-completion", desc: "Process deal closeout and generate completion reports", auth: "JWT" },
  { method: "POST", path: "concierge-chat", desc: "AI concierge streaming chat interface", auth: "JWT" },
  { method: "POST", path: "quantum-jobs", desc: "Submit and manage quantum computing jobs via AWS Braket", auth: "JWT" },
  { method: "POST", path: "ai-analytics", desc: "Generate AI-powered analytics and insights", auth: "JWT" },
  { method: "POST", path: "nlp-tools", desc: "NLP processing — summarize, sentiment, generate, extract, translate, classify", auth: "JWT" },
  { method: "POST", path: "handle-contact", desc: "Process contact form submissions with AI classification", auth: "Public" },
  { method: "POST", path: "track-usage", desc: "Record feature usage metrics", auth: "JWT" },
  { method: "POST", path: "redeem-referral", desc: "Validate and redeem a referral code for credits", auth: "JWT" },
  { method: "GET", path: "sitemap", desc: "Generate XML sitemap for SEO", auth: "Public" },
];

const webhookEvents = [
  { event: "deal.created", desc: "Fired when a new deal enters the pipeline" },
  { event: "deal.status_changed", desc: "Fired when a deal moves to a new phase" },
  { event: "deal.completed", desc: "Fired when a deal reaches completion" },
  { event: "vendor.matched", desc: "Fired when vendors are matched to a deal" },
  { event: "document.signed", desc: "Fired when all parties have signed a document" },
  { event: "payment.received", desc: "Fired when a payment is successfully processed" },
  { event: "subscription.changed", desc: "Fired when a subscription tier changes" },
];

const Documentation = () => {
  const [search, setSearch] = useState("");

  useDocumentHead({
    title: "Documentation — Platform Guide, Security & API | QUANTUS AI",
    description: "Comprehensive documentation covering platform usage, security architecture, and developer API reference for QUANTUS AI.",
    canonical: "https://quantus-loom.lovable.app/docs",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "QUANTUS AI Documentation",
      description: "Complete platform documentation including user guide, security policies, and API reference.",
      url: "https://quantus-loom.lovable.app/docs",
    },
  });

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/[0.04] rounded-full blur-[120px]" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center max-w-3xl mx-auto">
            <p className="text-primary font-display text-sm tracking-[0.3em] uppercase mb-4">Documentation</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Complete <span className="text-gold-gradient gold-glow-text">Platform Guide</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Everything you need to master QUANTUS AI — from deal creation to API integration and security best practices.
            </p>
            <div className="relative max-w-md mx-auto">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search documentation…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-11 h-12 text-base bg-secondary/50 border-border/50"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Nav */}
      <section className="pb-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { icon: Rocket, label: "Platform Guide", desc: "How to use every feature", tab: "platform" },
              { icon: Shield, label: "Security", desc: "Architecture & compliance", tab: "security" },
              { icon: Code2, label: "Developer API", desc: "Endpoints, webhooks & keys", tab: "developer" },
            ].map((item, i) => (
              <motion.a
                key={item.tab}
                href={`#docs-tabs`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-xl p-6 hover:border-primary/30 transition-all cursor-pointer group text-left"
              >
                <item.icon size={24} className="text-primary mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-display text-lg font-semibold text-foreground mb-1">{item.label}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-24" id="docs-tabs">
        <div className="container mx-auto px-6">
          <Tabs defaultValue="platform" className="max-w-5xl mx-auto">
            <TabsList className="bg-secondary/50 mb-8 w-full justify-start">
              <TabsTrigger value="platform" className="gap-2"><Rocket size={14} /> Platform Guide</TabsTrigger>
              <TabsTrigger value="security" className="gap-2"><Shield size={14} /> Security</TabsTrigger>
              <TabsTrigger value="developer" className="gap-2"><Code2 size={14} /> Developer API</TabsTrigger>
            </TabsList>

            {/* ═══ PLATFORM GUIDE ═══ */}
            <TabsContent value="platform">
              <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
                {platformSections
                  .filter(s => !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.content.some(c => c.heading.toLowerCase().includes(search.toLowerCase()) || c.text.toLowerCase().includes(search.toLowerCase())))
                  .map((section, i) => (
                  <motion.div key={i} variants={fadeUp}>
                    <Card className="glass-card border-border/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <section.icon size={18} className="text-primary" />
                          </div>
                          {section.title}
                          <Badge variant="outline" className="text-[10px] ml-auto">{section.badge}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="multiple" className="space-y-0">
                          {section.content.map((item, j) => (
                            <AccordionItem key={j} value={`${i}-${j}`} className="border-border/30">
                              <AccordionTrigger className="text-sm font-medium text-foreground hover:text-primary py-3">
                                <span className="flex items-center gap-2">
                                  <ChevronRight size={12} className="text-primary" />
                                  {item.heading}
                                </span>
                              </AccordionTrigger>
                              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pl-6">
                                {item.text}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {/* Quick Links */}
                <Card className="glass-card border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ArrowRight size={18} className="text-primary" /> Quick Navigation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[
                        { label: "Dashboard", to: "/dashboard" },
                        { label: "Deal Intake", to: "/intake" },
                        { label: "AI Autopilot", to: "/autopilot" },
                        { label: "Market Intelligence", to: "/intelligence" },
                        { label: "Document Vault", to: "/vault" },
                        { label: "Vertical Modules", to: "/dashboard/modules" },
                        { label: "AI Chat", to: "/chat" },
                        { label: "NLP Tools Guide", to: "/guide" },
                        { label: "Pricing", to: "/pricing" },
                        { label: "Settings", to: "/settings" },
                        { label: "Subscription", to: "/account/subscription" },
                        { label: "Contact Support", to: "/contact" },
                      ].map(link => (
                        <Link key={link.to} to={link.to}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-sm text-foreground">
                          <ChevronRight size={12} className="text-primary" />
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* ═══ SECURITY ═══ */}
            <TabsContent value="security">
              <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
                {/* Security Overview */}
                <motion.div variants={fadeUp}>
                  <Card className="glass-card border-border/50 border-l-4 border-l-primary">
                    <CardContent className="p-6">
                      <h3 className="font-display text-lg font-semibold text-foreground mb-2">Security Architecture Overview</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        QUANTUS AI implements defense-in-depth security with JWT authentication, role-based access control,
                        row-level security on every database table, input validation via Zod schemas, rate limiting on all
                        public endpoints, and encrypted document storage. All payment processing is handled by Stripe with
                        no sensitive financial data stored on our infrastructure.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                {securitySections
                  .filter(s => !search || s.title.toLowerCase().includes(search.toLowerCase()) || s.items.some(item => item.toLowerCase().includes(search.toLowerCase())))
                  .map((section, i) => (
                  <motion.div key={i} variants={fadeUp}>
                    <Card className="glass-card border-border/50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-lg">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <section.icon size={18} className="text-primary" />
                          </div>
                          {section.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {section.items.map((item, j) => (
                            <li key={j} className="flex items-start gap-3 text-sm text-muted-foreground">
                              <CheckCircle2 size={14} className="text-primary shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {/* Security Best Practices */}
                <motion.div variants={fadeUp}>
                  <Card className="glass-card border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <AlertTriangle size={18} className="text-primary" />
                        </div>
                        Security Best Practices for Users
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {[
                          { title: "Use Strong Passwords", desc: "Minimum 8 characters with mixed case, numbers, and symbols. Enable leaked password protection." },
                          { title: "Rotate API Keys", desc: "Set expiration dates on API keys and rotate them regularly. Revoke unused keys immediately." },
                          { title: "Monitor Audit Logs", desc: "Review your audit trail in Settings → Audit Log for unusual activity patterns." },
                          { title: "Verify Webhook Secrets", desc: "Always validate webhook signatures before processing events in production." },
                          { title: "Limit API Permissions", desc: "Create separate API keys for different integrations with minimal required permissions." },
                          { title: "Keep Sessions Secure", desc: "Sign out when using shared devices. Sessions expire automatically for security." },
                        ].map((practice, j) => (
                          <div key={j} className="p-4 rounded-lg bg-secondary/30 border border-border/30">
                            <h4 className="text-sm font-semibold text-foreground mb-1">{practice.title}</h4>
                            <p className="text-xs text-muted-foreground">{practice.desc}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>

            {/* ═══ DEVELOPER API ═══ */}
            <TabsContent value="developer">
              <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
                {/* Authentication */}
                <motion.div variants={fadeUp}>
                  <Card className="glass-card border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Key size={18} className="text-primary" />
                        </div>
                        Authentication
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">All API requests require authentication via JWT token or API key in the Authorization header.</p>
                      <div className="rounded-lg bg-secondary/50 border border-border/50 p-4 font-mono text-xs text-foreground overflow-x-auto">
                        <pre>{`// Using Supabase client (recommended)
import { supabase } from "@/integrations/supabase/client";

const { data, error } = await supabase.functions.invoke("endpoint-name", {
  body: { /* request payload */ }
});

// Direct HTTP (for external integrations)
fetch("https://[project-url]/functions/v1/endpoint-name", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_JWT_TOKEN",
    "Content-Type": "application/json",
    "apikey": "YOUR_ANON_KEY"
  },
  body: JSON.stringify({ /* payload */ })
});`}</pre>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* API Key Management */}
                <motion.div variants={fadeUp}>
                  <Card className="glass-card border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Settings size={18} className="text-primary" />
                        </div>
                        API Key Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">Manage API keys in Settings → API Keys. Keys are hashed using SHA-256 before storage.</p>
                      <ul className="space-y-2">
                        {[
                          "Create named API keys with optional expiration dates",
                          "Keys are shown once on creation — store them securely",
                          "Key prefix (first 8 chars) is stored for identification",
                          "Revoke keys instantly from the API Keys panel",
                          "Expired keys are automatically deactivated by a scheduled function",
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 size={12} className="text-primary shrink-0 mt-1" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Endpoints */}
                <motion.div variants={fadeUp}>
                  <Card className="glass-card border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Globe size={18} className="text-primary" />
                        </div>
                        API Endpoints
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border/50">
                              <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Method</th>
                              <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Endpoint</th>
                              <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Description</th>
                              <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Auth</th>
                            </tr>
                          </thead>
                          <tbody>
                            {apiEndpoints
                              .filter(e => !search || e.path.includes(search.toLowerCase()) || e.desc.toLowerCase().includes(search.toLowerCase()))
                              .map((ep, i) => (
                              <tr key={i} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                                <td className="py-2.5 px-2">
                                  <Badge variant="outline" className="text-[10px] font-mono bg-primary/5 text-primary border-primary/20">{ep.method}</Badge>
                                </td>
                                <td className="py-2.5 px-2 font-mono text-xs text-foreground">{ep.path}</td>
                                <td className="py-2.5 px-2 text-xs text-muted-foreground hidden md:table-cell">{ep.desc}</td>
                                <td className="py-2.5 px-2">
                                  <Badge variant="outline" className={`text-[10px] ${ep.auth === "JWT" ? "text-emerald-400 border-emerald-500/20" : "text-amber-400 border-amber-500/20"}`}>
                                    {ep.auth === "JWT" ? <Lock size={8} className="mr-1" /> : <Globe size={8} className="mr-1" />}
                                    {ep.auth}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Webhooks */}
                <motion.div variants={fadeUp}>
                  <Card className="glass-card border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Webhook size={18} className="text-primary" />
                        </div>
                        Webhook Events
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">Configure webhooks in Settings → Webhooks. Each webhook includes an HMAC secret for signature verification.</p>
                      <div className="space-y-2">
                        {webhookEvents.map((wh, i) => (
                          <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-secondary/30 border border-border/30">
                            <code className="text-xs font-mono text-primary">{wh.event}</code>
                            <span className="text-xs text-muted-foreground hidden sm:block">{wh.desc}</span>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-lg bg-secondary/50 border border-border/50 p-4 font-mono text-xs text-foreground overflow-x-auto">
                        <pre>{`// Webhook payload structure
{
  "event": "deal.status_changed",
  "timestamp": "2026-03-27T10:30:00Z",
  "data": {
    "deal_id": "uuid",
    "previous_status": "sourcing",
    "new_status": "negotiation",
    "deal_number": "QAI-7A3F2B1C"
  }
}

// Verify webhook signature
const signature = req.headers["x-webhook-signature"];
const expected = hmacSHA256(JSON.stringify(body), webhookSecret);
if (signature !== expected) throw new Error("Invalid signature");`}</pre>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Rate Limits */}
                <motion.div variants={fadeUp}>
                  <Card className="glass-card border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Zap size={18} className="text-primary" />
                        </div>
                        Rate Limits & Quotas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border/50">
                              <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase">Resource</th>
                              <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase">Free</th>
                              <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase">Starter</th>
                              <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase">Pro</th>
                              <th className="text-left py-3 px-2 text-xs font-semibold text-muted-foreground uppercase">Enterprise</th>
                            </tr>
                          </thead>
                          <tbody className="text-xs text-muted-foreground">
                            {[
                              ["AI Queries/mo", "100", "5,000", "Unlimited", "Unlimited"],
                              ["Quantum Jobs/mo", "10", "50", "Unlimited", "Unlimited"],
                              ["API Integrations", "1", "2", "25", "Unlimited"],
                              ["API Rate Limit", "10/min", "30/min", "60/min", "Custom"],
                              ["Storage", "100 MB", "5 GB", "50 GB", "Custom"],
                              ["Webhooks", "—", "5", "25", "Unlimited"],
                            ].map((row, i) => (
                              <tr key={i} className="border-b border-border/30">
                                {row.map((cell, j) => (
                                  <td key={j} className={`py-2.5 px-2 ${j === 0 ? "text-foreground font-medium" : ""}`}>{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Documentation;
