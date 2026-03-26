import { motion } from "framer-motion";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";

interface Props {
  sortBy: "score" | "price" | "privacy";
  setSortBy: (v: "score" | "price" | "privacy") => void;
  totalOptions: number;
}

const ShortlistFilters = ({ sortBy, setSortBy, totalOptions }: Props) => {
  const sortOptions: { key: "score" | "price" | "privacy"; label: string }[] = [
    { key: "score", label: "Best Match" },
    { key: "price", label: "Lowest Price" },
    { key: "privacy", label: "Most Discreet" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4 lg:sticky lg:top-40"
    >
      <p className="font-body text-[10px] tracking-[0.25em] uppercase text-gold-soft/50 mb-2">
        Filters & Ranking
      </p>

      {/* Sort options */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <ArrowUpDown size={10} className="text-primary/60" />
          <span className="font-body text-[10px] tracking-wider uppercase text-muted-foreground">Sort By</span>
        </div>
        <div className="space-y-1.5">
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className={`w-full text-left px-3 py-2 font-body text-[11px] rounded-lg transition-all ${
                sortBy === opt.key
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-card border border-transparent"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ranking logic */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <SlidersHorizontal size={10} className="text-primary/60" />
          <span className="font-body text-[10px] tracking-wider uppercase text-muted-foreground">Ranking Logic</span>
        </div>
        <p className="font-body text-[10px] text-gold-soft/50 leading-relaxed">
          Ranked by: Privacy → Availability → Vendor Rating
        </p>
      </div>

      {/* Stats */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-body text-[9px] tracking-wider uppercase text-muted-foreground">Total Options</span>
          <span className="font-display text-sm text-primary">{totalOptions}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-body text-[9px] tracking-wider uppercase text-muted-foreground">AI Optimized</span>
          <div className="w-2 h-2 rounded-full bg-primary" />
        </div>
      </div>
    </motion.div>
  );
};

export default ShortlistFilters;
