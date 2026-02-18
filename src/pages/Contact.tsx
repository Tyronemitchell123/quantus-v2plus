import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-24">
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <p className="text-primary font-display text-sm tracking-[0.3em] uppercase mb-4">Get in Touch</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Let's Build the <span className="text-gold-gradient">Future</span>
            </h1>
          </motion.div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl p-12 text-center gold-glow"
            >
              <CheckCircle className="text-primary mx-auto mb-4" size={48} />
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">Message Received</h3>
              <p className="text-muted-foreground">Our team will be in touch within 24 hours.</p>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onSubmit={handleSubmit}
              className="glass-card rounded-2xl p-8 md:p-10 space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Name</label>
                  <Input required placeholder="Your full name" className="bg-secondary border-border" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                  <Input required type="email" placeholder="you@company.com" className="bg-secondary border-border" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Company</label>
                <Input placeholder="Your organization" className="bg-secondary border-border" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Message</label>
                <Textarea required placeholder="Tell us about your project..." rows={5} className="bg-secondary border-border" />
              </div>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                Send Message <Send size={16} />
              </button>
            </motion.form>
          )}
        </div>
      </section>
    </div>
  );
};

export default Contact;
