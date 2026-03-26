import { motion } from "framer-motion";
import { Truck, MapPin, Route, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import ModuleAIPanel from "./ModuleAIPanel";

const fleet = [
  { unit: "Recovery Unit 01", status: "Available", location: "London", time: "< 30 min" },
  { unit: "Recovery Unit 02", status: "En Route", location: "Birmingham", time: "45 min" },
  { unit: "Flatbed 03", status: "Available", location: "Manchester", time: "< 20 min" },
];

const LogisticsModule = () => (
  <div className="flex flex-col xl:flex-row gap-6">
    <div className="flex-1 min-w-0 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Truck size={16} className="text-primary" strokeWidth={1.5} />
            <h2 className="font-display text-xl font-medium">Logistics & Recovery</h2>
          </div>
          <p className="font-body text-xs text-muted-foreground">Vehicle recovery, dispatch, route planning, compliance.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground font-body text-xs tracking-wider hover:bg-primary/90 transition-colors">
          Create Dispatch Request
        </button>
      </div>

      {/* Dispatch Console */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin size={14} className="text-primary" />
          <h3 className="font-display text-sm font-medium">Dispatch Console</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          {["Pickup Location", "Drop-off Location", "Vehicle Type", "Priority Level"].map((f) => (
            <div key={f} className="px-3 py-2 border border-border bg-secondary/30 font-body text-xs text-muted-foreground">{f}</div>
          ))}
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground font-body text-xs tracking-wider hover:bg-primary/90 transition-colors">
          Dispatch Now
        </button>
      </motion.div>

      {/* Route Intelligence */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Route size={14} className="text-primary" />
          <h3 className="font-display text-sm font-medium">Route Intelligence</h3>
        </div>
        <div className="space-y-2">
          {[
            { label: "Primary Route", time: "42 min", risk: "Low" },
            { label: "Alternative A", time: "51 min", risk: "Medium" },
            { label: "Alternative B", time: "58 min", risk: "Low" },
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2 border border-border">
              <div className="flex items-center gap-2">
                {r.risk === "Low" ? <CheckCircle size={10} className="text-primary" /> : <AlertTriangle size={10} className="text-yellow-500" />}
                <p className="font-body text-xs text-muted-foreground">{r.label}</p>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={10} className="text-muted-foreground" />
                <span className="font-body text-[10px] text-muted-foreground">{r.time}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Fleet & Vendor Status */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
        <h3 className="font-display text-sm font-medium mb-4">Fleet & Vendor Status</h3>
        <div className="space-y-3">
          {fleet.map((f, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 border border-border">
              <div>
                <p className="font-body text-xs font-medium text-foreground">{f.unit}</p>
                <p className="font-body text-[10px] text-muted-foreground">{f.location} · ETA {f.time}</p>
              </div>
              <span className={`font-body text-[10px] px-2 py-0.5 ${f.status === "Available" ? "text-primary border border-primary/20" : "text-muted-foreground border border-border"}`}>
                {f.status}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>

    <div className="xl:w-72 shrink-0">
      <ModuleAIPanel prompts={["Optimize route", "Prepare incident report", "Find nearest recovery unit", "Fleet utilization analysis"]} />
    </div>
  </div>
);

export default LogisticsModule;
