import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Plane, Heart, Users, ArrowRight, Check, Clock, Lightbulb, Activity,
  FileText, CreditCard, MessageSquare,
} from "lucide-react";

const activeDeals = [
  { id: "A-219", category: "Aviation", icon: Plane, phase: 3, total: 7, action: "Review aircraft options", progress: 42 },
  { id: "M-087", category: "Medical", icon: Heart, phase: 5, total: 7, action: "Approve Zurich itinerary", progress: 71 },
  { id: "S-142", category: "Staffing", icon: Users, phase: 2, total: 7, action: "Confirm shortlist", progress: 28 },
];

const priorities = [
  { text: "Review aircraft options for Deal #A-219.", time: "~15 min", done: false },
  { text: "Approve medical itinerary for Zurich clinic.", time: "~10 min", done: false },
  { text: "Confirm staffing shortlist for Mayfair residence.", time: "~8 min", done: true },
];

const insights = [
  { icon: Plane, text: "Aviation market shows 3 new off-market listings." },
  { icon: Heart, text: "Your medical provider has updated availability." },
  { icon: Users, text: "Staffing candidates have completed background checks." },
];

const recentActivity = [
  { icon: MessageSquare, text: "Vendor response received — Gulfstream G700", time: "12 min ago" },
  { icon: FileText, text: "Document signed — Dr. Nazari Service Agreement", time: "1 hour ago" },
  { icon: Activity, text: "Negotiation update — Charter pricing revised", time: "3 hours ago" },
  { icon: CreditCard, text: "Invoice processed — Staffing retainer Q1", time: "Yesterday" },
];

const DashboardFeed = () => (
  <div className="space-y-8">
    {/* Section 1 — Active Deals */}
    <section>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between mb-4"
      >
        <p className="font-body text-[11px] tracking-[0.25em] uppercase text-gold-soft/50">Active Deals</p>
        <Link to="/deals" className="font-body text-[10px] tracking-[0.15em] uppercase text-gold-soft/40 hover:text-gold-soft/70 transition-colors">
          View All →
        </Link>
      </motion.div>
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
        {activeDeals.map((deal, i) => (
          <motion.div
            key={deal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.04 }}
            className="glass-card p-5 rounded-xl min-w-[280px] sm:min-w-[300px] snap-start group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <deal.icon size={14} className="text-primary" strokeWidth={1.5} />
                <span className="font-body text-[10px] tracking-[0.2em] uppercase text-gold-soft/50">{deal.category}</span>
              </div>
              <span className="font-body text-[10px] text-muted-foreground">#{deal.id}</span>
            </div>
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-body text-[10px] text-muted-foreground">Phase {deal.phase} of {deal.total}</span>
                <span className="font-body text-[10px] text-primary/70">{deal.progress}%</span>
              </div>
              <div className="h-px bg-border/50 relative overflow-hidden rounded-full">
                <motion.div
                  className="absolute inset-y-0 left-0 bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${deal.progress}%` }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                />
              </div>
            </div>
            <p className="font-body text-xs text-foreground/80 mb-3">{deal.action}</p>
            <Link to="/deals" className="font-body text-[10px] tracking-[0.15em] uppercase text-primary/60 group-hover:text-primary transition-colors flex items-center gap-1">
              Open Deal <ArrowRight size={10} />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Section 2 — Today's Priorities */}
    <section>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="font-body text-[11px] tracking-[0.25em] uppercase text-gold-soft/50 mb-4"
      >
        Today's Priorities
      </motion.p>
      <div className="space-y-2">
        {priorities.map((task, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className={`glass-card p-4 rounded-xl flex items-start gap-3 group hover:border-gold-soft/30 transition-all duration-300 ${
              task.done ? "opacity-50" : ""
            }`}
          >
            <div className={`w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
              task.done ? "border-primary bg-primary/20" : "border-gold-soft/30 group-hover:border-primary/50"
            }`}>
              {task.done && <Check size={8} className="text-primary" strokeWidth={3} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-body text-xs text-foreground leading-relaxed ${task.done ? "line-through" : ""}`}>{task.text}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <Clock size={10} className="text-muted-foreground" />
                <span className="font-body text-[10px] text-muted-foreground">{task.time}</span>
              </div>
            </div>
            {!task.done && (
              <Link to="/deals" className="font-body text-[10px] tracking-wider uppercase text-gold-soft/40 group-hover:text-primary/60 transition-colors shrink-0">
                View
              </Link>
            )}
          </motion.div>
        ))}
      </div>
    </section>

    {/* Section 3 — Intelligence Insights */}
    <section>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="font-body text-[11px] tracking-[0.25em] uppercase text-gold-soft/50 mb-4 flex items-center gap-2"
      >
        <Lightbulb size={12} className="text-primary/50" /> Intelligence Insights
      </motion.p>
      <div className="grid sm:grid-cols-3 gap-4">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="glass-card p-5 rounded-xl hover:border-gold-soft/30 transition-all duration-300 cursor-pointer group"
          >
            <insight.icon size={16} className="text-primary/60 mb-3 group-hover:text-primary transition-colors" strokeWidth={1.5} />
            <p className="font-body text-xs text-foreground/80 leading-relaxed">{insight.text}</p>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Section 4 — Recent Activity */}
    <section>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="font-body text-[11px] tracking-[0.25em] uppercase text-gold-soft/50 mb-4"
      >
        Recent Activity
      </motion.p>
      <div className="glass-card rounded-xl overflow-hidden">
        {recentActivity.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 + i * 0.06 }}
            className="flex items-center gap-3 px-5 py-3.5 border-b border-border/30 last:border-0 hover:bg-secondary/20 transition-colors"
          >
            <item.icon size={14} className="text-gold-soft/40 shrink-0" strokeWidth={1.5} />
            <p className="font-body text-xs text-foreground/80 flex-1">{item.text}</p>
            <span className="font-body text-[10px] text-muted-foreground shrink-0">{item.time}</span>
          </motion.div>
        ))}
      </div>
    </section>
  </div>
);

export default DashboardFeed;
