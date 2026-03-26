import { motion } from "framer-motion";
import { Users, UserCheck, ClipboardCheck, Filter, Star } from "lucide-react";
import ModuleAIPanel from "./ModuleAIPanel";

const roles = ["Estate Manager", "House Manager", "Chef", "Nanny", "Security", "Personal Assistant", "Private Office"];

const candidates = [
  { name: "Candidate A", skills: "Estate Mgmt, Yacht", experience: "12 yrs", score: 94 },
  { name: "Candidate B", skills: "House Mgmt, Events", experience: "8 yrs", score: 87 },
  { name: "Candidate C", skills: "Security, Close Protection", experience: "15 yrs", score: 91 },
];

const StaffingModule = () => (
  <div className="flex flex-col xl:flex-row gap-6">
    <div className="flex-1 min-w-0 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users size={16} className="text-primary" strokeWidth={1.5} />
            <h2 className="font-display text-xl font-medium">UHNW Staffing</h2>
          </div>
          <p className="font-body text-xs text-muted-foreground">Household staff, estate management, private office roles, security.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground font-body text-xs tracking-wider hover:bg-primary/90 transition-colors">
          Create Staffing Request
        </button>
      </div>

      {/* Role Selection */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-6">
        <h3 className="font-display text-sm font-medium mb-4">Role Selection</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {roles.map((r) => (
            <button key={r} className="px-3 py-3 border border-border text-left hover:border-primary/20 transition-all cursor-pointer">
              <UserCheck size={12} className="text-primary mb-2" />
              <p className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors">{r}</p>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Candidate Pipeline */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <h3 className="font-display text-sm font-medium mb-4">Candidate Pipeline</h3>
        <div className="space-y-3">
          {candidates.map((c, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 border border-border hover:border-primary/20 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <span className="font-body text-[10px] text-muted-foreground">{c.name.split(" ")[1]}</span>
                </div>
                <div>
                  <p className="font-body text-xs font-medium text-foreground">{c.name}</p>
                  <p className="font-body text-[10px] text-muted-foreground">{c.skills} · {c.experience}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Star size={10} className="text-primary" />
                <span className="font-body text-xs text-primary">{c.score}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Interview & Vetting */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardCheck size={14} className="text-primary" />
          <h3 className="font-display text-sm font-medium">Interview & Vetting</h3>
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          {["Schedule Interviews", "Background Check", "Reference Uploads", "Offer Letter"].map((s) => (
            <div key={s} className="px-3 py-2 border border-border font-body text-xs text-muted-foreground">{s}</div>
          ))}
        </div>
        <button className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary font-body text-xs tracking-wider hover:bg-primary/20 transition-colors">
          Prepare Offer Letter
        </button>
      </motion.div>
    </div>

    <div className="xl:w-72 shrink-0">
      <ModuleAIPanel prompts={["Find candidates with yacht experience", "Prepare interview questions", "Draft placement agreement", "Estimate placement fees"]} />
    </div>
  </div>
);

export default StaffingModule;
