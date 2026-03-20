import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest } from "../_shared/api-key-auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODES = ["summarize", "sentiment", "generate", "extract-entities"] as const;
type Mode = (typeof MODES)[number];

function buildPayload(mode: Mode, text: string, generationPrompt?: string) {
  const base = {
    model: "google/gemini-3-flash-preview",
    messages: [] as { role: string; content: string }[],
    tools: [] as any[],
    tool_choice: undefined as any,
  };

  if (mode === "summarize") {
    base.messages = [
      { role: "system", content: "You are an expert summariser. Produce a concise, accurate summary of the user's text. Include key points as bullet items." },
      { role: "user", content: text },
    ];
    base.tools = [{
      type: "function",
      function: {
        name: "summarize",
        description: "Return a structured summary",
        parameters: {
          type: "object",
          properties: {
            summary: { type: "string", description: "A concise paragraph summary" },
            keyPoints: { type: "array", items: { type: "string" }, description: "3-7 key takeaways" },
            wordCount: { type: "number", description: "Word count of original text" },
            readingTime: { type: "string", description: "Estimated reading time e.g. '2 min'" },
          },
          required: ["summary", "keyPoints", "wordCount", "readingTime"],
        },
      },
    }];
    base.tool_choice = { type: "function", function: { name: "summarize" } };
  }

  if (mode === "sentiment") {
    base.messages = [
      { role: "system", content: "You are an expert sentiment and emotion analyst. Analyse the user's text for overall sentiment, emotion breakdown, and key phrases that drive the sentiment." },
      { role: "user", content: text },
    ];
    base.tools = [{
      type: "function",
      function: {
        name: "analyze_sentiment",
        description: "Return structured sentiment analysis",
        parameters: {
          type: "object",
          properties: {
            overallSentiment: { type: "string", enum: ["very_positive", "positive", "neutral", "negative", "very_negative"] },
            confidenceScore: { type: "number", description: "0-100 confidence" },
            emotions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  emotion: { type: "string" },
                  intensity: { type: "number", description: "0-100" },
                },
                required: ["emotion", "intensity"],
              },
            },
            keyPhrases: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  phrase: { type: "string" },
                  sentiment: { type: "string", enum: ["positive", "neutral", "negative"] },
                },
                required: ["phrase", "sentiment"],
              },
            },
            summary: { type: "string" },
          },
          required: ["overallSentiment", "confidenceScore", "emotions", "keyPhrases", "summary"],
        },
      },
    }];
    base.tool_choice = { type: "function", function: { name: "analyze_sentiment" } };
  }

  if (mode === "generate") {
    base.messages = [
      { role: "system", content: "You are a versatile content writer. Generate polished, professional content based on the user's prompt. Return the content along with metadata." },
      { role: "user", content: generationPrompt || text },
    ];
    base.tools = [{
      type: "function",
      function: {
        name: "generate_text",
        description: "Return generated content with metadata",
        parameters: {
          type: "object",
          properties: {
            content: { type: "string", description: "The generated text content (use markdown formatting)" },
            title: { type: "string", description: "A suggested title" },
            tone: { type: "string", description: "Detected tone (e.g. professional, casual)" },
            wordCount: { type: "number" },
          },
          required: ["content", "title", "tone", "wordCount"],
        },
      },
    }];
    base.tool_choice = { type: "function", function: { name: "generate_text" } };
  }

  if (mode === "extract-entities") {
    base.messages = [
      { role: "system", content: "You are an expert NER (Named Entity Recognition) engine. Extract all named entities from the user's text with their types and context." },
      { role: "user", content: text },
    ];
    base.tools = [{
      type: "function",
      function: {
        name: "extract_entities",
        description: "Return extracted entities",
        parameters: {
          type: "object",
          properties: {
            entities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  type: { type: "string", enum: ["person", "organization", "location", "date", "money", "product", "event", "technology", "other"] },
                  context: { type: "string", description: "Brief context sentence" },
                },
                required: ["text", "type", "context"],
              },
            },
            summary: { type: "string", description: "Brief overview of entities found" },
            totalEntities: { type: "number" },
          },
          required: ["entities", "summary", "totalEntities"],
        },
      },
    }];
    base.tool_choice = { type: "function", function: { name: "extract_entities" } };
  }

  return base;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { mode, text, prompt: generationPrompt } = await req.json();

    if (!MODES.includes(mode)) {
      return new Response(JSON.stringify({ error: `Invalid mode. Use: ${MODES.join(", ")}` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!text && mode !== "generate") {
      return new Response(JSON.stringify({ error: "text is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (mode === "generate" && !generationPrompt && !text) {
      return new Response(JSON.stringify({ error: "prompt or text is required for generation" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const payload = buildPayload(mode as Mode, text, generationPrompt);

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
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait and try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
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
      return new Response(JSON.stringify({ error: "No structured response from AI" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("nlp-tools error:", e);
    return new Response(
      JSON.stringify({ error: "Something went wrong while processing your request. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
