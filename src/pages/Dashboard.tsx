import { motion } from "framer-motion";
import { TrendingUp, Users, DollarSign, Activity } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const revenueData = [
  { month: "Jul", value: 4200 }, { month: "Aug", value: 5100 }, { month: "Sep", value: 4800 },
  { month: "Oct", value: 6200 }, { month: "Nov", value: 7100 }, { month: "Dec", value: 8400 },
  { month: "Jan", value: 9200 }, { month: "Feb", value: 10800 },
];

const engagementData = [
  { day: "Mon", sessions: 1240 }, { day: "Tue", sessions: 1580 }, { day: "Wed", sessions: 1820 },
  { day: "Thu", sessions: 1650 }, { day: "Fri", sessions: 2100 }, { day: "Sat", sessions: 980 },
  { day: "Sun", sessions: 870 },
];

const metrics = [
  { icon: DollarSign, label: "Monthly Revenue", value: "$1.08M", change: "+24.3%", up: true },
  { icon: Users, label: "Active Users", value: "48,291", change: "+12.7%", up: true },
  { icon: TrendingUp, label: "Conversion Rate", value: "4.82%", change: "+0.6%", up: true },
  { icon: Activity, label: "AI Accuracy", value: "99.2%", change: "+0.1%", up: true },
];

const Dashboard = () => (
  <div className="pt-24 pb-16">
    <div className="container mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <p className="text-primary font-display text-sm tracking-[0.3em] uppercase mb-2">Live Intelligence</p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Analytics Dashboard</h1>
      </motion.div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card rounded-xl p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <m.icon size={18} className="text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">{m.label}</span>
            </div>
            <div className="font-display text-2xl font-bold text-foreground">{m.value}</div>
            <span className="text-xs text-emerald">{m.change}</span>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="font-display text-sm font-semibold text-foreground mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(43, 56%, 52%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(43, 56%, 52%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 16%)" />
              <XAxis dataKey="month" tick={{ fill: "hsl(0, 0%, 55%)", fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: "hsl(0, 0%, 55%)", fontSize: 12 }} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "hsl(0, 0%, 7%)", border: "1px solid hsl(0, 0%, 16%)", borderRadius: "8px", color: "hsl(45, 10%, 90%)" }}
              />
              <Area type="monotone" dataKey="value" stroke="hsl(43, 56%, 52%)" fill="url(#goldGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-xl p-6"
        >
          <h3 className="font-display text-sm font-semibold text-foreground mb-4">User Engagement</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 16%)" />
              <XAxis dataKey="day" tick={{ fill: "hsl(0, 0%, 55%)", fontSize: 12 }} axisLine={false} />
              <YAxis tick={{ fill: "hsl(0, 0%, 55%)", fontSize: 12 }} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "hsl(0, 0%, 7%)", border: "1px solid hsl(0, 0%, 16%)", borderRadius: "8px", color: "hsl(45, 10%, 90%)" }}
              />
              <Bar dataKey="sessions" fill="hsl(210, 100%, 60%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  </div>
);

export default Dashboard;
