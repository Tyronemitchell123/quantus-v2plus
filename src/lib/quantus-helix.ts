/**
 * QUANTUS HELIX — Brand Genome API
 *
 * Generates, enforces, and exports brand DNA for all modules.
 * Provides structured profiles consumable by Forge and Core.
 */

import type {
  HelixDNAProfile,
  HelixToneProfile,
  HelixToneAuditResult,
  HelixToneFinding,
  HelixPersonaArchetype,
} from "./quantus-types";

// ─── Default DNA Profiles ─────────────────────────────────
const OBSIDIAN_GOLD: HelixDNAProfile = {
  id: "obsidian-gold",
  name: "Obsidian Gold",
  palette: {
    background: "225 80% 4%",
    foreground: "0 0% 95%",
    primary: "43 56% 52%",
    accent: "43 100% 70%",
    muted: "220 10% 78%",
    card: "224 40% 8%",
  },
  typography: {
    display: "Playfair Display, serif",
    body: "Inter, sans-serif",
    mono: "monospace",
  },
  spacing: {
    ratio: "1:3:9",
    gridColumns: 12,
    borderRadius: "12px",
  },
  tone: {
    voice: "Authoritative yet understated — never sells, only reveals",
    register: "Executive boardroom, not marketing collateral",
    emotion: "Controlled confidence — the calm of absolute certainty",
    prohibited: ["exclamation marks", "emojis", "superlatives", "sales language"],
    maxSentenceLength: 25,
    person: "Third-person institutional",
  },
  persona: "sovereign",
};

const ARCTIC_SILVER: HelixDNAProfile = {
  id: "arctic-silver",
  name: "Arctic Silver",
  palette: {
    background: "210 20% 6%",
    foreground: "0 0% 93%",
    primary: "210 15% 70%",
    accent: "210 30% 85%",
    muted: "210 10% 55%",
    card: "210 25% 10%",
  },
  typography: OBSIDIAN_GOLD.typography,
  spacing: OBSIDIAN_GOLD.spacing,
  tone: { ...OBSIDIAN_GOLD.tone, emotion: "Clinical precision — Swiss neutrality" },
  persona: "architect",
};

const MIDNIGHT_SAPPHIRE: HelixDNAProfile = {
  id: "midnight-sapphire",
  name: "Midnight Sapphire",
  palette: {
    background: "230 50% 5%",
    foreground: "0 0% 94%",
    primary: "220 70% 55%",
    accent: "230 60% 70%",
    muted: "220 15% 60%",
    card: "230 40% 9%",
  },
  typography: OBSIDIAN_GOLD.typography,
  spacing: OBSIDIAN_GOLD.spacing,
  tone: { ...OBSIDIAN_GOLD.tone, voice: "Diplomatic authority — measured revelation" },
  persona: "diplomat",
};

const profiles: Map<string, HelixDNAProfile> = new Map([
  ["obsidian-gold", OBSIDIAN_GOLD],
  ["arctic-silver", ARCTIC_SILVER],
  ["midnight-sapphire", MIDNIGHT_SAPPHIRE],
]);

// ─── Public API ───────────────────────────────────────────
export function getDNAProfile(profileId: string): HelixDNAProfile | undefined {
  return profiles.get(profileId);
}

export function getDefaultProfile(): HelixDNAProfile {
  return OBSIDIAN_GOLD;
}

export function listProfiles(): HelixDNAProfile[] {
  return Array.from(profiles.values());
}

export function registerProfile(profile: HelixDNAProfile): void {
  profiles.set(profile.id, profile);
}

// ─── Tone Enforcement ─────────────────────────────────────
const PROHIBITED_PATTERNS: [RegExp, string][] = [
  [/!/g, "Exclamation mark detected — prohibited"],
  [/amazing|incredible|best|awesome|revolutionary|stunning/gi, "Superlative detected — use understated authority"],
  [/buy now|limited time|hurry|don't miss|act now|exclusive offer/gi, "Sales language detected — Quantus reveals, never sells"],
  [/😀|🎉|👍|🚀|💡|✨|❤️|🔥|💯/u, "Emoji detected — prohibited"],
  [/supabase|stripe|aws|firecrawl|10web|vercel|netlify|heroku/gi, "External brand name detected — sovereignty violation"],
  [/click here|learn more|subscribe|sign up now/gi, "Generic CTA detected — use sovereign language"],
];

export function auditTone(text: string, profile?: HelixToneProfile): HelixToneAuditResult {
  const findings: HelixToneFinding[] = [];

  PROHIBITED_PATTERNS.forEach(([pattern, issue]) => {
    if (pattern.test(text)) {
      findings.push({ term: "Tone", issue, severity: "violation" });
    }
  });

  // Sentence length check
  const maxLen = profile?.maxSentenceLength || 25;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  sentences.forEach((s) => {
    const words = s.trim().split(/\s+/).length;
    if (words > maxLen) {
      findings.push({
        term: "Length",
        issue: `Sentence has ${words} words (max ${maxLen})`,
        severity: "warning",
      });
    }
  });

  return { passed: findings.length === 0, findings };
}

// ─── Persona Mapping ──────────────────────────────────────
export interface PersonaArchetype {
  name: string;
  tagline: string;
  traits: string[];
  tone: string;
  modules: string[];
}

const archetypeMap: Record<HelixPersonaArchetype, PersonaArchetype> = {
  sovereign: {
    name: "The Sovereign",
    tagline: "Controls everything, touches nothing",
    traits: ["Delegates entirely to autonomous systems", "Values privacy above all", "Measures success in optionality"],
    tone: "Third-person institutional. No questions — only statements of capability",
    modules: ["Aviation", "Lifestyle", "Finance"],
  },
  architect: {
    name: "The Architect",
    tagline: "Builds systems that outlast the builder",
    traits: ["Thinks in decades", "Obsessed with compounding infrastructure", "Views every asset as a network node"],
    tone: "Technical precision. Quantified outcomes with zero embellishment",
    modules: ["Legal", "Logistics", "Partnerships"],
  },
  operator: {
    name: "The Operator",
    tagline: "Execution is identity",
    traits: ["Speed and precision in equal measure", "Zero tolerance for operational friction", "Autonomy through automation"],
    tone: "Direct, action-oriented. Short sentences. Results-first",
    modules: ["Medical", "Staffing", "Marine"],
  },
  diplomat: {
    name: "The Diplomat",
    tagline: "Influence through invisible channels",
    traits: ["Multi-jurisdictional awareness", "Relationship-driven deal flow", "Discretion as competitive advantage"],
    tone: "Warm but restrained. Acknowledges without flattering",
    modules: ["Hospitality", "Longevity", "Finance"],
  },
};

export function getPersona(archetype: HelixPersonaArchetype): PersonaArchetype {
  return archetypeMap[archetype];
}

export function listPersonas(): PersonaArchetype[] {
  return Object.values(archetypeMap);
}

// ─── Brand DNA Export for Forge ───────────────────────────
export function exportDNAForForge(profileId: string): Record<string, unknown> | null {
  const profile = getDNAProfile(profileId);
  if (!profile) return null;

  return {
    cssVariables: {
      "--background": profile.palette.background,
      "--foreground": profile.palette.foreground,
      "--primary": profile.palette.primary,
      "--accent": profile.palette.accent,
      "--muted-foreground": profile.palette.muted,
      "--card": profile.palette.card,
      "--radius": profile.spacing.borderRadius,
    },
    fontFamilies: profile.typography,
    gridSystem: {
      columns: profile.spacing.gridColumns,
      ratio: profile.spacing.ratio,
    },
    toneRules: profile.tone,
    persona: getPersona(profile.persona),
  };
}
