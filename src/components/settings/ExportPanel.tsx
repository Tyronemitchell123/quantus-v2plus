import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Download, FileText, FileJson, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ExportPanel = () => {
  const [exporting, setExporting] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDashboardData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const userId = session.user.id;

    const [subRes, usageRes, alertsRes] = await Promise.all([
      supabase.from("subscriptions").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("usage_records").select("*").eq("user_id", userId).order("recorded_at", { ascending: false }).limit(100),
      supabase.from("anomaly_alerts").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50),
    ]);

    return {
      subscription: subRes.data,
      usage_records: usageRes.data || [],
      anomaly_alerts: alertsRes.data || [],
      exported_at: new Date().toISOString(),
    };
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportJSON = async () => {
    setExporting("json");
    try {
      const data = await fetchDashboardData();
      downloadFile(JSON.stringify(data, null, 2), `quantus-export-${Date.now()}.json`, "application/json");
      toast({ title: "Export complete", description: "Your data has been exported as JSON." });
    } catch (err: any) {
      toast({ title: "Export failed", description: err.message, variant: "destructive" });
    } finally {
      setExporting(null);
    }
  };

  const exportCSV = async () => {
    setExporting("csv");
    try {
      const data = await fetchDashboardData();
      const records = data.usage_records;
      if (!records.length) {
        toast({ title: "No data", description: "No usage records to export." });
        setExporting(null);
        return;
      }
      const headers = Object.keys(records[0]).join(",");
      const rows = records.map((r: any) => Object.values(r).map(v => `"${v}"`).join(","));
      downloadFile([headers, ...rows].join("\n"), `quantus-usage-${Date.now()}.csv`, "text/csv");
      toast({ title: "Export complete", description: "Your usage data has been exported as CSV." });
    } catch (err: any) {
      toast({ title: "Export failed", description: err.message, variant: "destructive" });
    } finally {
      setExporting(null);
    }
  };

  const exportPDF = async () => {
    setExporting("pdf");
    try {
      const data = await fetchDashboardData();
      // Generate a simple PDF-like HTML and print it
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast({ title: "Popup blocked", description: "Please allow popups to generate PDF reports.", variant: "destructive" });
        setExporting(null);
        return;
      }
      
      const sub = data.subscription;
      const alerts = data.anomaly_alerts;
      const usage = data.usage_records;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>QUANTUS AI Report</title>
          <style>
            body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
            h1 { color: #b8972f; border-bottom: 2px solid #b8972f; padding-bottom: 8px; }
            h2 { color: #333; margin-top: 32px; }
            table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #eee; }
            th { background: #f5f5f5; font-weight: 600; }
            .meta { color: #666; font-size: 14px; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
            .badge-active { background: #d4edda; color: #155724; }
            .badge-warning { background: #fff3cd; color: #856404; }
            .badge-critical { background: #f8d7da; color: #721c24; }
          </style>
        </head>
        <body>
          <h1>QUANTUS AI — Analytics Report</h1>
          <p class="meta">Generated: ${new Date().toLocaleString()}</p>
          
          <h2>Subscription</h2>
          <table>
            <tr><th>Tier</th><td>${sub?.tier || "free"}</td></tr>
            <tr><th>Status</th><td>${sub?.status || "active"}</td></tr>
            <tr><th>Billing</th><td>${sub?.billing_cycle || "monthly"}</td></tr>
          </table>
          
          <h2>Anomaly Alerts (${alerts.length})</h2>
          ${alerts.length ? `
            <table>
              <tr><th>Title</th><th>Severity</th><th>Date</th></tr>
              ${alerts.map((a: any) => `<tr><td>${a.title}</td><td><span class="badge badge-${a.severity}">${a.severity}</span></td><td>${new Date(a.created_at).toLocaleDateString()}</td></tr>`).join("")}
            </table>
          ` : "<p>No anomaly alerts recorded.</p>"}
          
          <h2>Recent Usage (${usage.length} records)</h2>
          ${usage.length ? `
            <table>
              <tr><th>Feature</th><th>Quantity</th><th>Date</th></tr>
              ${usage.slice(0, 20).map((u: any) => `<tr><td>${u.feature}</td><td>${u.quantity}</td><td>${new Date(u.recorded_at).toLocaleDateString()}</td></tr>`).join("")}
            </table>
          ` : "<p>No usage records found.</p>"}
          
          <script>window.onload = function() { window.print(); }</script>
        </body>
        </html>
      `);
      printWindow.document.close();
      toast({ title: "PDF ready", description: "Your report is ready to print/save as PDF." });
    } catch (err: any) {
      toast({ title: "Export failed", description: err.message, variant: "destructive" });
    } finally {
      setExporting(null);
    }
  };

  const actions = [
    { key: "json", label: "Export JSON", icon: FileJson, description: "Full data export in JSON format", action: exportJSON },
    { key: "csv", label: "Export CSV", icon: FileText, description: "Usage records as spreadsheet", action: exportCSV },
    { key: "pdf", label: "PDF Report", icon: Download, description: "Printable analytics report", action: exportPDF },
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-semibold text-foreground">Data Export</h3>
      <p className="text-sm text-muted-foreground">Download your analytics data in multiple formats.</p>
      <div className="grid sm:grid-cols-3 gap-4">
        {actions.map((a) => (
          <motion.button
            key={a.key}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={a.action}
            disabled={exporting !== null}
            className="glass-card rounded-xl p-5 text-left hover:ring-1 hover:ring-primary/20 transition-all disabled:opacity-50"
          >
            <div className="flex items-center gap-3 mb-2">
              {exporting === a.key ? (
                <Loader2 size={20} className="text-primary animate-spin" />
              ) : (
                <a.icon size={20} className="text-primary" />
              )}
              <span className="font-display text-sm font-semibold text-foreground">{a.label}</span>
            </div>
            <p className="text-xs text-muted-foreground">{a.description}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default ExportPanel;
