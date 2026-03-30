import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { rateLimit } from "../_shared/rate-limit.ts";
import { authenticateRequest } from "../_shared/api-key-auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
// Device pricing (approximate per-task + per-shot)
const DEVICES = [
  { arn: "arn:aws:braket:::device/quantum-simulator/amazon/sv1", name: "SV1 (Simulator)", perTask: 0, perShot: 0.00075, maxQubits: 34, type: "simulator" },
  { arn: "arn:aws:braket:::device/quantum-simulator/amazon/dm1", name: "DM1 (Density Matrix)", perTask: 0, perShot: 0.00075, maxQubits: 17, type: "simulator" },
  { arn: "arn:aws:braket:::device/quantum-simulator/amazon/tn1", name: "TN1 (Tensor Network)", perTask: 0, perShot: 0.00075, maxQubits: 50, type: "simulator" },
  { arn: "arn:aws:braket:::device/qpu/ionq/Aria-1", name: "IonQ Aria-1", perTask: 0.30, perShot: 0.03, maxQubits: 25, type: "qpu" },
  { arn: "arn:aws:braket:::device/qpu/iqm/Garnet", name: "IQM Garnet", perTask: 0.60, perShot: 0.00145, maxQubits: 20, type: "qpu" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rateLimited = rateLimit(req, corsHeaders);
    if (rateLimited) return rateLimited;

    const authResult = await authenticateRequest(req, corsHeaders);
    if (authResult instanceof Response) return authResult;

    const { qubits, shots, prioritize } = await req.json();
    const numQubits = qubits || 2;
    const numShots = shots || 100;
    const priority = prioritize || "cost"; // "cost" | "speed" | "accuracy"

    const eligible = DEVICES.filter(d => d.maxQubits >= numQubits);
    const recommendations = eligible.map(d => {
      const cost = d.perTask + d.perShot * numShots;
      const speedScore = d.type === "simulator" ? 95 : 40;
      const accuracyScore = d.type === "qpu" ? 92 : 78;
      return { ...d, estimatedCost: Math.round(cost * 10000) / 10000, speedScore, accuracyScore };
    });

    // Sort by priority
    recommendations.sort((a, b) => {
      if (priority === "cost") return a.estimatedCost - b.estimatedCost;
      if (priority === "speed") return b.speedScore - a.speedScore;
      return b.accuracyScore - a.accuracyScore;
    });

    const best = recommendations[0];
    const savings = recommendations.length > 1
      ? Math.round((recommendations[recommendations.length - 1].estimatedCost - best.estimatedCost) * 10000) / 10000
      : 0;

    // AI-generated recommendation
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let aiAdvice = null;

    if (LOVABLE_API_KEY) {
      try {
        const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              { role: "system", content: "You are a quantum computing cost advisor. Give a 1-2 sentence recommendation. Be direct." },
              { role: "user", content: `User wants to run a ${numQubits}-qubit circuit with ${numShots} shots. Best option: ${best.name} at $${best.estimatedCost}. Priority: ${priority}. Give a short recommendation.` },
            ],
          }),
        });
        if (resp.ok) {
          const r = await resp.json();
          aiAdvice = r.choices?.[0]?.message?.content || null;
        }
      } catch { /* non-critical */ }
    }

    return new Response(JSON.stringify({
      recommendations: recommendations.slice(0, 5),
      bestPick: best,
      potentialSavings: savings,
      aiAdvice,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("quantum-cost-optimizer error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
