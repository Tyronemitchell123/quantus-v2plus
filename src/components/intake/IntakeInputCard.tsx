import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Plane, Heart, Users, Globe, Truck, Handshake,
  Sparkles, ChevronDown, Paperclip, Save, Loader2,
  DollarSign, Clock, Shield, MessageSquare,
} from "lucide-react";

const categories = [
  { key: "aviation", label: "Aviation", icon: Plane },
  { key: "medical", label: "Medical", icon: Heart },
  { key: "staffing", label: "Staffing", icon: Users },
  { key: "lifestyle", label: "Lifestyle", icon: Globe },
  { key: "logistics", label: "Logistics", icon: Truck },
  { key: "partnerships", label: "Other", icon: Handshake },
];

const exampleRequests = [
  "Looking for a Gulfstream G450 under 18M, low hours, pedigree only, need options this week.",
  "Executive health screening for 4 people in Zurich or London, next month. Budget flexible.",
  "Need a private chef and estate manager for our Cotswolds property. Start ASAP.",
  "Planning a 2-week Mediterranean yacht charter, August, 8 guests, budget around 200K EUR.",
];

interface Props {
  message: string;
  setMessage: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  loading: boolean;
  onSubmit: () => void;
}

const IntakeInputCard = ({ message, setMessage, category, setCategory, loading, onSubmit }: Props) => {
  const [showDetails, setShowDetails] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card rounded-xl border-primary/10 overflow-hidden"
    >
      <div className="p-6 space-y-5">
        {/* Category pills */}
        <div>
          <p className="font-body text-[9px] tracking-[0.25em] uppercase text-muted-foreground mb-3">Category</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setCategory(category === cat.key ? "" : cat.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 font-body text-[10px] tracking-[0.15em] uppercase border rounded-lg transition-all duration-300 ${
                  category === cat.key
                    ? "border-primary bg-primary/10 text-primary gold-glow"
                    : "border-border text-muted-foreground hover:border-primary/20 hover:text-foreground"
                }`}
              >
                <cat.icon size={12} />
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description Box */}
        <div>
          <p className="font-body text-[9px] tracking-[0.25em] uppercase text-muted-foreground mb-3">Tell Quantus V2+ what you need</p>
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSubmit(); }
              }}
              placeholder="Describe your request in natural language..."
              className="w-full bg-card border border-border rounded-lg text-foreground font-body text-sm p-4 resize-none min-h-[140px] focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/40 transition-all"
              disabled={loading}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button className="p-2 text-muted-foreground/40 hover:text-primary transition-colors">
                <Paperclip size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Examples toggle */}
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="font-body text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
        >
          <Sparkles size={10} className="text-primary/60" />
          Example requests
          <ChevronDown size={10} className={`transition-transform ${showExamples ? "rotate-180" : ""}`} />
        </button>

        <AnimatePresence>
          {showExamples && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1.5 overflow-hidden"
            >
              {exampleRequests.map((ex, i) => (
                <button
                  key={i}
                  onClick={() => { setMessage(ex); setShowExamples(false); textareaRef.current?.focus(); }}
                  className="w-full text-left p-3 border border-border/50 bg-card/50 hover:border-primary/30 hover:bg-card transition-all font-body text-[11px] text-muted-foreground hover:text-foreground rounded-lg"
                >
                  {ex}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Optional details accordion */}
        <div className="border-t border-border/50 pt-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 font-body text-[10px] tracking-[0.15em] uppercase text-primary/60 hover:text-primary transition-colors w-full"
          >
            <ChevronDown size={12} className={`transition-transform ${showDetails ? "rotate-180" : ""}`} />
            Additional Details (Optional)
          </button>

          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {[
                    { icon: DollarSign, label: "Budget Range", placeholder: "e.g. $500K – $2M" },
                    { icon: Clock, label: "Deadline", placeholder: "e.g. Within 2 weeks" },
                    { icon: Shield, label: "Sensitivities", placeholder: "Privacy, urgency, risk..." },
                    { icon: MessageSquare, label: "Notes for Quantus V2+", placeholder: "Any special instructions..." },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="font-body text-[9px] tracking-[0.15em] uppercase text-muted-foreground/60 mb-1.5 block flex items-center gap-1">
                        <field.icon size={9} /> {field.label}
                      </label>
                      <input
                        type="text"
                        placeholder={field.placeholder}
                        className="w-full bg-card border border-border rounded-lg text-foreground font-body text-xs px-3 py-2 focus:outline-none focus:border-primary/30 placeholder:text-muted-foreground/30 transition-all"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom bar with CTAs */}
      <div className="px-6 py-4 border-t border-border/50 flex items-center gap-3">
        <button className="flex items-center gap-1.5 px-4 py-2.5 border border-border font-body text-[10px] tracking-[0.15em] uppercase text-muted-foreground hover:border-primary/20 hover:text-foreground transition-all rounded-lg">
          <Save size={10} /> Save Draft
        </button>
        <button
          onClick={onSubmit}
          disabled={loading || !message.trim()}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-body text-xs tracking-[0.25em] uppercase hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed rounded-xl gold-glow"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          {loading ? "Classifying..." : "Start Orchestration"}
        </button>
      </div>
    </motion.div>
  );
};

export default IntakeInputCard;
