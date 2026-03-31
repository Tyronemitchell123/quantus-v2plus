import { useState, forwardRef } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const LeadCapture = forwardRef<HTMLElement>((_, ref) => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("contact_submissions").insert({
        name: "Lead Capture",
        email,
        message: "Newsletter / lead capture signup from homepage",
      });

      if (error) throw error;

      setSubmitted(true);
      toast({ title: "You're in!", description: "We'll send you exclusive insights and early access updates." });
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section ref={ref} className="py-20 sm:py-28 border-t border-border/30">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium tracking-wider uppercase mb-6">
            <Mail size={14} />
            Stay Informed
          </div>

          <h2 className="font-display text-2xl sm:text-3xl font-medium text-foreground mb-3">
            Not ready yet? <span className="italic text-primary">Stay close.</span>
          </h2>
          <p className="font-body text-muted-foreground text-sm leading-relaxed mb-8">
            Get exclusive market intelligence, platform updates, and early access to new quantum AI features. No spam, ever.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 text-primary font-medium"
            >
              <Check size={20} />
              <span>You're on the list. Welcome aboard.</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-5 py-3 rounded-xl bg-secondary/50 border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Sending..." : "Get Updates"}
                <ArrowRight size={14} />
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
});

LeadCapture.displayName = "LeadCapture";

export default LeadCapture;
