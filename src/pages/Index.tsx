import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Plane, Heart, Users, Globe, Truck, Handshake, MessageSquare, ArrowRight, Shield, Brain, Clock } from "lucide-react";
import useDocumentHead from "@/hooks/use-document-head";

const modules = [
  { icon: Plane, title: "Aviation Intelligence", desc: "Aircraft sourcing, jet valuation, buyer-seller matching, and ownership cost modeling.", link: "/dashboard" },
  { icon: Heart, title: "Medical Travel & Wellness", desc: "Clinic matching, itinerary building, longevity programs, and post-care workflows.", link: "/dashboard" },
  { icon: Users, title: "Household & Staffing", desc: "Role definition, staffing matchmaker, estate digital twin, and performance analytics.", link: "/dashboard" },
  { icon: Globe, title: "Luxury Travel & Lifestyle", desc: "Ultra-luxury itineraries, hotel/yacht matching, visa compliance, and cultural curation.", link: "/dashboard" },
  { icon: Truck, title: "Operational Logistics", desc: "Dispatch automation, incident triage, fleet analytics, and compliance documentation.", link: "/dashboard" },
  { icon: Handshake, title: "Partnership Intelligence", desc: "Partner scoring, revenue-share modeling, brand alignment, and licensing automation.", link: "/dashboard" },
  { icon: MessageSquare, title: "Communication Engine", desc: "Cinematic messaging, narrative-driven updates, onboarding sequences, and follow-ups.", link: "/dashboard" },
];

const tiers = [
  { name: "Silver", price: "£99", period: "/mo", features: ["2 active modules", "Standard AI processing", "Email support", "Monthly reports"] },
  { name: "Gold", price: "£499", period: "/mo", features: ["5 active modules", "Priority AI processing", "Dedicated advisor", "Weekly intelligence briefs"], featured: true },
  { name: "Black", price: "£2,500", period: "/mo", features: ["All modules", "Real-time AI orchestration", "24/7 private line", "Custom integrations"] },
  { name: "Obsidian", price: "£10,000", period: "/mo", features: ["Full platform access", "White-glove onboarding", "Bespoke AI models", "On-site consultations"] },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }),
};

const Index = () => {
  useDocumentHead({
    title: "Quantus A.I — Ultra-Premium Intelligence Platform",
    description: "A multi-vertical orchestration engine for UHNW clients. Aviation, medical travel, staffing, luxury lifestyle — unified in one private interface.",
  });

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.7], [1, 0.96]);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <motion.section ref={heroRef} style={{ opacity: heroOpacity, scale: heroScale }} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />

        <div className="relative z-10 container mx-auto px-6 text-center max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}>
            <p className="font-body text-xs tracking-[0.35em] uppercase text-primary/80 mb-8">Private Intelligence Platform</p>
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-medium leading-[0.95] tracking-tight mb-8">
              <span className="text-gold-gradient">Quantus</span>
              <br />
              <span className="text-foreground font-light italic">A.I</span>
            </h1>
            <p className="font-body text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-12">
              A multi-vertical orchestration engine designed for those who operate at the highest level. Aviation. Medical travel. Staffing. Lifestyle. Unified.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth" className="px-8 py-3.5 font-body text-sm font-medium tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300">
                Request Access
              </Link>
              <Link to="/about" className="px-8 py-3.5 font-body text-sm font-medium tracking-widest uppercase border border-border text-foreground/70 hover:text-foreground hover:border-primary/30 transition-all duration-300">
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}>
          <div className="w-px h-12 bg-gradient-to-b from-primary/40 to-transparent" />
        </motion.div>
      </motion.section>

      <div className="luxury-divider" />

      {/* Philosophy */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} custom={0}>
            <p className="font-body text-xs tracking-[0.35em] uppercase text-primary/70 mb-6">Philosophy</p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium leading-tight mb-8">
              Not a concierge.
              <br />
              <span className="italic text-primary">An orchestration engine.</span>
            </h2>
            <p className="font-body text-muted-foreground leading-relaxed text-base sm:text-lg">
              Quantus A.I anticipates, automates, and executes across every vertical of ultra-high-net-worth life — from sourcing a Gulfstream to scheduling a stem cell consultation, from placing a household chef to negotiating a brand partnership.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="luxury-divider" />

      {/* Differentiators */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-16">
            <p className="font-body text-xs tracking-[0.35em] uppercase text-primary/70 mb-4">Why Quantus</p>
            <h2 className="font-display text-3xl sm:text-4xl font-medium">Built for discretion. Designed for power.</h2>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { icon: Shield, title: "Privacy-First", desc: "End-to-end encrypted workflows. No third-party data sharing. Ever." },
              { icon: Brain, title: "Anticipatory Logic", desc: "AI that learns your patterns and acts before you ask." },
              { icon: Clock, title: "Always On", desc: "24/7 autonomous operations across all time zones and verticals." },
            ].map((item, i) => (
              <motion.div key={item.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 1} className="glass-card p-8 text-center group hover:border-primary/20 transition-colors duration-500">
                <item.icon className="w-6 h-6 text-primary mx-auto mb-5" strokeWidth={1.5} />
                <h3 className="font-display text-lg font-medium mb-3">{item.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="luxury-divider" />

      {/* Modules */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-16">
            <p className="font-body text-xs tracking-[0.35em] uppercase text-primary/70 mb-4">Modules</p>
            <h2 className="font-display text-3xl sm:text-4xl font-medium">Seven verticals. One intelligence layer.</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {modules.map((mod, i) => (
              <motion.div key={mod.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.5} className="glass-card p-7 group hover:border-primary/20 transition-all duration-500 flex flex-col">
                <mod.icon className="w-5 h-5 text-primary mb-5" strokeWidth={1.5} />
                <h3 className="font-display text-base font-medium mb-2">{mod.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed flex-1">{mod.desc}</p>
                <div className="mt-5 flex items-center gap-1.5 text-primary/60 group-hover:text-primary transition-colors">
                  <span className="font-body text-xs tracking-wider uppercase">Explore</span>
                  <ArrowRight size={12} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="luxury-divider" />

      {/* Membership */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-16">
            <p className="font-body text-xs tracking-[0.35em] uppercase text-primary/70 mb-4">Membership</p>
            <h2 className="font-display text-3xl sm:text-4xl font-medium">Select your level of access.</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {tiers.map((tier, i) => (
              <motion.div key={tier.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.5}
                className={`p-7 flex flex-col transition-all duration-500 ${tier.featured ? "glass-card border-primary/30 gold-glow" : "glass-card hover:border-primary/15"}`}>
                <p className="font-body text-xs tracking-[0.25em] uppercase text-primary/70 mb-4">{tier.name}</p>
                <div className="mb-6">
                  <span className="font-display text-3xl font-medium">{tier.price}</span>
                  <span className="font-body text-sm text-muted-foreground">{tier.period}</span>
                </div>
                <ul className="flex-1 space-y-3 mb-8">
                  {tier.features.map((f) => (
                    <li key={f} className="font-body text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary/60 mt-2 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/auth" className={`block text-center py-3 font-body text-xs tracking-widest uppercase transition-all duration-300 ${tier.featured ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border border-border text-foreground/60 hover:text-foreground hover:border-primary/30"}`}>
                  {tier.name === "Obsidian" ? "Apply" : "Select"}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="luxury-divider" />

      {/* CTA */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-medium leading-tight mb-6">
              Your private office.
              <br />
              <span className="italic text-primary">One interface.</span>
            </h2>
            <p className="font-body text-muted-foreground mb-10 text-base sm:text-lg leading-relaxed">
              Experience the future of ultra-premium service orchestration.
            </p>
            <Link to="/auth" className="inline-block px-10 py-4 font-body text-sm font-medium tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300">
              Begin
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default Index;
