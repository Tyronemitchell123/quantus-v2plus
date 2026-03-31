import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BLOG_TOPICS = [
  "How quantum computing is revolutionizing financial risk modeling",
  "The future of drug discovery with quantum-powered molecular simulation",
  "Why enterprises are adopting quantum AI for supply chain optimization",
  "Quantum machine learning vs classical ML: a practical comparison",
  "How QUANTUS V2+ achieves 10^18 operations per second for real-time analytics",
  "Building resilient AI systems with quantum error correction",
  "The role of quantum computing in cybersecurity and post-quantum cryptography",
  "Enterprise AI adoption: lessons from Fortune 500 quantum deployments",
  "Quantum natural language processing: the next frontier in AI",
  "How quantum computing accelerates climate modeling and sustainability",
  "Real-time anomaly detection at scale with quantum-enhanced algorithms",
  "The convergence of quantum computing and generative AI",
];

const SOCIAL_TOPICS = [
  "quantum AI breakthrough",
  "enterprise intelligence trends",
  "quantum computing milestone",
  "AI-powered analytics insight",
  "quantum advantage in finance",
  "machine learning innovation",
  "data-driven decision making",
  "quantum computing for sustainability",
];

async function callAI(prompt: string, systemPrompt: string, tool: any, apiKey: string) {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      tools: [tool],
      tool_choice: { type: "function", function: { name: tool.function.name } },
    }),
  });

  if (!response.ok) {
    const t = await response.text();
    throw new Error(`AI gateway ${response.status}: ${t}`);
  }

  const result = await response.json();
  const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) throw new Error("No structured response from AI");
  return JSON.parse(toolCall.function.arguments);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Only allow service role calls (cron/internal)
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (token !== serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const db = createClient(supabaseUrl, supabaseServiceKey);

    // Find an admin user to attribute content to
    const { data: adminRole } = await db
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin")
      .limit(1)
      .maybeSingle();

    if (!adminRole) {
      console.log("No admin user found, skipping auto-generation");
      return new Response(JSON.stringify({ skipped: true, reason: "no admin user" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = adminRole.user_id;
    const results: string[] = [];

    // --- Generate a blog post ---
    const topic = BLOG_TOPICS[Math.floor(Math.random() * BLOG_TOPICS.length)];

    // Check we haven't already written about this exact topic recently
    const { data: existingPosts } = await db
      .from("marketing_posts")
      .select("title")
      .order("created_at", { ascending: false })
      .limit(20);

    const recentTitles = (existingPosts || []).map((p: any) => p.title.toLowerCase());

    const blogData = await callAI(
      `Write a blog post about: ${topic}. Target keywords: quantum AI, enterprise intelligence, QUANTUS. Avoid these recent titles: ${recentTitles.slice(0, 5).join("; ")}. Make the angle unique and fresh.`,
      "You are a senior SaaS content strategist for QUANTUS V2+, a quantum-powered enterprise intelligence platform. Write SEO-optimized, original blog posts. Use markdown. The tone should be authoritative yet accessible. Each post must have a unique angle.",
      {
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
              content: { type: "string", description: "Full blog post in markdown, 800-1200 words" },
              metaTitle: { type: "string" },
              metaDescription: { type: "string" },
              tags: { type: "array", items: { type: "string" } },
              ogImagePrompt: { type: "string" },
            },
            required: ["title", "slug", "excerpt", "content", "metaTitle", "metaDescription", "tags", "ogImagePrompt"],
          },
        },
      },
      LOVABLE_API_KEY
    );

    // Ensure unique slug with timestamp
    const slug = `${blogData.slug}-${Date.now().toString(36)}`;
    const { error: blogErr } = await db.from("marketing_posts").insert({
      user_id: userId,
      title: blogData.title,
      slug,
      excerpt: blogData.excerpt,
      content: blogData.content,
      meta_title: blogData.metaTitle,
      meta_description: blogData.metaDescription,
      tags: blogData.tags,
      og_image_prompt: blogData.ogImagePrompt,
      status: "published",
      published_at: new Date().toISOString(),
    });

    if (blogErr) console.error("Blog insert error:", blogErr);
    else results.push(`Blog: "${blogData.title}"`);

    // --- Generate social posts ---
    const socialTopic = SOCIAL_TOPICS[Math.floor(Math.random() * SOCIAL_TOPICS.length)];

    const socialData = await callAI(
      `Create 4 social media posts (one per platform: twitter, linkedin, facebook, instagram) about: ${socialTopic}. Reference QUANTUS V2+ naturally. Make each platform-appropriate.`,
      "You are a social media strategist for QUANTUS V2+. Create engaging, platform-optimized posts. Twitter: concise, punchy. LinkedIn: professional, thought-leadership. Facebook: conversational. Instagram: visual-descriptive with emojis.",
      {
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
      },
      LOVABLE_API_KEY
    );

    if (socialData?.posts) {
      const rows = socialData.posts.map((p: any) => ({
        user_id: userId,
        platform: p.platform,
        content: p.content,
        hashtags: p.hashtags,
        tone: p.tone,
        status: "draft",
      }));
      const { error: socialErr } = await db.from("marketing_social").insert(rows);
      if (socialErr) console.error("Social insert error:", socialErr);
      else results.push(`Social: ${socialData.posts.length} posts`);
    }

    console.log("Auto-generation complete:", results.join(", "));

    return new Response(JSON.stringify({ success: true, generated: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("scheduled-content error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
