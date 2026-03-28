import { useState } from "react";
import { motion } from "framer-motion";
import useDocumentHead from "@/hooks/use-document-head";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import {
  Shield, AlertTriangle, CheckCircle2, XCircle, Search, FileText,
  Globe, User, Building2, Clock, Eye, ShieldCheck, ShieldAlert, Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ComplianceCheck {
  id: string;
  entity: string;
  type: "individual" | "corporate";
  kycStatus: "verified" | "pending" | "failed" | "expired";
  amlStatus: "clear" | "flagged" | "reviewing";
  sanctionsStatus: "clear" | "match" | "reviewing";
  pepStatus: "clear" | "match";
  lastChecked: string;
  riskScore: number;
  jurisdiction: string;
}

const complianceChecks: ComplianceCheck[] = [
  { id: "1", entity: "Meridian Aviation Ltd", type: "corporate", kycStatus: "verified", amlStatus: "clear", sanctionsStatus: "clear", pepStatus: "clear", lastChecked: "2h ago", riskScore: 12, jurisdiction: "UK" },
  { id: "2", entity: "Dr. Heinrich Müller", type: "individual", kycStatus: "verified", amlStatus: "flagged", sanctionsStatus: "clear", pepStatus: "match", lastChecked: "1d ago", riskScore: 67, jurisdiction: "CH" },
  { id: "3", entity: "Pacific Staffing Group", type: "corporate", kycStatus: "pending", amlStatus: "reviewing", sanctionsStatus: "clear", pepStatus: "clear", lastChecked: "3d ago", riskScore: 34, jurisdiction: "SG" },
  { id: "4", entity: "Volkov Holdings", type: "corporate", kycStatus: "failed", amlStatus: "flagged", sanctionsStatus: "match", pepStatus: "match", lastChecked: "5d ago", riskScore: 92, jurisdiction: "CY" },
  { id: "5", entity: "Lady Catherine Ashworth", type: "individual", kycStatus: "verified", amlStatus: "clear", sanctionsStatus: "clear", pepStatus: "clear", lastChecked: "12h ago", riskScore: 8, jurisdiction: "UK" },
];

const statusIcon = (s: string) => {
  if (s === "verified" || s === "clear") return <CheckCircle2 size={12} className="text-emerald-500" />;
  if (s === "pending" || s === "reviewing") return <Clock size={12} className="text-amber-500" />;
  return <XCircle size={12} className="text-rose-500" />;
};

const riskColor = (score: number) => score < 30 ? "text-emerald-500" : score < 60 ? "text-amber-500" : "text-rose-500";

const RiskCompliance = () => {
  useDocumentHead("Risk & Compliance — Quantus A.I", "KYC/AML checks, sanctions screening, and regulatory compliance monitoring.");
  const [search, setSearch] = useState("");
  const filtered = complianceChecks.filter(c => c.entity.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total: complianceChecks.length,
    verified: complianceChecks.filter(c => c.kycStatus === "verified").length,
    flagged: complianceChecks.filter(c => c.amlStatus === "flagged" || c.sanctionsStatus === "match").length,
    pending: complianceChecks.filter(c => c.kycStatus === "pending").length,
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardTopBar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-display tracking-tight text-foreground">Risk & Compliance Hub</h1>
            <p className="text-sm text-muted-foreground mt-1">KYC/AML verification, sanctions screening, and regulatory monitoring</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Entities", value: stats.total, icon: Building2, color: "text-primary" },
              { label: "Verified", value: stats.verified, icon: ShieldCheck, color: "text-emerald-500" },
              { label: "Flagged", value: stats.flagged, icon: ShieldAlert, color: "text-rose-500" },
              { label: "Pending Review", value: stats.pending, icon: Clock, color: "text-amber-500" },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${s.color}`}>
                      <s.icon size={18} />
                    </div>
                    <div>
                      <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground font-body">{s.label}</p>
                      <p className="text-xl font-display text-foreground">{s.value}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Tabs defaultValue="entities">
            <TabsList className="bg-secondary/50 border border-border">
              <TabsTrigger value="entities" className="text-xs tracking-wider uppercase font-body">Entities</TabsTrigger>
              <TabsTrigger value="monitoring" className="text-xs tracking-wider uppercase font-body">Monitoring</TabsTrigger>
            </TabsList>

            <TabsContent value="entities" className="mt-4 space-y-4">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search entities…" className="pl-9 font-body text-sm" />
              </div>

              {filtered.map((check, i) => (
                <motion.div key={check.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className={`${check.riskScore > 60 ? "border-rose-500/20" : "hover:border-primary/20"} transition-colors`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                            {check.type === "individual" ? <User size={16} className="text-muted-foreground" /> : <Building2 size={16} className="text-muted-foreground" />}
                          </div>
                          <div>
                            <p className="text-sm font-body text-foreground">{check.entity}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge variant="secondary" className="text-[8px] uppercase">{check.type}</Badge>
                              <span className="text-[10px] text-muted-foreground font-body flex items-center gap-1"><Globe size={8} />{check.jurisdiction}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-display ${riskColor(check.riskScore)}`}>{check.riskScore}</p>
                          <p className="text-[8px] tracking-wider uppercase text-muted-foreground font-body">Risk Score</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { label: "KYC", status: check.kycStatus },
                          { label: "AML", status: check.amlStatus },
                          { label: "Sanctions", status: check.sanctionsStatus },
                          { label: "PEP", status: check.pepStatus },
                        ].map(item => (
                          <div key={item.label} className="flex items-center gap-1.5">
                            {statusIcon(item.status)}
                            <div>
                              <p className="text-[8px] tracking-wider uppercase text-muted-foreground font-body">{item.label}</p>
                              <p className="text-[10px] font-body text-foreground capitalize">{item.status}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                        <span className="text-[10px] text-muted-foreground font-body">Last checked: {check.lastChecked}</span>
                        <button className="text-[10px] tracking-wider uppercase text-primary font-body hover:underline flex items-center gap-1">
                          <Eye size={10} /> View Report
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="monitoring" className="mt-4 space-y-4">
              <Card className="border-primary/20">
                <CardHeader><CardTitle className="text-sm font-body tracking-wider uppercase flex items-center gap-2"><Activity size={14} className="text-primary" /> Live Monitoring</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "OFAC Sanctions List", lastSync: "5 min ago", status: "active" },
                    { label: "EU Consolidated List", lastSync: "12 min ago", status: "active" },
                    { label: "UN Security Council", lastSync: "8 min ago", status: "active" },
                    { label: "HMT Financial Sanctions", lastSync: "3 min ago", status: "active" },
                    { label: "PEP Database (Global)", lastSync: "1h ago", status: "active" },
                  ].map((feed, i) => (
                    <div key={feed.label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-sm font-body text-foreground">{feed.label}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-body">{feed.lastSync}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default RiskCompliance;
