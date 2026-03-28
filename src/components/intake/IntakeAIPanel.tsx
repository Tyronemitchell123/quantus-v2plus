import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, Plane, Heart, Users, Globe, Truck, Handshake,
  UserCheck, CalendarDays, MapPin, Utensils, Shield, Star,
} from "lucide-react";

const categorySuggestions: Record<string, { icon: typeof Plane; text: string }[]> = {
  aviation: [
    { icon: Plane, text: "Preferred aircraft category?" },
    { icon: Users, text: "Number of passengers?" },
    { icon: CalendarDays, text: "Departure window?" },
    { icon: Star, text: "Cabin preferences?" },
    { icon: Utensils, text: "Catering or special requirements?" },
  ],
  medical: [
    { icon: Heart, text: "Type of screening or procedure?" },
    { icon: MapPin, text: "Preferred location or clinic?" },
    { icon: Users, text: "Number of patients?" },
    { icon: Shield, text: "Privacy requirements?" },
    { icon: CalendarDays, text: "Availability window?" },
  ],
  staffing: [
    { icon: UserCheck, text: "Position or role required?" },
    { icon: MapPin, text: "Location of assignment?" },
    { icon: CalendarDays, text: "Start date?" },
    { icon: Shield, text: "Background check level?" },
    { icon: Star, text: "Experience requirements?" },
  ],
  lifestyle: [
    { icon: Globe, text: "Destination or region?" },
    { icon: Users, text: "Number of guests?" },
    { icon: CalendarDays, text: "Travel dates?" },
    { icon: Star, text: "Experience preferences?" },
    { icon: Utensils, text: "Dietary or cultural requirements?" },
  ],
  logistics: [
    { icon: Truck, text: "Origin and destination?" },
    { icon: Star, text: "Type of goods or vehicle?" },
    { icon: Shield, text: "Insurance requirements?" },
    { icon: CalendarDays, text: "Collection window?" },
    { icon: MapPin, text: "Storage needed?" },
  ],
  partnerships: [
    { icon: Handshake, text: "Partnership type?" },
    { icon: Globe, text: "Target region?" },
    { icon: Star, text: "Industry vertical?" },
    { icon: Shield, text: "Exclusivity requirements?" },
    { icon: CalendarDays, text: "Timeline?" },
  ],
};

const defaultSuggestions = [
  { icon: Star, text: "What category does this fall under?" },
  { icon: MapPin, text: "Any location preferences?" },
  { icon: CalendarDays, text: "What's your timeline?" },
  { icon: Shield, text: "Any privacy considerations?" },
];

interface Props {
  message: string;
  category: string;
}

const IntakeAIPanel = ({ message, category }: Props) => {
  const suggestions = useMemo(() => {
    if (category && categorySuggestions[category]) {
      return categorySuggestions[category];
    }
    // Try to detect category from message
    const lower = message.toLowerCase();
    if (lower.includes("aircraft") || lower.includes("jet") || lower.includes("flight")) return categorySuggestions.aviation;
    if (lower.includes("health") || lower.includes("medical") || lower.includes("clinic")) return categorySuggestions.medical;
    if (lower.includes("chef") || lower.includes("staff") || lower.includes("manager")) return categorySuggestions.staffing;
    if (lower.includes("yacht") || lower.includes("villa") || lower.includes("charter")) return categorySuggestions.lifestyle;
    if (lower.includes("transport") || lower.includes("recovery") || lower.includes("logistics")) return categorySuggestions.logistics;
    return defaultSuggestions;
  }, [message, category]);

  const isActive = message.length > 10 || !!category;

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.25 }}
      className="glass-card rounded-xl border-primary/10 p-6 lg:sticky lg:top-40"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Sparkles size={14} className="text-primary" />
        </div>
        <div>
          <p className="font-display text-sm text-foreground">Quantus V2+ Core</p>
          <p className="font-body text-[9px] tracking-wider text-gold-soft/50 uppercase">AI Anticipation</p>
        </div>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex-1 h-px bg-primary/20 origin-left"
        />
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 mb-5">
        <div className={`w-2 h-2 rounded-full ${isActive ? "bg-primary animate-pulse" : "bg-muted-foreground/30"}`} />
        <span className="font-body text-[10px] text-muted-foreground">
          {isActive ? "Quantus V2+ anticipates you may need:" : "Begin typing to activate anticipation..."}
        </span>
      </div>

      {/* Suggestions */}
      <div className="space-y-2">
        {suggestions.map((s, i) => (
          <motion.div
            key={`${s.text}-${i}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: isActive ? 1 : 0.35, y: 0 }}
            transition={{ delay: isActive ? i * 0.12 : 0 }}
            className={`flex items-center gap-3 px-3.5 py-2.5 border rounded-lg transition-all cursor-pointer group ${
              isActive
                ? "border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                : "border-border/50"
            }`}
          >
            <s.icon size={12} className={`shrink-0 ${isActive ? "text-primary/60" : "text-muted-foreground/30"}`} />
            <span className={`font-body text-xs ${isActive ? "text-foreground/80 group-hover:text-foreground" : "text-muted-foreground/40"}`}>
              {s.text}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Intelligence note */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-5 pt-4 border-t border-border/50"
        >
          <p className="font-body text-[10px] text-gold-soft/50 leading-relaxed">
            Quantus V2+ will classify, score, and route your request through the 7-phase engine automatically.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default IntakeAIPanel;
