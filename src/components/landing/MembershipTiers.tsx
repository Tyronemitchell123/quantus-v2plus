import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const tiers = [
  { name: "Silver", price: "£99", features: ["Basic travel & lifestyle", "Logistics coordination", "Standard response time", "Monthly reports"] },
  { name: "Gold", price: "£499", features: ["Medical travel access", "Staffing & aviation light", "Priority orchestration", "Weekly intelligence briefs"], featured: false },
  { name: "Black", price: "£2,500", features: ["Full module access", "Cross-vertical automation", "Dedicated AI pipeline", "24/7 private line"], featured: true },
  { name: "Obsidian", price: "£10,000", features: ["Aviation sourcing", "Medical travel orchestration", "Private office automation", "Dedicated AI cluster"] },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
};

const MembershipTiers = () => (
  <section className="py-24 sm:py-32">
    <div className="container mx-auto px-6">
      <motion.div
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={fadeUp} custom={0}
        className="text-center mb-16"
      >
        <p className="font-body text-xs tracking-[0.35em] uppercase text-primary/70 mb-4">Membership</p>
        <h2 className="font-display text-3xl sm:text-4xl font-medium text-foreground">Select your level of access.</h2>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
        {tiers.map((tier, i) => {
          const isObsidian = tier.name === "Obsidian";
          return (
            <motion.div
              key={tier.name}
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp} custom={i}
              className={`p-7 flex flex-col transition-all duration-500 ${
                isObsidian
                  ? "glass-card border-primary/30 gold-glow scale-[1.02]"
                  : tier.featured
                    ? "glass-card border-primary/20"
                    : "glass-card hover:border-primary/15"
              }`}
            >
              <p className="font-body text-xs tracking-[0.25em] uppercase text-primary/70 mb-4">{tier.name}</p>
              <div className="mb-6">
                <span className="font-display text-3xl font-medium text-foreground">{tier.price}</span>
                <span className="font-body text-sm text-muted-foreground">/mo</span>
              </div>
              <ul className="flex-1 space-y-3 mb-8">
                {tier.features.map((f) => (
                  <li key={f} className="font-body text-sm text-muted-foreground flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-primary/60 mt-2 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/auth"
                className={`block text-center py-3 font-body text-xs tracking-widest uppercase transition-all duration-300 ${
                  isObsidian
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-border text-foreground/60 hover:text-foreground hover:border-primary/30"
                }`}
              >
                {isObsidian ? "Apply for Obsidian" : "Select"}
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export default MembershipTiers;
