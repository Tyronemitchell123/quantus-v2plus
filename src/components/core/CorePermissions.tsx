import { motion } from "framer-motion";
import { Shield, Users, Lock, Key, Eye, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const rlsPolicies = [
  { table: "deals", policies: 4, level: "User-scoped", status: "enforced" },
  { table: "profiles", policies: 3, level: "User-scoped", status: "enforced" },
  { table: "invoices", policies: 4, level: "User + Admin", status: "enforced" },
  { table: "agent_logs", policies: 2, level: "Admin + Service", status: "enforced" },
  { table: "patient_vault", policies: 1, level: "Service-only", status: "enforced" },
  { table: "encrypted_secrets", policies: 1, level: "Service-only", status: "enforced" },
  { table: "vendors", policies: 2, level: "Public read + Admin write", status: "enforced" },
  { table: "vanguard_clients", policies: 2, level: "User + Admin", status: "enforced" },
];

const CorePermissions = () => {
  const { data: auditCount } = useQuery({
    queryKey: ["core-audit-count"],
    queryFn: async () => {
      const { count } = await supabase.from("audit_logs").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: apiKeyCount } = useQuery({
    queryKey: ["core-api-key-count"],
    queryFn: async () => {
      const { count } = await supabase.from("api_keys").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  return (
    <div className="space-y-6">
      {/* Security Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "RLS Tables", value: rlsPolicies.length, icon: Shield, sub: "protected" },
          { label: "Total Policies", value: rlsPolicies.reduce((a, p) => a + p.policies, 0), icon: Lock, sub: "active" },
          { label: "Audit Events", value: auditCount?.toLocaleString() || "0", icon: Eye, sub: "logged" },
          { label: "API Keys", value: apiKeyCount || 0, icon: Key, sub: "issued" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className="bg-card/60 backdrop-blur-sm border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <s.icon className="w-4 h-4 text-primary" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</span>
                </div>
                <p className="text-2xl font-display font-semibold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{s.sub}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* RLS Policy Map */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-medium text-foreground">Row-Level Security Map</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {rlsPolicies.map((p, i) => (
            <motion.div key={p.table} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardContent className="p-3 flex items-center gap-3">
                  <Lock className="w-4 h-4 text-primary/60 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-foreground">{p.table}</span>
                      <Badge variant="outline" className="text-[8px] text-success border-success/30">{p.status}</Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{p.policies} policies · {p.level}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CorePermissions;
