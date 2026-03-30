import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle2, XCircle, AlertTriangle, Clock, Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface EmailLog {
  id: string;
  message_id: string | null;
  template_name: string;
  recipient_email: string;
  status: string;
  error_message: string | null;
  created_at: string;
}

const STATUS_BADGES: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle2 }> = {
  sent: { variant: "default", icon: CheckCircle2 },
  pending: { variant: "secondary", icon: Clock },
  dlq: { variant: "destructive", icon: XCircle },
  failed: { variant: "destructive", icon: XCircle },
  suppressed: { variant: "outline", icon: AlertTriangle },
  bounced: { variant: "destructive", icon: XCircle },
  complained: { variant: "destructive", icon: AlertTriangle },
};

const TIME_RANGES = [
  { label: "Last 24h", days: 1 },
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
];

export default function EmailMonitoringTab() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(7);
  const [templateFilter, setTemplateFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchLogs = async () => {
    setLoading(true);
    const since = new Date();
    since.setDate(since.getDate() - timeRange);

    const { data, error } = await supabase
      .from("email_send_log")
      .select("*")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false })
      .limit(500);

    if (!error && data) setLogs(data);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, [timeRange]);

  // Deduplicate by message_id — keep latest status
  const dedupedLogs = useMemo(() => {
    const map = new Map<string, EmailLog>();
    for (const log of logs) {
      const key = log.message_id || log.id;
      const existing = map.get(key);
      if (!existing || new Date(log.created_at) > new Date(existing.created_at)) {
        map.set(key, log);
      }
    }
    return Array.from(map.values());
  }, [logs]);

  // Get unique templates for filter
  const templates = useMemo(() => {
    const set = new Set(dedupedLogs.map(l => l.template_name));
    return Array.from(set).sort();
  }, [dedupedLogs]);

  // Apply filters
  const filteredLogs = useMemo(() => {
    return dedupedLogs.filter(log => {
      if (templateFilter !== "all" && log.template_name !== templateFilter) return false;
      if (statusFilter !== "all" && log.status !== statusFilter) return false;
      return true;
    });
  }, [dedupedLogs, templateFilter, statusFilter]);

  // Summary stats
  const stats = useMemo(() => {
    const total = filteredLogs.length;
    const sent = filteredLogs.filter(l => l.status === "sent").length;
    const failed = filteredLogs.filter(l => l.status === "dlq" || l.status === "failed").length;
    const suppressed = filteredLogs.filter(l => l.status === "suppressed").length;
    const pending = filteredLogs.filter(l => l.status === "pending").length;
    return { total, sent, failed, suppressed, pending };
  }, [filteredLogs]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {TIME_RANGES.map(r => (
            <Button
              key={r.days}
              size="sm"
              variant={timeRange === r.days ? "default" : "outline"}
              onClick={() => setTimeRange(r.days)}
            >
              {r.label}
            </Button>
          ))}
        </div>
        <Select value={templateFilter} onValueChange={setTemplateFilter}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="All templates" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All templates</SelectItem>
            {templates.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="dlq">Failed (DLQ)</SelectItem>
            <SelectItem value="suppressed">Suppressed</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" variant="ghost" onClick={fetchLogs} disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total Emails", value: stats.total, icon: Mail, color: "text-foreground" },
          { label: "Sent", value: stats.sent, icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-500" },
          { label: "Failed", value: stats.failed, icon: XCircle, color: "text-destructive" },
          { label: "Suppressed", value: stats.suppressed, icon: AlertTriangle, color: "text-orange-500" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/50">
              <CardContent className="p-4 flex flex-col items-center text-center gap-1">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-2xl font-bold tabular-nums">{s.value}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</span>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Email log table */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail size={18} className="text-primary" />
            Email Log
          </CardTitle>
          <CardDescription>{filteredLogs.length} emails (deduplicated by message ID)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-muted-foreground" size={24} />
            </div>
          ) : filteredLogs.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No emails found for the selected filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.slice(0, 50).map(log => {
                    const badge = STATUS_BADGES[log.status] || STATUS_BADGES.pending;
                    const BadgeIcon = badge.icon;
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="capitalize font-medium whitespace-nowrap">
                          {log.template_name.replace(/_/g, " ")}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate">
                          {log.recipient_email}
                        </TableCell>
                        <TableCell>
                          <Badge variant={badge.variant} className="gap-1 capitalize">
                            <BadgeIcon size={10} />
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(log.created_at)}
                        </TableCell>
                        <TableCell className="text-xs text-destructive max-w-[200px] truncate">
                          {log.error_message || "—"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {filteredLogs.length > 50 && (
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Showing 50 of {filteredLogs.length} emails
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
