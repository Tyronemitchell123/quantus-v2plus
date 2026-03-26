import { motion } from "framer-motion";
import { Plus, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

const HeroCard = () => {
  const { user } = useAuth();
  const name = user?.user_metadata?.full_name?.split(" ")[0] || "there";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 md:p-8 relative overflow-hidden"
    >
      <div className="relative z-10">
        <p className="font-display text-xl md:text-2xl font-medium text-foreground mb-1">
          Good day, {name}.
        </p>
        <p className="font-display text-sm italic text-primary/70 mb-6">
          Your world is calibrated and ready.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/intake"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-body text-[11px] tracking-[0.2em] uppercase hover:bg-primary/90 transition-all duration-300"
          >
            <Plus size={12} /> Create New Request
          </Link>
          <Link
            to="/intake"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-foreground/70 font-body text-[11px] tracking-[0.2em] uppercase hover:border-primary/30 hover:text-foreground transition-all duration-300"
          >
            <Eye size={12} /> View Active Deals
          </Link>
        </div>
      </div>
      {/* Gold gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </motion.div>
  );
};

export default HeroCard;
