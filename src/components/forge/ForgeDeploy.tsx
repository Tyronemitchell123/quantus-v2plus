import { motion } from "framer-motion";
import {
  Globe, Eye, Paintbrush, Settings, Clock, ArrowUpRight,
  CheckCircle2, Server, Activity, Shield, RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const deployedSites = [
  { id: "1", name: "meridian-capital.sovereign.io", template: "Sovereign Portfolio", status: "live", lastDeploy: "2 hours ago", pages: 7, performance: 96, ssl: true, region: "EU-West" },
  { id: "2", name: "altus-aviation.sovereign.io", template: "Aviation Charter", status: "live", lastDeploy: "1 day ago", pages: 9, performance: 94, ssl: true, region: "US-East" },
  { id: "3", name: "vitality-zurich.sovereign.io", template: "Longevity Clinic", status: "staging", lastDeploy: "5 min ago", pages: 11, performance: 91, ssl: true, region: "EU-Central" },
];

const deploymentLog = [
  { ts: "14:32:01", event: "Build complete", site: "vitality-zurich", status: "success" },
  { ts: "14:31:58", event: "Asset optimization", site: "vitality-zurich", status: "success" },
  { ts: "14:31:45", event: "Helix DNA injection", site: "vitality-zurich", status: "success" },
  { ts: "14:31:30", event: "Container provisioned", site: "vitality-zurich", status: "success" },
  { ts: "12:05:11", event: "SSL renewed", site: "meridian-capital", status: "success" },
];

const ForgeDeploy = () => (
  <div className="space-y-6">
    {/* Fleet Overview */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        { label: "Active Sites", value: "2", icon: Globe },
        { label: "Staging", value: "1", icon: Server },
        { label: "Avg Performance", value: "94", icon: Activity },
        { label: "SSL Valid", value: "3/3", icon: Shield },
      ].map((stat) => (
        <Card key={stat.label} className="bg-card/60 border-border/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <stat.icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Deployed Sites */}
    <div className="space-y-3">
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Deployed Properties</h3>
      {deployedSites.map((site, i) => (
        <motion.div key={site.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <Card className="bg-card/60 backdrop-blur-sm border-border/50">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-foreground font-mono">{site.name}</h3>
                    <Badge variant="outline" className={`text-[9px] ${site.status === "live" ? "text-success border-success/30" : "text-primary border-primary/30"}`}>
                      {site.status}
                    </Badge>
                    {site.ssl && <Badge variant="outline" className="text-[9px] text-success border-success/30">SSL</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{site.template} · {site.pages} pages · {site.region}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" className="h-7 gap-1 text-[10px]"><Eye className="w-3 h-3" /> Preview</Button>
                  <Button size="sm" variant="ghost" className="h-7 gap-1 text-[10px]"><RefreshCw className="w-3 h-3" /> Redeploy</Button>
                  <Button size="sm" variant="ghost" className="h-7 gap-1 text-[10px]"><Settings className="w-3 h-3" /></Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Performance</span>
                  <div className="flex items-center gap-2">
                    <Progress value={site.performance} className="h-1.5 flex-1" />
                    <span className="text-xs font-mono text-foreground">{site.performance}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Last Deploy</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" /> {site.lastDeploy}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Actions</span>
                  <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 w-full"><ArrowUpRight className="w-3 h-3" /> Visit</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>

    {/* Deployment Log */}
    <Card className="bg-card/60 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Deployment Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-background/80 rounded-lg border border-border/30 p-3 font-mono text-[11px] space-y-1 max-h-48 overflow-y-auto">
          {deploymentLog.map((entry, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-muted-foreground w-16">{entry.ts}</span>
              <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
              <span className="text-foreground">{entry.event}</span>
              <span className="text-muted-foreground ml-auto">{entry.site}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default ForgeDeploy;
