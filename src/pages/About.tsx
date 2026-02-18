import { motion } from "framer-motion";
import { Cpu, Eye, Target } from "lucide-react";

const capabilities = [
  { icon: Cpu, title: "Neural Architecture", desc: "Our proprietary neural networks process billions of data points to deliver unmatched predictive accuracy." },
  { icon: Eye, title: "Computer Vision", desc: "Advanced image and video analysis powering real-time environmental understanding." },
  { icon: Target, title: "Strategic Reasoning", desc: "Multi-step planning and decision-making that rivals the world's best strategists." },
];

const About = () => (
  <div className="pt-24">
    {/* Hero */}
    <section className="py-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <p className="text-primary font-display text-sm tracking-[0.3em] uppercase mb-6">Our Story</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight mb-8">
            Engineering the <span className="text-gold-gradient">Impossible</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            NEXUS AI was founded on a singular vision: to create autonomous intelligence that doesn't just assist — it leads. We build AI systems that think, strategize, and execute at the highest level, serving the world's most ambitious organizations.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Mission */}
    <section className="py-24 border-y border-border">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
              Our Mission
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              To democratize the most powerful AI for visionary enterprises. We believe intelligence should be seamless, autonomous, and transformative.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Every system we build is designed to operate independently — learning from data, adapting to markets, and delivering results that compound over time.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-10 gold-glow"
          >
            <div className="text-6xl font-display font-bold text-gold-gradient mb-4">2026</div>
            <p className="text-foreground font-display text-xl font-semibold mb-2">Year of Autonomous AI</p>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Our next-generation platform processes over 10 billion decisions daily, with zero human intervention required.
            </p>
          </motion.div>
        </div>
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
          <p className="text-primary font-display text-sm tracking-[0.3em] uppercase mb-4">AI Capabilities</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
            What Powers <span className="text-gold-gradient">NEXUS</span>
          </h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8">
          {capabilities.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-xl p-8 text-center"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-6">
                <c.icon className="text-primary" size={24} />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">{c.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default About;
