import { motion } from "framer-motion";
import { Handshake, BarChart3, FileText, Star, Clock } from "lucide-react";
import ModuleAIPanel from "./ModuleAIPanel";

const partners = [
  { name: "Jetcraft Europe", category: "Aviation", region: "EU", score: 94, response: "< 2h" },
  { name: "Bumrungrad Intl.", category: "Medical", region: "APAC", score: 97, response: "< 4h" },
  { name: "Quintessentially", category: "Lifestyle", region: "Global", score: 91, response: "< 1h" },
  { name: "Greycoat Lumleys", category: "Staffing", region: "UK", score: 89, response: "< 3h" },
];

const PartnershipsModule = () => (
  <div className="flex flex-col xl:flex-row gap-6">
    <div className="flex-1 min-w-0 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Handshake size={16} className="text-primary" strokeWidth={1.5} />
            <h2 className="font-display text-xl font-medium">Partnership Ecosystem</h2>
          </div>
          <p className="font-body text-xs text-muted-foreground">Vendor onboarding, performance tracking, commission agreements.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground font-body text-xs tracking-wider hover:bg-primary/90 transition-colors">
          Add Partner
        </button>
      </div>

      {/* Partner Directory */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-6">
        <h3 className="font-display text-sm font-medium mb-4">Partner Directory</h3>
        <div className="space-y-3">
          {partners.map((p, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 border border-border hover:border-primary/20 transition-colors cursor-pointer">
              <div>
                <p className="font-body text-xs font-medium text-foreground">{p.name}</p>
                <p className="font-body text-[10px] text-muted-foreground">{p.category} · {p.region}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star size={9} className="text-primary" />
                  <span className="font-body text-[10px] text-primary">{p.score}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={9} className="text-muted-foreground" />
                  <span className="font-body text-[10px] text-muted-foreground">{p.response}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Performance Analytics */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={14} className="text-primary" />
          <h3 className="font-display text-sm font-medium">Performance Analytics</h3>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Commission Earned", value: "£124K" },
            { label: "Deals Completed", value: "18" },
            { label: "Avg Response", value: "2.4h" },
            { label: "Reliability", value: "96%" },
          ].map((s) => (
            <div key={s.label} className="text-center p-3 border border-border">
              <p className="font-display text-lg font-medium text-primary mb-1">{s.value}</p>
              <p className="font-body text-[9px] tracking-[0.15em] uppercase text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Partner Agreements */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <FileText size={14} className="text-primary" />
          <h3 className="font-display text-sm font-medium">Partner Agreements</h3>
        </div>
        <div className="space-y-2">
          {["Commission Structures", "Terms & Conditions", "Active Documents", "Renewal Schedule"].map((item) => (
            <div key={item} className="flex items-center justify-between px-3 py-2 border border-border">
              <p className="font-body text-xs text-muted-foreground">{item}</p>
              <span className="font-body text-[10px] text-primary cursor-pointer hover:underline">View</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>

    <div className="xl:w-72 shrink-0">
      <ModuleAIPanel prompts={["Evaluate partner performance", "Prepare onboarding kit", "Suggest new partners", "Commission reconciliation"]} />
    </div>
  </div>
);

export default PartnershipsModule;
