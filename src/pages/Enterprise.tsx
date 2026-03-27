import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Crown, Shield, Zap, BarChart3, Users, Globe, ArrowRight,
  CheckCircle, Calculator, Send, Building2, Phone, Mail, Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import useDocumentHead from "@/hooks/use-document-head";
import HeroImageBackground from "@/components/HeroImageBackground";
import heroEnterprise from "@/assets/hero-enterprise.jpg";
import { enterpriseDemoSchema } from "@/lib/validation";

/* ── ROI Calculator ── */

const ROICalculator = () => {
  const [employees, setEmployees] = useState(50);
  const [hoursManual, setHoursManual] = useState(20);
  const [avgSalary, setAvgSalary] = useState(85);

  const roi = useMemo(() => {
    const hourlyRate = avgSalary / 2080;
    const annualManualCost = employees * hoursManual * 52 * hourlyRate;
    const automationSaving = 0.72;
    const annualSavings = annualManualCost * automationSaving;
    const quantusCost = employees <= 100 ? 24_000 : employees <= 500 ? 60_000 : 120_000;
    const netSavings = annualSavings - quantusCost;
    const roiPercent = quantusCost > 0 ? (netSavings / quantusCost) * 100 : 0;
    const paybackMonths = annualSavings > 0 ? Math.ceil((quantusCost / annualSavings) * 12) : 0;
    return { annualSavings, netSavings, roiPercent, paybackMonths, quantusCost };
  }, [employees, hoursManual, avgSalary]);

  const fmt = (n: number) =>
    n >= 1_000_000
      ? `$${(n / 1_000_000).toFixed(1)}M`
      : `$${Math.round(n).toLocaleString()}`;

  return (
    <div className="glass-card rounded-2xl p-8 md:p-10">
      <div className="flex items-center gap-3 mb-8">
        <Calculator size={20} className="text-primary" />
        <h3 className="font-display text-xl font-semibold text-foreground">ROI Calculator</h3>
      </div>

      <div className="space-y-8">
        {/* Employees */}
        <div>
          <div className="flex justify-between mb-3">
            <label className="text-sm text-muted-foreground">Team size</label>
            <span className="text-sm font-semibold text-foreground">{employees} employees</span>
          </div>
          <Slider
            value={[employees]}
            onValueChange={([v]) => setEmployees(v)}
            min={10}
            max={1000}
            step={10}
          />
        </div>

        {/* Hours on manual analytics */}
        <div>
          <div className="flex justify-between mb-3">
            <label className="text-sm text-muted-foreground">Hours on manual analytics / week</label>
            <span className="text-sm font-semibold text-foreground">{hoursManual}h</span>
          </div>
          <Slider
            value={[hoursManual]}
            onValueChange={([v]) => setHoursManual(v)}
            min={5}
            max={60}
            step={5}
          />
        </div>

        {/* Avg salary */}
        <div>
          <div className="flex justify-between mb-3">
            <label className="text-sm text-muted-foreground">Avg. annual salary (K)</label>
            <span className="text-sm font-semibold text-foreground">${avgSalary}K</span>
          </div>
          <Slider
            value={[avgSalary]}
            onValueChange={([v]) => setAvgSalary(v)}
            min={40}
            max={200}
            step={5}
          />
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 gap-4 mt-10">
        {[
          { label: "Annual savings", value: fmt(roi.annualSavings), accent: true },
          { label: "Net ROI", value: `${Math.round(roi.roiPercent)}%`, accent: true },
          { label: "Payback period", value: `${roi.paybackMonths} mo` },
          { label: "QUANTUS investment", value: fmt(roi.quantusCost) },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-secondary/60 p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">{s.label}</p>
            <p className={`font-display text-2xl font-bold ${s.accent ? "text-primary" : "text-foreground"}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground mt-4 text-center">
        Based on 72% automation rate. Actual results may vary by industry.
      </p>
    </div>
  );
};

/* ── Demo Booking Form ── */

const DemoBookingForm = () => {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "", email: "", company: "", phone: "", teamSize: "", message: "",
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    const validation = enterpriseDemoSchema.safeParse(form);
    if (!validation.success) {
      const errs: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) errs[String(err.path[0])] = err.message;
      });
      setFieldErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("contact_submissions").insert({
        name: form.name,
        email: form.email,
        company: form.company,
        message: `[Enterprise Demo Request] Team: ${form.teamSize}. Phone: ${form.phone}. ${form.message}`,
      });
      if (error) throw error;
      setSubmitted(true);
      toast({ title: "Demo requested!", description: "Our enterprise team will reach out within 24 hours." });
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="glass-card rounded-2xl p-8 md:p-10 text-center gold-glow">
        <CheckCircle size={48} className="text-primary mx-auto mb-4" />
        <h3 className="font-display text-2xl font-bold text-foreground mb-2">Demo Booked</h3>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          A solutions architect will contact you within 24 hours to schedule your personalized walkthrough.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 md:p-10 space-y-5">
      <div className="flex items-center gap-3 mb-4">
        <Phone size={20} className="text-primary" />
        <h3 className="font-display text-xl font-semibold text-foreground">Book a Demo</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name *</label>
          <Input required value={form.name} onChange={set("name")} placeholder="Jane Doe" className={`bg-secondary border-border ${fieldErrors.name ? "border-destructive" : ""}`} />
          {fieldErrors.name && <p className="text-xs text-destructive mt-1">{fieldErrors.name}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Work Email *</label>
          <Input required type="email" value={form.email} onChange={set("email")} placeholder="jane@acme.com" className={`bg-secondary border-border ${fieldErrors.email ? "border-destructive" : ""}`} />
          {fieldErrors.email && <p className="text-xs text-destructive mt-1">{fieldErrors.email}</p>}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Company *</label>
          <Input required value={form.company} onChange={set("company")} placeholder="Acme Corp" className={`bg-secondary border-border ${fieldErrors.company ? "border-destructive" : ""}`} />
          {fieldErrors.company && <p className="text-xs text-destructive mt-1">{fieldErrors.company}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Team Size</label>
          <Input value={form.teamSize} onChange={set("teamSize")} placeholder="e.g. 50–200" className="bg-secondary border-border" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Phone</label>
        <Input type="tel" value={form.phone} onChange={set("phone")} placeholder="+1 (555) 000-0000" className="bg-secondary border-border" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">What are you looking to achieve?</label>
        <Textarea value={form.message} onChange={set("message")} rows={3} placeholder="Tell us about your goals…" className="bg-secondary border-border" />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {submitting ? (
          <div className="w-5 h-5 rounded-full border-2 border-t-primary-foreground border-primary-foreground/30 animate-spin" />
        ) : (
          <>
            <Send size={16} /> Request Enterprise Demo
          </>
        )}
      </button>
    </form>
  );
};

/* ── Capability Cards ── */

const capabilities = [
  { icon: Shield, title: "99.99% SLA", desc: "Guaranteed uptime with dedicated infrastructure and 24/7 monitoring." },
  { icon: Users, title: "Unlimited Users", desc: "No per-seat pricing. Scale your entire organization on one contract." },
  { icon: BarChart3, title: "Custom Analytics", desc: "Bespoke dashboards, reports, and KPIs tailored to your domain." },
  { icon: Globe, title: "Multi-Region Deploy", desc: "Data residency options across US, EU, and APAC compliance zones." },
  { icon: Zap, title: "Quantum Priority", desc: "Dedicated QPU queue with guaranteed execution windows." },
  { icon: Clock, title: "Priority Support", desc: "Dedicated solutions architect and < 1hr response SLA." },
];

const trustedLogos = [
  "Aerospace", "Finance", "Healthcare", "Defence", "Logistics", "Energy",
];

/* ── Page ── */

const Enterprise = () => {
  useDocumentHead({
    title: "Enterprise AI Solutions — QUANTUS",
    description: "Custom AI + quantum computing solutions for global-scale operations. Calculate your ROI and book a personalized demo.",
    canonical: "https://quantus-loom.lovable.app/enterprise",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "QUANTUS Enterprise Solutions",
      description: "Custom quantum AI solutions for global-scale enterprise operations with ROI calculator.",
      url: "https://quantus-loom.lovable.app/enterprise",
    },
  });

  return (
    <div className="pt-16 min-h-screen">
      {/* Hero */}
      <section className="py-28 relative overflow-hidden">
        <HeroImageBackground src={heroEnterprise} alt="Premium enterprise office" opacity="opacity-25" />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-primary/[0.03] rounded-full blur-[140px]" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Crown size={14} className="text-primary" />
              <span className="text-xs text-primary font-semibold tracking-wider uppercase">Enterprise</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-[1.08] mb-6">
              Intelligence at <span className="text-gold-gradient gold-glow-text">Global Scale</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
              Purpose-built for organizations that demand autonomous AI analytics, quantum computing power, and enterprise-grade security — with zero per-seat pricing.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Trusted Industries */}
      <section className="py-12 border-y border-border/50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-8 md:gap-16"
          >
            {trustedLogos.map((name) => (
              <span key={name} className="text-sm font-display tracking-[0.2em] uppercase text-muted-foreground/50">
                {name}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-primary font-display text-sm tracking-[0.3em] uppercase mb-4">Why Enterprise</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Built for the <span className="text-gold-gradient">Boardroom</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {capabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="glass-card rounded-xl p-7 group hover:shadow-lg hover:shadow-primary/5 transition-shadow"
              >
                <cap.icon size={22} className="text-primary mb-4" />
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{cap.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{cap.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ROI + Demo */}
      <section id="roi-demo" className="py-24 border-t border-border">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-primary font-display text-sm tracking-[0.3em] uppercase mb-4">Your Investment</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              Calculate Your <span className="text-gold-gradient">ROI</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              See how much your organization could save by replacing manual analytics with QUANTUS AI.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <ROICalculator />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <DemoBookingForm />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Social proof stats */}
      <section className="py-20 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
            {[
              { stat: "340%", label: "Average client ROI" },
              { stat: "<1hr", label: "Support response SLA" },
              { stat: "99.99%", label: "Platform uptime" },
              { stat: "$42M", label: "Avg. annual savings" },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="font-display text-4xl font-bold text-primary mb-1">{s.stat}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-12 md:p-20 text-center max-w-4xl mx-auto gold-glow"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to <span className="text-gold-gradient">Transform</span> Your Operations?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
              Join the enterprises already saving millions with autonomous quantum-enhanced AI.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="#roi-demo"
                onClick={(e) => { e.preventDefault(); document.querySelector("#roi-demo")?.scrollIntoView({ behavior: "smooth" }); }}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                Book a Demo <ArrowRight size={18} />
              </a>
              <Link
                to="/case-studies"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-border text-foreground font-semibold hover:border-primary/50 transition-colors"
              >
                View Case Studies
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Enterprise;
