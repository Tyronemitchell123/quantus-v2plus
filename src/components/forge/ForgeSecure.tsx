import { motion } from "framer-motion";
import {
  Shield, Lock, Key, Eye, Globe, AlertTriangle,
  CheckCircle2, Clock, RefreshCw, FileKey2, Server,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const securityChecks = [
  { check: "SSL/TLS Certificate", status: "valid", detail: "Let's Encrypt · Expires 2026-07-01", icon: Lock },
  { check: "HSTS Header", status: "active", detail: "max-age=31536000; includeSubDomains", icon: Shield },
  { check: "CSP Policy", status: "active", detail: "Strict content security policy enforced", icon: FileKey2 },
  { check: "DDoS Protection", status: "active", detail: "Edge-layer mitigation enabled", icon: Server },
  { check: "WAF Rules", status: "active", detail: "OWASP Top 10 ruleset applied", icon: Shield },
  { check: "Data Residency", status: "compliant", detail: "EU-West (GDPR aligned)", icon: Globe },
];

const backupSchedule = [
  { type: "Full Backup", frequency: "Daily", lastRun: "Today 03:00 UTC", retention: "30 days", status: "success" },
  { type: "Incremental", frequency: "Hourly", lastRun: "14:00 UTC", retention: "7 days", status: "success" },
  { type: "Database Snapshot", frequency: "6 hours", lastRun: "12:00 UTC", retention: "14 days", status: "success" },
  { type: "Off-site Replication", frequency: "Daily", lastRun: "Today 04:00 UTC", retention: "90 days", status: "success" },
];

const ForgeSecure = () => (
  <div className="space-y-6">
    {/* Security Score */}
    <Card className="bg-card/60 border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full border-4 border-success flex items-center justify-center">
            <span className="text-2xl font-bold text-success">A+</span>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-foreground mb-1">Security Posture: Sovereign Grade</h3>
            <p className="text-xs text-muted-foreground mb-3">All security controls are active and compliant. Zero vulnerabilities detected.</p>
            <div className="flex items-center gap-2">
              <Progress value={100} className="h-1.5 flex-1" />
              <span className="text-xs font-mono text-success">6/6 passed</span>
            </div>
          </div>
          <Button size="sm" variant="outline" className="h-8 gap-1 text-xs"><RefreshCw className="w-3 h-3" /> Re-scan</Button>
        </div>
      </CardContent>
    </Card>

    {/* Security Checks */}
    <div className="space-y-3">
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Security Controls</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {securityChecks.map((s, i) => (
          <motion.div key={s.check} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <Card className="bg-card/60 border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                  <s.icon className="w-4 h-4 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium text-foreground">{s.check}</span>
                    <Badge variant="outline" className="text-[8px] text-success border-success/30">{s.status.toUpperCase()}</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{s.detail}</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>

    {/* Backup Schedule */}
    <Card className="bg-card/60 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Backup Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {backupSchedule.map((b) => (
            <div key={b.type} className="flex items-center gap-3 p-3 rounded-lg bg-background/60 border border-border/20">
              <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-foreground">{b.type}</span>
                <span className="text-[10px] text-muted-foreground ml-2">Every {b.frequency}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{b.lastRun}</span>
              <Badge variant="outline" className="text-[8px]">{b.retention}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default ForgeSecure;
