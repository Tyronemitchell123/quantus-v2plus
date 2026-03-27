import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, Brain, Globe, Users, Plane, Heart } from "lucide-react";
import useDocumentHead from "@/hooks/use-document-head";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }),
};

const About = () => {
  useDocumentHead({
    title: "About — Quantus A.I",
    description: "The story behind the most discreet intelligence platform ever built for ultra-high-net-worth individuals.",
    canonical: "https://quantus-loom.lovable.app/about",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: "About Quantus A.I",
      description: "The story behind the most discreet intelligence platform ever built for ultra-high-net-worth individuals.",
      url: "https://quantus-loom.lovable.app/about",
    },
  });

  return (
    <main className="min-h-screen bg-background pt-24">
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-6 max-w-3xl text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <p className="font-body text-xs tracking-[0.35em] uppercase text-primary/70 mb-6">Our Story</p>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-medium leading-tight mb-8">
              Intelligence, <br /><span className="italic text-primary">reimagined.</span>
            </h1>
            <p className="font-body text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Quantus A.I was born from a simple observation: the most successful people in the world still rely on fragmented, manual processes to manage the complexity of their lives. We built something better.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="luxury-divider" />

      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
              <p className="font-body text-xs tracking-[0.35em] uppercase text-primary/70 mb-4">Mission</p>
              <h2 className="font-display text-3xl sm:text-4xl font-medium leading-tight mb-6">
                To make complexity <br /><span className="italic text-primary">invisible.</span>
              </h2>
              <p className="font-body text-muted-foreground leading-relaxed mb-4">
                We believe that managing aviation acquisitions, medical travel, household staffing, and lifestyle logistics should feel effortless.
              </p>
              <p className="font-body text-muted-foreground leading-relaxed">
                Quantus A.I is an autonomous orchestration engine that operates silently across seven verticals, ensuring every detail is handled with precision and discretion.
              </p>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2} className="glass-card p-10 text-center">
              <div className="grid grid-cols-2 gap-8">
                {[{ value: "7", label: "Verticals" }, { value: "24/7", label: "Autonomous" }, { value: "100%", label: "Encrypted" }, { value: "0", label: "Data Shared" }].map((stat) => (
                  <div key={stat.label}>
                    <p className="font-display text-3xl font-medium text-primary mb-1">{stat.value}</p>
                    <p className="font-body text-xs text-muted-foreground tracking-wider uppercase">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className="luxury-divider" />

      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0} className="text-center mb-16">
            <p className="font-body text-xs tracking-[0.35em] uppercase text-primary/70 mb-4">Principles</p>
            <h2 className="font-display text-3xl sm:text-4xl font-medium">What we stand for.</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Shield, title: "Absolute Privacy", desc: "Your data never leaves the platform. No third-party sharing, no exceptions." },
              { icon: Brain, title: "Anticipatory Intelligence", desc: "AI that learns your patterns and acts proactively." },
              { icon: Globe, title: "Global Reach", desc: "Operations across every time zone and regulatory environment." },
              { icon: Users, title: "Discreet Power", desc: "Maximum capability with minimum visibility." },
              { icon: Plane, title: "Vertical Mastery", desc: "Deep expertise in aviation, medical, staffing, and lifestyle." },
              { icon: Heart, title: "Human-Centered", desc: "Technology that serves people, not the other way around." },
            ].map((value, i) => (
              <motion.div key={value.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.5}
                className="glass-card p-7 group hover:border-primary/20 transition-colors duration-500">
                <value.icon className="w-5 h-5 text-primary mb-5" strokeWidth={1.5} />
                <h3 className="font-display text-base font-medium mb-2">{value.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="luxury-divider" />

      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <h2 className="font-display text-3xl sm:text-4xl font-medium leading-tight mb-6">
              Ready to experience <br /><span className="italic text-primary">intelligent orchestration?</span>
            </h2>
            <p className="font-body text-muted-foreground mb-10 leading-relaxed">
              Join a select group of individuals and family offices who have chosen to operate differently.
            </p>
            <Link to="/auth" className="inline-block px-10 py-4 font-body text-sm font-medium tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300">
              Request Access
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default About;
