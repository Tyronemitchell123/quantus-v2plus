import { useState, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Share2, Megaphone, Search, Sparkles, RefreshCw,
  Copy, Check, Loader2, Globe, Twitter, Linkedin, Facebook, Instagram,
  TrendingUp, BarChart3, ArrowRight, Eye, Pencil, Trash2
} from "lucide-react";
const AnalyticsTab = lazy(() => import("@/components/marketing/AnalyticsTab"));
import useDocumentHead from "@/hooks/use-document-head";
import { useMarketing } from "@/hooks/use-marketing";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const tabs = [
  { key: "blog", label: "Blog Posts", icon: FileText },
  { key: "social", label: "Social Media", icon: Share2 },
  { key: "ads", label: "Ad Copy", icon: Megaphone },
  { key: "seo", label: "SEO Audit", icon: Search },
];

const platformIcons: Record<string, React.ElementType> = {
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
  google: Globe,
};

/* ---------- Blog Tab ---------- */
const BlogTab = ({ generate, loading }: { generate: any; loading: boolean }) => {
  const [topic, setTopic] = useState("");
  const [keywords, setKeywords] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase
      .from("marketing_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => data && setPosts(data));
  }, [result]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    const data = await generate("blog", {
      topic: topic.trim(),
      keywords: keywords.split(",").map((k: string) => k.trim()).filter(Boolean),
    });
    if (data) setResult(data);
  };

  const copyContent = () => {
    if (result?.content) {
      navigator.clipboard.writeText(result.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="text-primary" size={18} />
            Generate Blog Post
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Blog topic (e.g. 'How quantum computing transforms financial risk analysis')"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <Input
            placeholder="Target keywords, comma-separated (optional)"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
          <Button onClick={handleGenerate} disabled={loading || !topic.trim()}>
            {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Sparkles className="mr-2" size={16} />}
            Generate Post
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="border-primary/30 bg-card/50">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{result.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{result.excerpt}</p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {result.tags?.map((t: string) => (
                      <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                </div>
                <Button size="icon" variant="ghost" onClick={copyContent}>
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </Button>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm text-foreground/80 max-h-96 overflow-y-auto font-sans leading-relaxed">
                  {result.content}
                </pre>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {posts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Recent Posts</h3>
          {posts.map((p) => (
            <Card key={p.id} className="border-border/40 bg-card/30">
              <CardContent className="py-3 px-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.slug} · {new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <Badge variant={p.status === "published" ? "default" : "secondary"}>{p.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------- Social Tab ---------- */
const SocialTab = ({ generate, loading }: { generate: any; loading: boolean }) => {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("all");
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    supabase
      .from("marketing_social")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(12)
      .then(({ data }) => data && setHistory(data));
  }, [result]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    const data = await generate("social", {
      topic: topic.trim(),
      platform: platform === "all" ? undefined : platform,
      count: 4,
    });
    if (data) setResult(data);
  };

  const copyPost = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Share2 className="text-primary" size={18} />
            Generate Social Posts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Post topic or campaign theme"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="twitter">Twitter / X</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleGenerate} disabled={loading || !topic.trim()}>
            {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Sparkles className="mr-2" size={16} />}
            Generate Posts
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence>
        {result?.posts && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 sm:grid-cols-2">
            {result.posts.map((p: any, i: number) => {
              const Icon = platformIcons[p.platform] || Globe;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <Card className="border-border/40 bg-card/50 h-full">
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Icon size={14} className="text-primary" />
                        <Badge variant="outline" className="text-xs capitalize">{p.platform}</Badge>
                        <Badge variant="secondary" className="text-xs ml-auto">{p.tone}</Badge>
                      </div>
                      <p className="text-sm leading-relaxed">{p.content}</p>
                      <div className="flex flex-wrap gap-1">
                        {p.hashtags?.map((h: string) => (
                          <span key={h} className="text-xs text-primary">#{h}</span>
                        ))}
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => copyPost(p.content + "\n\n" + p.hashtags.map((h: string) => `#${h}`).join(" "))}>
                        <Copy size={14} className="mr-1" /> Copy
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {history.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">History</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {history.map((h) => {
              const Icon = platformIcons[h.platform] || Globe;
              return (
                <Card key={h.id} className="border-border/30 bg-card/20">
                  <CardContent className="py-2.5 px-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon size={12} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground capitalize">{h.platform}</span>
                    </div>
                    <p className="text-xs line-clamp-2">{h.content}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------- Ads Tab ---------- */
const AdsTab = ({ generate, loading }: { generate: any; loading: boolean }) => {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("google");
  const [audience, setAudience] = useState("");
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    supabase
      .from("marketing_ads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => data && setHistory(data));
  }, [result]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    const data = await generate("ad-copy", {
      topic: topic.trim(),
      platform,
      audience: audience.trim() || undefined,
      count: 3,
    });
    if (data) setResult(data);
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Megaphone className="text-primary" size={18} />
            Generate Ad Copy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Campaign focus (e.g. 'Quantum risk analysis for hedge funds')" value={topic} onChange={(e) => setTopic(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="google">Google Ads</SelectItem>
                <SelectItem value="facebook">Facebook Ads</SelectItem>
                <SelectItem value="linkedin">LinkedIn Ads</SelectItem>
                <SelectItem value="twitter">Twitter Ads</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Target audience (optional)" value={audience} onChange={(e) => setAudience(e.target.value)} />
          </div>
          <Button onClick={handleGenerate} disabled={loading || !topic.trim()}>
            {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Sparkles className="mr-2" size={16} />}
            Generate Ads
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence>
        {result?.ads && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <p className="text-sm font-medium">Campaign: {result.campaignName}</p>
            <div className="grid gap-4 sm:grid-cols-3">
              {result.ads.map((ad: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className="border-primary/20 bg-card/50 h-full">
                    <CardContent className="pt-4 space-y-2">
                      <p className="font-semibold text-sm">{ad.headline}</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">{ad.bodyText}</p>
                      <div className="flex items-center justify-between pt-2">
                        <Badge variant="outline" className="text-xs">{ad.cta}</Badge>
                        <span className="text-xs text-muted-foreground">{ad.targetAudience}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {history.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Previous Campaigns</h3>
          {history.map((a) => (
            <Card key={a.id} className="border-border/30 bg-card/20">
              <CardContent className="py-2.5 px-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{a.headline}</p>
                  <p className="text-xs text-muted-foreground">{a.campaign_name} · {a.platform}</p>
                </div>
                <Badge variant="secondary" className="text-xs">{a.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------- SEO Tab ---------- */
const SEOTab = ({ generate, loading }: { generate: any; loading: boolean }) => {
  const [result, setResult] = useState<any>(null);
  const [savedSeo, setSavedSeo] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("marketing_seo")
      .select("*")
      .order("updated_at", { ascending: false })
      .then(({ data }) => data && setSavedSeo(data));
  }, [result]);

  const handleAudit = async () => {
    const data = await generate("seo-audit", {
      pages: ["/", "/services", "/pricing", "/about", "/quantum", "/benefits", "/case-studies", "/contact"],
    });
    if (data) setResult(data);
  };

  const scoreColor = (s: number) =>
    s >= 80 ? "text-green-500" : s >= 60 ? "text-yellow-500" : "text-red-500";

  const displayPages = result?.pages || savedSeo.map((s: any) => ({
    pagePath: s.page_path,
    metaTitle: s.meta_title,
    metaDescription: s.meta_description,
    keywords: s.keywords,
    score: s.score,
    suggestions: s.suggestions,
  }));

  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="text-primary" size={18} />
            SEO Audit &amp; Auto-Optimize
          </CardTitle>
          <Button onClick={handleAudit} disabled={loading}>
            {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : <RefreshCw className="mr-2" size={16} />}
            Run Full Audit
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            AI audits all public pages, generates optimized meta tags, JSON-LD, and keyword strategies — then saves them automatically.
          </p>
        </CardContent>
      </Card>

      {displayPages.length > 0 && (
        <div className="space-y-4">
          {displayPages.map((p: any, i: number) => (
            <motion.div
              key={p.pagePath}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <Card className="border-border/40 bg-card/40">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-muted-foreground" />
                      <span className="font-mono text-sm">{p.pagePath}</span>
                    </div>
                    <span className={`text-lg font-bold ${scoreColor(p.score)}`}>
                      {p.score}/100
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{p.metaTitle}</p>
                    <p className="text-xs text-muted-foreground">{p.metaDescription}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {p.keywords?.map((k: string) => (
                      <Badge key={k} variant="secondary" className="text-xs">{k}</Badge>
                    ))}
                  </div>
                  {p.suggestions?.length > 0 && (
                    <ul className="space-y-1">
                      {p.suggestions.map((s: string, j: number) => (
                        <li key={j} className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <ArrowRight size={10} className="mt-0.5 shrink-0 text-primary" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------- Main Page ---------- */
const MarketingHub = () => {
  const [activeTab, setActiveTab] = useState("blog");
  const { generate, loading } = useMarketing();

  useDocumentHead({
    title: "Marketing Hub — QUANTUS AI",
    description: "AI-powered marketing automation: blog posts, social media, ad copy, and SEO optimization.",
  });

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="container mx-auto px-6 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-primary" size={24} />
            <p className="text-primary font-display text-sm tracking-[0.3em] uppercase">Admin Only</p>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Marketing Hub</h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            AI generates blog posts, social media content, ad copy, and SEO metadata — all automatically saved and ready to deploy.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 overflow-x-auto pb-2 scrollbar-thin">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {activeTab === "blog" && <BlogTab generate={generate} loading={loading} />}
          {activeTab === "social" && <SocialTab generate={generate} loading={loading} />}
          {activeTab === "ads" && <AdsTab generate={generate} loading={loading} />}
          {activeTab === "seo" && <SEOTab generate={generate} loading={loading} />}
        </motion.div>
      </div>
    </div>
  );
};

export default MarketingHub;
