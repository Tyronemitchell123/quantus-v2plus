import { motion } from "framer-motion";
import { Heart, Stethoscope, Calendar, MapPin, Filter } from "lucide-react";
import ModuleAIPanel from "./ModuleAIPanel";

const categories = ["Diagnostics", "Surgery", "Longevity", "Regenerative Medicine", "Wellness Retreats", "Executive Health"];

const MedicalModule = () => (
  <div className="flex flex-col xl:flex-row gap-6">
    <div className="flex-1 min-w-0 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Heart size={16} className="text-primary" strokeWidth={1.5} />
            <h2 className="font-display text-xl font-medium">Medical & Wellness</h2>
          </div>
          <p className="font-body text-xs text-muted-foreground">Diagnostics, surgery, longevity programs, wellness retreats, executive health.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground font-body text-xs tracking-wider hover:bg-primary/90 transition-colors">
          Start Medical Journey
        </button>
      </div>

      {/* Treatment Categories */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-6">
        <h3 className="font-display text-sm font-medium mb-4">Treatment Categories</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((c) => (
            <button key={c} className="px-4 py-3 border border-border text-left hover:border-primary/20 transition-all group cursor-pointer">
              <Stethoscope size={14} className="text-primary mb-2" />
              <p className="font-body text-xs font-medium text-foreground group-hover:text-primary transition-colors">{c}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Clinic & Doctor Matching */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <h3 className="font-display text-sm font-medium mb-4">Clinic & Doctor Matching</h3>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          {["Region", "Specialty", "Budget", "Risk Tolerance"].map((f) => (
            <div key={f} className="flex items-center gap-2 px-3 py-2 border border-border bg-secondary/30 font-body text-xs text-muted-foreground">
              <Filter size={10} className="text-primary/50" /> {f}
            </div>
          ))}
        </div>
        <p className="font-body text-[10px] text-muted-foreground italic">AI: Top 3 clinics for executive diagnostics identified in Zurich, Seoul, Bangkok.</p>
      </motion.div>

      {/* Medical Travel Planner */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar size={14} className="text-primary" />
          <h3 className="font-display text-sm font-medium">Medical Travel Planner</h3>
        </div>
        <div className="space-y-2 mb-4">
          {["Pre-Screening", "Travel & Arrival", "Treatment Phase", "Recovery", "Follow-Up"].map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border border-primary/30 flex items-center justify-center">
                <span className="font-body text-[9px] text-primary">{i + 1}</span>
              </div>
              <p className="font-body text-xs text-muted-foreground">{step}</p>
            </div>
          ))}
        </div>
        <button className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary font-body text-xs tracking-wider hover:bg-primary/20 transition-colors">
          Generate Itinerary
        </button>
      </motion.div>
    </div>

    <div className="xl:w-72 shrink-0">
      <ModuleAIPanel prompts={["Find top cardiology clinics", "Plan a 7-day wellness retreat", "Prepare medical intake forms", "Compare longevity programs"]} />
    </div>
  </div>
);

export default MedicalModule;
