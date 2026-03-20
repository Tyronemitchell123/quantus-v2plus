import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, FileText, Share2, Megaphone, Search, TrendingUp,
  Calendar, Eye, Globe, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";

interface ContentStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalSocial: number;
  totalAds: number;
  avgSeoScore: number;
  platformBreakdown: { name: string; value: number }[];
  weeklyOutput: { week: string; posts: number; social: number; ads: number }[];
  topTags: { tag: string; count: number }[];
  seoScores: { page: string; score: number }[];
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2, 220 70% 50%))",
  "hsl(var(--chart-3, 280 65% 60%))",
  "hsl(var(--chart-4, 340 75% 55%))",
  "hsl(var(--chart-5, 30 80% 55%))",
];

const statCards = (stats: ContentStats) => [
  { label: "Blog Posts", value: stats.totalPosts, sub: `${stats.publishedPosts} published`, icon: FileText, color: "text-primary" },
  { label: "Social Posts", value: stats.totalSocial, sub: "across platforms", icon: Share2, color: "text-emerald-500" },
  { label: "Ad Campaigns", value: stats.totalAds, sub: "generated", icon: Megaphone, color: "text-amber-500" },
  { label: "Avg SEO Score", value: stats.avgSeoScore, sub: "/100", icon: Search, color: "text-sky-500" },
];

export default function AnalyticsTab() {
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [postsRes, socialRes, adsRes, seoRes] = await Promise.all([
        supabase.from("marketing_posts").select("status, tags, created_at"),
        supabase.from("marketing_social").select("platform, created_at"),
        supabase.from("marketing_ads").select("platform, campaign_name, created_at"),
        supabase.from("marketing_seo").select("page_path, score"),
      ]);

      const posts = postsRes.data || [];
      const social = socialRes.data || [];
      const ads = adsRes.data || [];
      const seo = seoRes.data || [];

      // Platform breakdown from social
      const platformMap: Record<string, number> = {};
      social.forEach((s) => {
        platformMap[s.platform] = (platformMap[s.platform] || 0) + 1;
      });
      const platformBreakdown = Object.entries(platformMap).map(([name, value]) => ({ name, value }));

      // Top tags from posts
      const tagMap: Record<string, number> = {};
      posts.forEach((p) => {
        (p.tags || []).forEach((t: string) => {
          tagMap[t] = (tagMap[t] || 0) + 1;
        });
      });
      const topTags = Object.entries(tagMap)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      // Weekly output (last 8 weeks)
      const weeklyOutput = buildWeeklyOutput(posts, social, ads);

      // SEO scores
      const seoScores = seo
        .filter((s) => s.score != null)
        .map((s) => ({ page: s.page_path, score: s.score! }))
        .sort((a, b) => b.score - a.score);

      const avgSeoScore = seoScores.length
        ? Math.round(seoScores.reduce((sum, s) => sum + s.score, 0) / seoScores.length)
        : 0;

      setStats({
        totalPosts: posts.length,
        publishedPosts: posts.filter((p) => p.status === "published").length,
        draftPosts: posts.filter((p) => p.status === "draft").length,
        totalSocial: social.length,
        totalAds: ads.length,
        avgSeoScore,
        platformBreakdown,
        weeklyOutput,
        topTags,
        seoScores,
      });
    } catch {
      // Silently fail, show empty state
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

  if (!stats) return null;

  const cards = statCards(stats);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <c.icon size={18} className={c.color} />
                  <span className="text-2xl font-bold tabular-nums">{c.value}</span>
                </div>
                <p className="text-sm font-medium">{c.label}</p>
                <p className="text-xs text-muted-foreground">{c.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Weekly output chart */}
      {stats.weeklyOutput.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar size={18} className="text-primary" />
                Weekly Content Output
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={stats.weeklyOutput}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Area type="monotone" dataKey="posts" stackId="1" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.3} name="Blog" />
                  <Area type="monotone" dataKey="social" stackId="1" stroke={CHART_COLORS[1]} fill={CHART_COLORS[1]} fillOpacity={0.3} name="Social" />
                  <Area type="monotone" dataKey="ads" stackId="1" stroke={CHART_COLORS[3]} fill={CHART_COLORS[3]} fillOpacity={0.3} name="Ads" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Platform breakdown */}
        {stats.platformBreakdown.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe size={18} className="text-primary" />
                  Platform Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={stats.platformBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {stats.platformBreakdown.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {stats.platformBreakdown.map((p, i) => (
                    <div key={p.name} className="flex items-center gap-1.5 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="capitalize text-muted-foreground">{p.name}</span>
                      <span className="font-medium">{p.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* SEO scores */}
        {stats.seoScores.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp size={18} className="text-primary" />
                  SEO Scores by Page
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={stats.seoScores} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis type="category" dataKey="page" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={80} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="score" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Top tags */}
      {stats.topTags.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye size={18} className="text-primary" />
                Popular Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {stats.topTags.map((t) => (
                  <Badge key={t.tag} variant="secondary" className="text-sm px-3 py-1">
                    {t.tag}
                    <span className="ml-1.5 text-muted-foreground font-normal">×{t.count}</span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Empty state */}
      {stats.totalPosts === 0 && stats.totalSocial === 0 && stats.totalAds === 0 && (
        <Card className="border-dashed border-border/60 bg-card/30">
          <CardContent className="py-12 text-center">
            <BarChart3 size={32} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No content generated yet. Use the other tabs to create blog posts, social content, and ads.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* --- helper: bucket items into weekly bins --- */
function buildWeeklyOutput(
  posts: { created_at: string }[],
  social: { created_at: string }[],
  ads: { created_at: string }[]
) {
  const now = new Date();
  const weeks: { week: string; start: Date; end: Date; posts: number; social: number; ads: number }[] = [];

  for (let i = 7; i >= 0; i--) {
    const start = new Date(now);
    start.setDate(now.getDate() - i * 7);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    const label = `${start.getDate()}/${start.getMonth() + 1}`;
    weeks.push({ week: label, start, end, posts: 0, social: 0, ads: 0 });
  }

  const bucket = (items: { created_at: string }[], key: "posts" | "social" | "ads") => {
    items.forEach((item) => {
      const d = new Date(item.created_at);
      const w = weeks.find((wk) => d >= wk.start && d < wk.end);
      if (w) w[key]++;
    });
  };

  bucket(posts, "posts");
  bucket(social, "social");
  bucket(ads, "ads");

  return weeks.map(({ week, posts, social, ads }) => ({ week, posts, social, ads }));
}
