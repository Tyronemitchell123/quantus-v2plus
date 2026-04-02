/**
 * QUANTUS V2 — Sovereign OS Type System
 *
 * Canonical data models for all module-to-module communication.
 * Every subsystem reads from and writes to these interfaces.
 */

// ─── Helix Brand DNA ──────────────────────────────────────
export interface HelixDNAProfile {
  id: string;
  name: string;
  palette: {
    background: string;      // HSL
    foreground: string;
    primary: string;
    accent: string;
    muted: string;
    card: string;
  };
  typography: {
    display: string;          // e.g. "Playfair Display, serif"
    body: string;
    mono: string;
  };
  spacing: {
    ratio: string;            // e.g. "1:3:9"
    gridColumns: number;
    borderRadius: string;
  };
  tone: HelixToneProfile;
  persona: HelixPersonaArchetype;
}

export interface HelixToneProfile {
  voice: string;
  register: string;
  emotion: string;
  prohibited: string[];
  maxSentenceLength: number;
  person: string;
}

export type HelixPersonaArchetype = "sovereign" | "architect" | "operator" | "diplomat";

export interface HelixToneAuditResult {
  passed: boolean;
  findings: HelixToneFinding[];
}

export interface HelixToneFinding {
  term: string;
  issue: string;
  severity: "warning" | "violation";
}

// ─── Core Orchestration ───────────────────────────────────
export type CoreModuleName =
  | "aviation" | "medical" | "hospitality" | "lifestyle"
  | "longevity" | "marine" | "finance" | "legal"
  | "logistics" | "staffing" | "partnerships";

export type CorePipelinePhase =
  | "intake" | "matching" | "sourcing" | "outreach"
  | "negotiation" | "execution" | "documentation" | "completed";

export interface CoreTask {
  id: string;
  source: "core" | "helix" | "forge" | "user";
  target: CoreModuleName | "helix" | "forge";
  action: string;
  payload: Record<string, unknown>;
  priority: number;
  createdAt: string;
  status: "queued" | "processing" | "completed" | "failed";
}

export interface CoreAgentState {
  id: string;
  name: string;
  status: "active" | "idle" | "healing" | "failed";
  subsystem: string;
  lastRunAt: string;
  tasksCompleted: number;
  description: string;
}

export interface CoreModelRegistration {
  id: string;
  name: string;
  provider: string;
  role: string;
  usage: string;
  status: "active" | "standby" | "deprecated";
}

export interface CorePermissionPolicy {
  table: string;
  policies: number;
  level: string;
  status: "enforced" | "pending" | "disabled";
}

export interface CoreNormalisationRule {
  source: string;
  target: string;
  transforms: string;
  status: "active" | "standby";
}

// ─── Forge Website Engine ─────────────────────────────────
export interface ForgeSiteConfig {
  siteName: string;
  template: ForgeSovereignTemplate;
  helixDNA: HelixDNAProfile;
  region: ForgeDeployRegion;
  brief?: string;
}

export interface ForgeSovereignTemplate {
  id: string;
  name: string;
  category: string;
  pages: number;
  description: string;
}

export type ForgeDeployRegion = "eu-west-1" | "us-east-1" | "ap-southeast-1";

export interface ForgeDeployedSite {
  id: string;
  siteName: string;
  domain: string;
  region: ForgeDeployRegion;
  status: "live" | "staging" | "building" | "failed";
  sslStatus: "active" | "pending" | "expired";
  lighthouseScore: number;
  createdAt: string;
  lastDeployAt: string;
}

export interface ForgeAdapterConfig {
  helixDNA: HelixDNAProfile;
  template: ForgeSovereignTemplate;
  siteName: string;
  region: ForgeDeployRegion;
}

export interface ForgeArtefact {
  html: string;
  css: string;
  assets: string[];
  metadata: Record<string, string>;
  sanitized: boolean;
}

export interface ForgeSecurityPosture {
  sslTls: boolean;
  hsts: boolean;
  waf: boolean;
  backups: boolean;
  score: string; // e.g. "A+"
}

// ─── Module Communication Protocol ───────────────────────
export interface ModuleMessage {
  id: string;
  from: "core" | "helix" | "forge";
  to: "core" | "helix" | "forge";
  type: "task" | "query" | "event" | "response";
  payload: Record<string, unknown>;
  timestamp: string;
  correlationId?: string;
}
