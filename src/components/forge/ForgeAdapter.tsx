import { motion } from "framer-motion";
import {
  Cog, ArrowRight, Shield, CheckCircle2, AlertTriangle,
  Activity, Code2, Eye, RefreshCw, Lock, Server,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/**
 * ForgeAdapter — The sovereign isolation layer.
 *
 * This component manages the single adapter file that wraps the
 * upstream website-generation engine. All external identifiers,
 * API surfaces, and branding are masked here before entering the
 * Quantus ecosystem. No upstream brand may leak past this boundary.
 */

const adapterPipeline = [
  { phase: "Ingest", description: "Receive structured task from Core.Orchestrate", status: "active" },
  { phase: "Normalize", description: "Strip upstream identifiers, map to Quantus schema", status: "active" },
  { phase: "Brand Inject", description: "Apply Helix DNA tokens (palette, typography, tone)", status: "active" },
  { phase: "Render", description: "Execute generation via isolated adapter module", status: "active" },
  { phase: "Sanitize", description: "Scrub output for any upstream residue", status: "active" },
  { phase: "Deliver", description: "Return sovereign-branded artefact to Forge.Deploy", status: "active" },
];

const sovereigntyRules = [
  { rule: "No external service names in HTML output", enforced: true },
  { rule: "No upstream API URLs in client-side code", enforced: true },
  { rule: "No upstream CSS class prefixes in stylesheets", enforced: true },
  { rule: "No external tracking or analytics scripts", enforced: true },
  { rule: "All meta tags use Quantus branding", enforced: true },
  { rule: "All error pages use sovereign templates", enforced: true },
  { rule: "Adapter module is single-file, replaceable", enforced: true },
  { rule: "Zero upstream dependencies in final bundle", enforced: true },
];

const adapterStatus = {
  engine: "Generation Engine v4.2",
  lastHealth: "2 min ago",
  uptime: "99.97%",
  avgLatency: "1.2s",
  requestsToday: 47,
};

const ForgeAdapter = () => (
  <div className="space-y-6">
    {/* Adapter Status */}
    <Card className="bg-card/60 border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Cog className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">Sovereign Adapter Layer</h3>
              <p className="text-[10px] text-muted-foreground">Single-file isolation boundary — all upstream access is masked</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[9px] text-success border-success/30">HEALTHY</Badge>
            <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1"><RefreshCw className="w-3 h-3" /> Health Check</Button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Engine", value: adapterStatus.engine },
            { label: "Uptime", value: adapterStatus.uptime },
            { label: "Avg Latency", value: adapterStatus.avgLatency },
            { label: "Requests Today", value: String(adapterStatus.requestsToday) },
            { label: "Last Health Check", value: adapterStatus.lastHealth },
          ].map((s) => (
            <div key={s.label} className="p-3 rounded-lg bg-background/60 border border-border/20">
              <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">{s.label}</p>
              <p className="text-xs font-medium text-foreground">{s.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Adapter Pipeline */}
    <Card className="bg-card/60 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Adapter Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {adapterPipeline.map((p, i) => (
            <motion.div key={p.phase} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-background/60 border border-border/20"
            >
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-mono text-primary">{i + 1}</div>
              <div className="flex-1">
                <span className="text-xs font-medium text-foreground">{p.phase}</span>
                <span className="text-[10px] text-muted-foreground ml-2">{p.description}</span>
              </div>
              <CheckCircle2 className="w-3.5 h-3.5 text-success" />
              {i < adapterPipeline.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground/30" />}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Sovereignty Enforcement */}
    <Card className="bg-card/60 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Sovereignty Enforcement Rules</CardTitle>
          <Badge variant="outline" className="text-[9px] text-success border-success/30">{sovereigntyRules.length}/{sovereigntyRules.length} ENFORCED</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {sovereigntyRules.map((r) => (
            <div key={r.rule} className="flex items-center gap-2 p-2.5 rounded-lg bg-background/60 border border-border/20">
              <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
              <span className="text-[11px] text-foreground">{r.rule}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Adapter File Reference */}
    <Card className="bg-card/60 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2"><Code2 className="w-4 h-4 text-primary" /> Adapter Module Reference</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-background/80 rounded-lg border border-border/30 p-4 font-mono text-[11px] space-y-1">
          <p className="text-muted-foreground">{"// forge-adapter.ts — Single-file isolation module"}</p>
          <p className="text-muted-foreground">{"// All upstream engine calls are routed through this file."}</p>
          <p className="text-muted-foreground">{"// No other module in the Quantus ecosystem may import"}</p>
          <p className="text-muted-foreground">{"// or reference the upstream engine directly."}</p>
          <p className="text-foreground mt-3">{"export interface ForgeAdapterConfig {"}</p>
          <p className="text-foreground pl-4">{"helixDNA: HelixDNAProfile;"}</p>
          <p className="text-foreground pl-4">{"template: SovereignTemplate;"}</p>
          <p className="text-foreground pl-4">{"siteName: string;"}</p>
          <p className="text-foreground pl-4">{"region: DeployRegion;"}</p>
          <p className="text-foreground">{"}"}</p>
          <p className="text-foreground mt-2">{"export async function generateSite(config: ForgeAdapterConfig): Promise<ForgeArtefact>"}</p>
          <p className="text-foreground">{"export async function deploySite(artefact: ForgeArtefact): Promise<DeployResult>"}</p>
          <p className="text-foreground">{"export async function sanitizeOutput(html: string): Promise<string>"}</p>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default ForgeAdapter;
