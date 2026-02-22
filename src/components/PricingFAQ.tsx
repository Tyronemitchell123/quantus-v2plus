import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Can I switch between monthly and annual billing?",
    a: "Absolutely. You can upgrade to annual billing at any time and receive a prorated credit for your remaining monthly period. Downgrading to monthly takes effect at the end of your current annual term.",
  },
  {
    q: "What happens when I exceed my query limit?",
    a: "On the Starter plan, additional queries are billed at $0.003 each. Professional and Enterprise plans include unlimited queries, so you'll never hit a ceiling.",
  },
  {
    q: "Is there a free trial available?",
    a: "Yes — the Starter plan includes a 14-day free trial with full access to all Starter features. No credit card required to start.",
  },
  {
    q: "How does the Enterprise pricing work?",
    a: "Enterprise pricing is tailored to your organization's scale, usage patterns, and support requirements. Request a custom proposal through our AI-powered configurator and receive it within 24 hours.",
  },
  {
    q: "Can I cancel my subscription at any time?",
    a: "Yes, you can cancel anytime. Monthly plans end at the close of your current billing cycle. Annual plans can be cancelled with a prorated refund for unused months.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept bank transfers via TrueLayer's open banking network, covering all major UK and European banks. Payments are instant and secure — no card details needed.",
  },
];

const PricingFAQ = () => (
  <section className="py-24 border-t border-border">
    <div className="container mx-auto px-6 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <p className="text-primary font-display text-sm tracking-[0.3em] uppercase mb-4">FAQ</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
          Common <span className="text-gold-gradient">Questions</span>
        </h2>
      </motion.div>

      <Accordion type="single" collapsible className="space-y-3">
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
          >
            <AccordionItem value={`faq-${i}`} className="glass-card rounded-xl border-none px-6">
              <AccordionTrigger className="text-sm font-medium text-foreground hover:text-primary py-5 hover:no-underline">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          </motion.div>
        ))}
      </Accordion>
    </div>
  </section>
);

export default PricingFAQ;
