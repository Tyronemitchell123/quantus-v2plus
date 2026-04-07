import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AIRecommendation {
  suggestedModules: string[];
  suggestedTier: string;
  narrative: string;
  loading: boolean;
}

/**
 * Uses AI to personalise onboarding recommendations based on
 * the user's selected role and preferences.
 */
export function useOnboardingAI() {
  const [recommendation, setRecommendation] = useState<AIRecommendation>({
    suggestedModules: [],
    suggestedTier: "",
    narrative: "",
    loading: false,
  });

  const generateRecommendations = useCallback(
    async (role: string, preferences: Record<string, string>) => {
      setRecommendation((r) => ({ ...r, loading: true }));

      try {
        const { data, error } = await supabase.functions.invoke("concierge-chat", {
          body: {
            messages: [
              {
                role: "user",
                content: `Based on this user profile, suggest the best QUANTUS modules and membership tier.
Role: ${role}
Preferences: ${JSON.stringify(preferences)}

Respond in JSON only: { "suggestedModules": ["aviation","lifestyle",...], "suggestedTier": "sovereign"|"elite"|"premier", "narrative": "one sentence explanation" }`,
              },
            ],
          },
        });

        if (error) throw error;

        // The edge function returns an SSE stream — read it fully
        let content = "";
        if (data instanceof ReadableStream) {
          const reader = data.getReader();
          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            // Parse SSE lines to extract content deltas
            for (const line of chunk.split("\n")) {
              if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
              try {
                const parsed = JSON.parse(line.slice(6));
                content += parsed.choices?.[0]?.delta?.content || "";
              } catch { /* skip non-JSON lines */ }
            }
          }
        } else if (typeof data === "string") {
          content = data;
        } else {
          content = data?.reply || data?.content || JSON.stringify(data) || "";
        }

        // Extract JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setRecommendation({
            suggestedModules: parsed.suggestedModules || [],
            suggestedTier: parsed.suggestedTier || "",
            narrative: parsed.narrative || "",
            loading: false,
          });
          return parsed;
        }
      } catch (err) {
        console.warn("AI onboarding recommendation failed, using defaults", err);
      }

      // Fallback: role-based defaults
      const defaults = getRoleDefaults(role);
      setRecommendation({ ...defaults, loading: false });
      return defaults;
    },
    [],
  );

  return { recommendation, generateRecommendations };
}

function getRoleDefaults(role: string) {
  const map: Record<string, { suggestedModules: string[]; suggestedTier: string; narrative: string }> = {
    "Family Office": {
      suggestedModules: ["finance", "legal", "lifestyle", "aviation"],
      suggestedTier: "sovereign",
      narrative: "Tailored for multi-generational wealth stewardship with full-spectrum access.",
    },
    "UHNW Individual": {
      suggestedModules: ["lifestyle", "aviation", "marine", "medical"],
      suggestedTier: "sovereign",
      narrative: "Curated for discerning individuals who require white-glove orchestration.",
    },
    "Corporate Executive": {
      suggestedModules: ["finance", "legal", "staffing", "logistics"],
      suggestedTier: "elite",
      narrative: "Optimised for enterprise-grade deal flow and operational efficiency.",
    },
    "Private Advisor": {
      suggestedModules: ["finance", "legal", "partnerships"],
      suggestedTier: "elite",
      narrative: "Built for advisors managing complex client portfolios.",
    },
    "Entrepreneur": {
      suggestedModules: ["finance", "staffing", "partnerships", "logistics"],
      suggestedTier: "premier",
      narrative: "Designed for founders scaling rapidly across multiple verticals.",
    },
  };
  return map[role] || { suggestedModules: ["finance", "lifestyle"], suggestedTier: "premier", narrative: "Personalised recommendations based on your profile." };
}
