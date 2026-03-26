import { motion } from "framer-motion";
import type { User } from "@supabase/supabase-js";

interface Props {
  user: User | null;
}

const OnboardingVerification = ({ user }: Props) => (
  <div className="max-w-md mx-auto">
    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-body text-xs tracking-[0.3em] uppercase text-gold-soft/60 mb-4">
      Step 5 of 7
    </motion.p>
    <motion.h2
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="font-display text-3xl sm:text-4xl font-medium text-foreground mb-3"
    >
      Verify your details.
    </motion.h2>
    <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.3, duration: 0.8 }} className="w-16 h-px bg-primary/60 origin-left mb-10" />

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="glass-card p-8 rounded-xl space-y-4"
    >
      <input
        type="text"
        placeholder="Full Name"
        defaultValue={user?.user_metadata?.full_name || ""}
        className="w-full bg-transparent border border-gold-soft/20 rounded-xl px-4 py-3.5 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:shadow-[0_0_12px_-4px_hsl(var(--gold)/0.2)] transition-all duration-300"
      />
      <input
        type="email"
        placeholder="Billing Email"
        defaultValue={user?.email || ""}
        className="w-full bg-transparent border border-gold-soft/20 rounded-xl px-4 py-3.5 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:shadow-[0_0_12px_-4px_hsl(var(--gold)/0.2)] transition-all duration-300"
      />
      <input
        type="text"
        placeholder="Company (optional)"
        className="w-full bg-transparent border border-gold-soft/20 rounded-xl px-4 py-3.5 font-body text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:shadow-[0_0_12px_-4px_hsl(var(--gold)/0.2)] transition-all duration-300"
      />
      <div className="luxury-divider my-2" />
      <button className="w-full text-left p-4 rounded-xl border border-gold-soft/15 hover:border-gold-soft/30 transition-all duration-300">
        <p className="font-body text-xs text-muted-foreground">Payment method</p>
        <p className="font-body text-sm text-foreground mt-1">Add payment details →</p>
      </button>
      <div className="text-center pt-2">
        <span className="font-body text-[10px] tracking-[0.2em] uppercase text-gold-soft/40 cursor-pointer hover:text-gold-soft/70 transition-colors duration-300">
          Request Private Billing
        </span>
      </div>
    </motion.div>
  </div>
);

export default OnboardingVerification;
