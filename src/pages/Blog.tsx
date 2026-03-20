import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, Tag, ArrowLeft, ArrowRight, Search } from "lucide-react";
import useDocumentHead from "@/hooks/use-document-head";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  meta_title: string | null;
  meta_description: string | null;
  tags: string[] | null;
  published_at: string | null;
  created_at: string;
};

/* -------- JSON-LD helpers -------- */
const blogListingJsonLd = (posts: Post[]) => ({
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "QUANTUS AI Blog",
  description: "Insights on quantum computing, enterprise AI, and intelligent analytics from QUANTUS AI.",
  url: "https://quantus-loom.lovable.app/blog",
  publisher: {
    "@type": "Organization",
    name: "QUANTUS AI",
    url: "https://quantus-loom.lovable.app",
  },
  blogPost: posts.slice(0, 10).map((p) => ({
    "@type": "BlogPosting",
    headline: p.title,
    description: p.excerpt || "",
    url: `https://quantus-loom.lovable.app/blog/${p.slug}`,
    datePublished: p.published_at || p.created_at,
    author: { "@type": "Organization", name: "QUANTUS AI" },
  })),
});

const blogPostJsonLd = (post: Post) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: post.title,
  description: post.excerpt || post.meta_description || "",
  url: `https://quantus-loom.lovable.app/blog/${post.slug}`,
  datePublished: post.published_at || post.created_at,
  dateModified: post.created_at,
  author: { "@type": "Organization", name: "QUANTUS AI" },
  publisher: {
    "@type": "Organization",
    name: "QUANTUS AI",
    url: "https://quantus-loom.lovable.app",
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `https://quantus-loom.lovable.app/blog/${post.slug}`,
  },
});

/* -------- Inject JSON-LD into head -------- */
function useJsonLd(data: object | null, id: string) {
  useEffect(() => {
    if (!data) return;
    let script = document.getElementById(id) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = id;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
    return () => {
      script?.remove();
    };
  }, [data, id]);
}

/* ======== Blog Listing ======== */
const BlogListing = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useDocumentHead({
    title: "Blog — QUANTUS AI",
    description: "Explore insights on quantum computing, enterprise AI, and data-driven intelligence from the QUANTUS AI team.",
    canonical: "https://quantus-loom.lovable.app/blog",
  });

  useJsonLd(posts.length > 0 ? blogListingJsonLd(posts) : null, "blog-listing-jsonld");

  useEffect(() => {
    supabase
      .from("marketing_posts")
      .select("id, title, slug, excerpt, content, meta_title, meta_description, tags, published_at, created_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .then(({ data }) => {
        setPosts((data as Post[]) || []);
        setLoading(false);
      });
  }, []);

  const allTags = [...new Set(posts.flatMap((p) => p.tags || []))].sort();

  const filtered = posts.filter((p) => {
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.excerpt || "").toLowerCase().includes(search.toLowerCase());
    const matchesTag = !selectedTag || (p.tags || []).includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const readingTime = (content: string) => {
    const words = content.split(/\s+/).length;
    return `${Math.max(1, Math.ceil(words / 230))} min read`;
  };

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <p className="text-primary font-display text-sm tracking-[0.3em] uppercase mb-2">Insights &amp; Research</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground leading-tight">
            The QUANTUS Blog
          </h1>
          <p className="text-muted-foreground mt-3 max-w-xl text-lg">
            Quantum computing, enterprise AI, and the future of intelligent analytics.
          </p>
        </motion.div>

        {/* Search & tags */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8 space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Search articles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={selectedTag === null ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => setSelectedTag(null)}
              >
                All
              </Badge>
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTag === tag ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </motion.div>

        {/* Posts */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-xl bg-muted/30 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              {posts.length === 0 ? "No published articles yet. Check back soon!" : "No articles match your search."}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {filtered.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
              >
                <Link to={`/blog/${post.slug}`}>
                  <Card className="border-border/40 bg-card/50 hover:bg-card/80 hover:border-primary/30 transition-all duration-300 group">
                    <CardContent className="py-6 px-6">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(post.published_at || post.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {readingTime(post.content)}
                        </span>
                      </div>
                      <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{post.excerpt}</p>
                      )}
                      {(post.tags || []).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {post.tags!.slice(0, 5).map((t) => (
                            <Badge key={t} variant="secondary" className="text-xs">
                              <Tag size={10} className="mr-1" />
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs text-primary mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        Read article <ArrowRight size={12} />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ======== Single Post ======== */
const BlogPost = ({ slug }: { slug: string }) => {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("marketing_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle()
      .then(({ data }) => {
        setPost(data as Post | null);
        setLoading(false);
      });
  }, [slug]);

  useDocumentHead({
    title: post ? `${post.meta_title || post.title} — QUANTUS AI` : "Blog — QUANTUS AI",
    description: post?.meta_description || post?.excerpt || "Read this article on the QUANTUS AI blog.",
    canonical: post ? `https://quantus-loom.lovable.app/blog/${post.slug}` : undefined,
  });

  useJsonLd(post ? blogPostJsonLd(post) : null, "blog-post-jsonld");

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const readingTime = (content: string) => {
    const words = content.split(/\s+/).length;
    return `${Math.max(1, Math.ceil(words / 230))} min read`;
  };

  if (loading) {
    return (
      <div className="pt-24 pb-16 min-h-screen">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="h-8 w-48 bg-muted/30 animate-pulse rounded mb-4" />
          <div className="h-12 w-full bg-muted/30 animate-pulse rounded mb-6" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 w-full bg-muted/20 animate-pulse rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Article not found</h1>
          <p className="text-muted-foreground mb-6">This post may have been removed or isn't published yet.</p>
          <Link to="/blog" className="text-primary hover:underline inline-flex items-center gap-1">
            <ArrowLeft size={14} /> Back to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="container mx-auto px-6 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 mb-8">
            <ArrowLeft size={14} /> All articles
          </Link>

          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(post.published_at || post.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {readingTime(post.content)}
            </span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground leading-tight mb-4">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">{post.excerpt}</p>
          )}

          {(post.tags || []).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags!.map((t) => (
                <Badge key={t} variant="secondary">
                  <Tag size={10} className="mr-1" />
                  {t}
                </Badge>
              ))}
            </div>
          )}

          <hr className="border-border/40 mb-8" />

          <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-foreground/80 prose-a:text-primary prose-strong:text-foreground">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </article>

          <hr className="border-border/40 mt-12 mb-8" />

          <div className="flex items-center justify-between">
            <Link to="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
              <ArrowLeft size={14} /> All articles
            </Link>
            <Link to="/contact" className="text-sm text-primary hover:underline">
              Have questions? Get in touch →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

/* ======== Router wrapper ======== */
const Blog = () => {
  const { slug } = useParams<{ slug: string }>();
  return slug ? <BlogPost slug={slug} /> : <BlogListing />;
};

export default Blog;
