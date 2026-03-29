import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, UserPlus, CreditCard, TrendingUp, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";

interface FunnelData {
  totalContacts: number;
  totalSignups: number;
  totalSubscribers: number;
  activeSubscribers: number;
  trialUsers: number;
  paidUsers: number;
  conversionRates: { contactToSignup: number; signupToSubscriber: number; trialToPaid: number };
  weeklySignups: { week: string; signups: number; subscribers: number }[];
  tierBreakdown: { tier: string; count: number }[];
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2, 220 70% 50%))",
  "hsl(var(--chart-3, 280 65% 60%))",
  "hsl(var(--chart-4, 340 75% 55%))",
];

export default function ConversionFunnel() {
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFunnelData();
  }, []);

  const fetchFunnelData = async () => {
    try {
      const [contactsRes, profilesRes, subsRes] = await Promise.all([
        supabase.from("contact_submissions").select("id, created_at"),
        supabase.from("profiles").select("id, created_at, user_id"),
        supabase.from("subscriptions").select("id, tier, status, created_at, user_id"),
      ]);

      const contacts = contactsRes.data || [];
      const profiles = profilesRes.data || [];
      const subs = subsRes.data || [];

      const activeSubscribers = subs.filter(s => s.status === "active" && s.tier !== "free");
      const trialUsers = subs.filter(s => s.status === "trialing");
      const paidUsers = subs.filter(s => s.status === "active" && s.tier !== "free");

      const contactToSignup = contacts.length > 0 ? (profiles.length / contacts.length) * 100 : 0;
      const signupToSubscriber = profiles.length > 0 ? (activeSubscribers.length / profiles.length) * 100 : 0;
      const trialToPaid = trialUsers.length > 0 ? (paidUsers.length / trialUsers.length) * 100 : 0;

      // Weekly signups (last 8 weeks)
      const now = new Date();
      const weeklySignups = [];
      for (let i = 7; i >= 0; i--) {
        const start = new Date(now);
        start.setDate(now.getDate() - i * 7);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 7);
        const label = `${start.getDate()}/${start.getMonth() + 1}`;
        const signups = profiles.filter(p => {
          const d = new Date(p.created_at);
          return d >= start && d < end;
        }).length;
        const subscribers = subs.filter(s => {
          const d = new Date(s.created_at);
          return d >= start && d < end && s.tier !== "free";
        }).length;
        weeklySignups.push({ week: label, signups, subscribers });
      }

      // Tier breakdown
      const tierMap: Record<string, number> = {};
      subs.forEach(s => {
        tierMap[s.tier] = (tierMap[s.tier] || 0) + 1;
      });
      const tierBreakdown = Object.entries(tierMap).map(([tier, count]) => ({ tier, count }));

      setData({
        totalContacts: contacts.length,
        totalSignups: profiles.length,
        totalSubscribers: activeSubscribers.length,
        activeSubscribers: activeSubscribers.length,
        trialUsers: trialUsers.length,
        paidUsers: paidUsers.length,
        conversionRates: {
          contactToSignup: Math.round(contactToSignup),
          signupToSubscriber: Math.round(signupToSubscriber),
          trialToPaid: Math.round(trialToPaid),
        },
        weeklySignups,
        tierBreakdown,
      });
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  if (!data) return null;

  const funnelSteps = [
    { label: "Visitors / Leads", value: data.totalContacts, icon: Users, color: "text-sky-500" },
    { label: "Signups", value: data.totalSignups, icon: UserPlus, color: "text-emerald-500" },
    { label: "Paid Subscribers", value: data.totalSubscribers, icon: CreditCard, color: "text-primary" },
  ];

  return (
    <div className="space-y-6">
      {/* Funnel visualization */}
      <div className="grid gap-4 sm:grid-cols-3">
        {funnelSteps.map((step, i) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="relative"
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-5 pb-4 text-center">
                <step.icon size={20} className={`${step.color} mx-auto mb-2`} />
                <span className="text-3xl font-bold tabular-nums block">{step.value}</span>
                <p className="text-sm text-muted-foreground mt-1">{step.label}</p>
              </CardContent>
            </Card>
            {i < funnelSteps.length - 1 && (
              <div className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10">
                <div className="flex items-center gap-1 bg-muted/50 rounded-full px-2 py-1">
                  <ArrowRight size={12} className="text-muted-foreground" />
                  <span className="text-xs font-medium text-primary">
                    {i === 0 ? data.conversionRates.contactToSignup : data.conversionRates.signupToSubscriber}%
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Conversion rates */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" />
              Conversion Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: "Lead → Signup", value: data.conversionRates.contactToSignup },
                { label: "Signup → Paid", value: data.conversionRates.signupToSubscriber },
                { label: "Trial → Paid", value: data.conversionRates.trialToPaid },
              ].map(rate => (
                <div key={rate.label} className="text-center p-4 rounded-lg bg-muted/30">
                  <span className="text-2xl font-bold text-primary">{rate.value}%</span>
                  <p className="text-xs text-muted-foreground mt-1">{rate.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Weekly signups chart */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full">
            <CardHeader>
              <CardTitle className="text-lg">Weekly Signups vs Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={data.weeklySignups}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="signups" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.2} name="Signups" />
                  <Area type="monotone" dataKey="subscribers" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.2} name="Subscribers" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tier breakdown */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full">
            <CardHeader>
              <CardTitle className="text-lg">Subscription Tiers</CardTitle>
            </CardHeader>
            <CardContent>
              {data.tierBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.tierBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="tier" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {data.tierBreakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">
                  No subscription data yet
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
