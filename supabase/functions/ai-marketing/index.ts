import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODES = ["blog", "social", "ad-copy", "seo-audit", "bulk-seo"] as const;
type Mode = (typeof MODES)[number];

function buildPayload(mode: Mode, context: Record<string, unknown>) {
  const base = {
    model: "google/gemini-2.5-flash",
    messages: [] as { role: string; content: string }[],
    tools: [] as any[],
    tool_choice: undefined as any,
  };

  if (mode === "blog") {
    base.messages = [
      { role: "system", content: `You are a senior SaaS content strategist for QUANTUS AI, a quantum-powered enterprise intelligence platform. Write SEO-optimized blog posts that establish thought leadership in quantum computing and AI. Use markdown formatting. Include natural keyword placement. The tone should be authoritative yet accessible.` },
      { role: "user", content: `Write a blog post about: ${context.topic}. Target keywords: ${(context.keywords as string[])?.join(", ") || "quantum AI, enterprise intelligence"}. Target length: ${context.length || "1200"} words.` },
    ];
    base.tools = [{
      type: "function",
      function: {
        name: "create_blog_post",
        description: "Return a complete blog post with metadata",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "SEO-optimized title under 60 chars" },
            slug: { type: "string", description: "URL-friendly slug" },
            excerpt: { type: "string", description: "Meta description under 160 chars" },
            content: { type: "string", description: "Full blog post in markdown" },
            metaTitle: { type: "string", description: "SEO meta title" },
            metaDescription: { type: "string", description: "SEO meta description" },
            tags: { type: "array", items: { type: "string" }, description: "5-8 relevant tags" },
            ogImagePrompt: { type: "string", description: "A prompt to generate an OG image for this post" },
          },
          required: ["title", "slug", "excerpt", "content", "metaTitle", "metaDescription", "tags", "ogImagePrompt"],
        },
      },
    }];
    base.tool_choice = { type: "function", function: { name: "create_blog_post" } };
  }

  if (mode === "social") {
    base.messages = [
      { role: "system", content: `You are a social media strategist for QUANTUS AI. Create engaging, platform-optimized posts that drive engagement and awareness. Adapt tone and format per platform.` },
      { role: "user", content: `Create ${context.count || 3} social media posts for ${context.platform || "all platforms"} about: ${context.topic}. Tone: ${context.tone || "professional yet engaging"}.` },
    ];
    base.tools = [{
      type: "function",
      function: {
        name: "create_social_posts",
        description: "Return social media posts",
        parameters: {
          type: "object",
          properties: {
            posts: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  platform: { type: "string", enum: ["twitter", "linkedin", "facebook", "instagram"] },
                  content: { type: "string" },
                  hashtags: { type: "array", items: { type: "string" } },
                  tone: { type: "string" },
                },
                required: ["platform", "content", "hashtags", "tone"],
              },
            },
          },
          required: ["posts"],
        },
      },
    }];
    base.tool_choice = { type: "function", function: { name: "create_social_posts" } };
  }

  if (mode === "ad-copy") {
    base.messages = [
      { role: "system", content: `You are an expert digital advertising copywriter for QUANTUS AI. Create high-converting ad copy with compelling headlines, benefit-driven body text, and strong CTAs. Follow platform character limits.` },
      { role: "user", content: `Create ad copy for ${context.platform || "google"} targeting: ${context.audience || "enterprise CTOs and data scientists"}. Campaign focus: ${context.topic}. Generate ${context.count || 3} variations.` },
    ];
    base.tools = [{
      type: "function",
      function: {
        name: "create_ad_copy",
        description: "Return ad copy variations",
        parameters: {
          type: "object",
          properties: {
            campaignName: { type: "string" },
            ads: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  headline: { type: "string" },
                  bodyText: { type: "string" },
                  cta: { type: "string" },
                  targetAudience: { type: "string" },
                },
                required: ["headline", "bodyText", "cta", "targetAudience"],
              },
            },
          },
          required: ["campaignName", "ads"],
        },
      },
    }];
    base.tool_choice = { type: "function", function: { name: "create_ad_copy" } };
  }

  if (mode === "seo-audit" || mode === "bulk-seo") {
    const pages = (context.pages as string[]) || ["/", "/services", "/pricing", "/about", "/quantum", "/benefits", "/case-studies"];
    base.messages = [
      { role: "system", content: `You are a senior SEO strategist for QUANTUS AI, a quantum-powered enterprise AI SaaS. Audit pages and generate optimized meta tags, JSON-LD structured data, and keyword strategies. Be specific and actionable.` },
      { role: "user", content: `Audit these pages and generate SEO metadata: ${pages.join(", ")}. The site sells quantum-powered AI analytics for enterprises. Generate optimized meta titles (<60 chars), descriptions (<160 chars), keywords, JSON-LD, and an SEO score (0-100) with improvement suggestions.` },
    ];
    base.tools = [{
      type: "function",
      function: {
        name: "audit_seo",
        description: "Return SEO audit results per page",
        parameters: {
          type: "object",
          properties: {
            pages: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  pagePath: { type: "string" },
                  metaTitle: { type: "string" },
                  metaDescription: { type: "string" },
                  keywords: { type: "array", items: { type: "string" } },
                  jsonLd: { type: "object" },
                  score: { type: "number" },
                  suggestions: { type: "array", items: { type: "string" } },
                },
                required: ["pagePath", "metaTitle", "metaDescription", "keywords", "jsonLd", "score", "suggestions"],
              },
            },
          },
          required: ["pages"],
        },
      },
    }];
    base.tool_choice = { type: "function", function: { name: "audit_seo" } };
  }

  return base;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify user
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { mode, ...context } = await req.json();

    if (!MODES.includes(mode)) {
      return new Response(JSON.stringify({ error: `Invalid mode. Use: ${MODES.join(", ")}` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const payload = buildPayload(mode as Mode, context);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No structured response" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = JSON.parse(toolCall.function.arguments);

    // Auto-save to database
    if (mode === "blog" && data.title) {
      await adminClient.from("marketing_posts").upsert({
        user_id: user.id,
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        meta_title: data.metaTitle,
        meta_description: data.metaDescription,
        tags: data.tags,
        og_image_prompt: data.ogImagePrompt,
      }, { onConflict: "slug" });
    }

    if (mode === "social" && data.posts) {
      const rows = data.posts.map((p: any) => ({
        user_id: user.id,
        platform: p.platform,
        content: p.content,
        hashtags: p.hashtags,
        tone: p.tone,
      }));
      await adminClient.from("marketing_social").insert(rows);
    }

    if (mode === "ad-copy" && data.ads) {
      const rows = data.ads.map((a: any) => ({
        user_id: user.id,
        campaign_name: data.campaignName,
        headline: a.headline,
        body_text: a.bodyText,
        cta: a.cta,
        target_audience: a.targetAudience,
        platform: context.platform || "google",
      }));
      await adminClient.from("marketing_ads").insert(rows);
    }

    if ((mode === "seo-audit" || mode === "bulk-seo") && data.pages) {
      for (const p of data.pages) {
        await adminClient.from("marketing_seo").upsert({
          user_id: user.id,
          page_path: p.pagePath,
          meta_title: p.metaTitle,
          meta_description: p.metaDescription,
          json_ld: p.jsonLd,
          keywords: p.keywords,
          score: p.score,
          suggestions: p.suggestions,
        }, { onConflict: "page_path" });
      }
    }

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-marketing error:", e);
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
