import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What is Quantus V2+ and who is it for?",
    a: "Quantus V2+ is an AI-powered deal orchestration platform designed for ultra-high-net-worth clients, family offices, and private concierge operators. It unifies 9 verticals — aviation, marine, medical, legal, finance, staffing, logistics, partnerships, and lifestyle — into one sovereign interface.",
  },
  {
    q: "How does the AI deal pipeline work?",
    a: "Submit a request in natural language. Our AI classifies it across verticals, matches vetted vendors, generates outreach, tracks negotiations, handles document signing, and calculates commissions — all automatically with human oversight at every stage.",
  },
  {
    q: "Is my data secure and GDPR compliant?",
    a: "Absolutely. We implement enterprise-grade encryption, row-level security, regional data residency (UK, EU, APAC), and GDPR/PDPA compliance. KYC verification adds an additional trust layer for high-value transactions.",
  },
  {
    q: "What verticals does Quantus cover?",
    a: "Aviation, marine & yachts, medical travel, legal & compliance, finance & advisory, staffing & crew, logistics & transport, partnerships & brokerage, and luxury lifestyle. Each vertical has specialised AI models and vendor networks.",
  },
  {
    q: "How much does it cost to get started?",
    a: "Our Starter plan begins at $29/month with no credit card required for the trial period. Professional plans at $149/month and Teams at $49/seat unlock advanced features including priority deal processing and custom commission rates.",
  },
  {
    q: "Can I use Quantus for my family office or private bank?",
    a: "Yes. Our Enterprise tier provides bespoke deployment with dedicated infrastructure, white-label options, custom integrations, and 24/7 priority support tailored to institutional requirements.",
  },
];

const LandingFAQ = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-24 sm:py-32 bg-background relative">
      <div className="container mx-auto px-6 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-[8px] tracking-[0.6em] uppercase text-primary/40 font-body mb-4">
            Frequently Asked
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-medium text-foreground">
            Common Questions
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="border border-gold-soft/10 rounded-xl overflow-hidden hover:border-gold-soft/20 transition-colors duration-300"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className="font-body text-sm text-foreground pr-4">{faq.q}</span>
                <ChevronDown
                  size={16}
                  className={`text-primary/60 shrink-0 transition-transform duration-300 ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="px-6 pb-5 font-body text-sm text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map(f => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
    </section>
  );
};

export default LandingFAQ;
