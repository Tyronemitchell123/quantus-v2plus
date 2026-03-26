import { motion } from "framer-motion";
import { Globe, MapPin, Ship, Hotel, Sparkles, Filter, Star } from "lucide-react";
import ModuleAIPanel from "./ModuleAIPanel";

const inventory = [
  { type: "Villa", name: "Mykonos Estate", price: "€18,000/wk", privacy: "Ultra-Private", score: 96 },
  { type: "Yacht", name: "M/Y Serenity", price: "€85,000/wk", privacy: "Exclusive", score: 93 },
  { type: "Hotel", name: "Aman Tokyo", price: "£4,200/night", privacy: "Discreet", score: 98 },
  { type: "Experience", name: "Northern Lights Flight", price: "£12,000", privacy: "Private", score: 89 },
];

const LifestyleModule = () => (
  <div className="flex flex-col xl:flex-row gap-6">
    <div className="flex-1 min-w-0 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Globe size={16} className="text-primary" strokeWidth={1.5} />
            <h2 className="font-display text-xl font-medium">Lifestyle & Travel</h2>
          </div>
          <p className="font-body text-xs text-muted-foreground">Hotels, villas, yachts, experiences, itineraries, seasonal planning.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground font-body text-xs tracking-wider hover:bg-primary/90 transition-colors">
          Plan Experience
        </button>
      </div>

      {/* Destination Explorer */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={14} className="text-primary" />
          <h3 className="font-display text-sm font-medium">Destination Explorer</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {["Season", "Privacy Level", "Budget", "Experience Type"].map((f) => (
            <div key={f} className="flex items-center gap-2 px-3 py-2 border border-border bg-secondary/30 font-body text-xs text-muted-foreground">
              <Filter size={10} className="text-primary/50" /> {f}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Luxury Inventory */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <h3 className="font-display text-sm font-medium mb-4">Luxury Inventory</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {inventory.map((item, i) => (
            <div key={i} className="border border-border p-4 hover:border-primary/20 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="font-body text-[9px] tracking-[0.2em] uppercase text-primary/60">{item.type}</span>
                <div className="flex items-center gap-1">
                  <Star size={9} className="text-primary" />
                  <span className="font-body text-[10px] text-primary">{item.score}</span>
                </div>
              </div>
              <p className="font-body text-xs font-medium text-foreground mb-1">{item.name}</p>
              <p className="font-body text-[10px] text-muted-foreground">{item.price} · {item.privacy}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Itinerary Builder */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={14} className="text-primary" />
          <h3 className="font-display text-sm font-medium">Itinerary Builder</h3>
        </div>
        <div className="space-y-2 mb-4">
          {["Travel & Arrival", "Accommodation", "Dining & Experiences", "Security & Transfers", "Departure"].map((step, i) => (
            <div key={step} className="flex items-center gap-3 px-3 py-2 border border-border">
              <span className="font-body text-[9px] text-primary w-4">{i + 1}</span>
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
      <ModuleAIPanel prompts={["Plan a 3-day Dubai experience", "Find ultra-private villas in Greece", "Prepare yacht options for July", "Seasonal travel calendar"]} />
    </div>
  </div>
);

export default LifestyleModule;
