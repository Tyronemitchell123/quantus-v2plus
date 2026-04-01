import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, DollarSign, Users, TrendingUp, Gift, AlertTriangle, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import useDocumentHead from "@/hooks/use-document-head";
import ConversionFunnel from "@/components/admin/ConversionFunnel";
import EmailMonitoringTab from "@/components/admin/EmailMonitoringTab";
import VendorManagementTab from "@/components/admin/VendorManagementTab";
import SystemHealthPanel from "@/components/admin/SystemHealthPanel";

interface DashboardData {
  addonSales: {
    records: any[];
    totalRevenue: number;
    activeCount: number;
    totalSales: number;
  };
  referrals: {
    codes: any[];
    redemptions: any[];
    totalCodes: number;
    totalRedemptions: number;
    totalCreditsAwarded: number;
  };
  overages: {
    records: any[];
    totalRevenue: number;
    pendingCount: number;
    totalRecords: number;
  };
}

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(cents / 100);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

const StatusBadge = ({ status }: { status: string }) => {
  const variant = status === "active" || status === "completed" ? "default" : status === "pending" ? "secondary" : "destructive";
  return <Badge variant={variant} className="capitalize">{status}</Badge>;
};

const AdminDashboard = () => {
  useDocumentHead({ title: "Admin Dashboard — QUANTUS V2+", description: "Admin metrics overview" });
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setError("Not authenticated"); setLoading(false); return; }

        const res = await supabase.functions.invoke("admin-dashboard");
        if (res.error) throw res.error;
        setData(res.data);
      } catch (e: any) {
        setError(e.message || "Failed to load admin data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md"><CardContent className="p-8 text-center">
          <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">{error}</p>
        </CardContent></Card>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    { label: "Add-on Revenue", value: formatCurrency(data.addonSales.totalRevenue), icon: DollarSign, color: "text-emerald-500" },
    { label: "Active Add-ons", value: data.addonSales.activeCount, icon: Package, color: "text-blue-500" },
    { label: "Referral Redemptions", value: data.referrals.totalRedemptions, icon: Gift, color: "text-purple-500" },
    { label: "Credits Awarded", value: data.referrals.totalCreditsAwarded.toLocaleString(), icon: Users, color: "text-amber-500" },
    { label: "Overage Revenue", value: formatCurrency(data.overages.totalRevenue), icon: TrendingUp, color: "text-rose-500" },
    { label: "Pending Overages", value: data.overages.pendingCount, icon: AlertTriangle, color: "text-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-7 h-7 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Add-on sales, referral metrics &amp; overage billing overview</p>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card>
                <CardContent className="p-4 flex flex-col items-center text-center gap-1">
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                  <span className="text-xl font-bold text-foreground">{s.value}</span>
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="funnel" className="space-y-4">
          <TabsList>
            <TabsTrigger value="funnel">Conversion Funnel</TabsTrigger>
            <TabsTrigger value="vendors">Vendors</TabsTrigger>
            <TabsTrigger value="health">System Health</TabsTrigger>
            <TabsTrigger value="emails">Email Monitoring</TabsTrigger>
            <TabsTrigger value="addons">Add-on Sales</TabsTrigger>
            <TabsTrigger value="referrals">Referral Metrics</TabsTrigger>
            <TabsTrigger value="overages">Overage Revenue</TabsTrigger>
          </TabsList>

          {/* Conversion Funnel */}
          <TabsContent value="funnel">
            <ConversionFunnel />
          </TabsContent>

          {/* Email Monitoring */}
          <TabsContent value="emails">
            <EmailMonitoringTab />
          </TabsContent>

          {/* Vendor Management */}
          <TabsContent value="vendors">
            <VendorManagementTab />
          </TabsContent>

          {/* Add-on Sales */}
          <TabsContent value="addons">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add-on Purchases</CardTitle>
                <CardDescription>{data.addonSales.totalSales} total transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {data.addonSales.records.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No add-on sales yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Add-on</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.addonSales.records.map((r: any) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.addons?.name ?? "—"}</TableCell>
                          <TableCell className="capitalize">{r.addons?.category ?? "—"}</TableCell>
                          <TableCell>{r.quantity}</TableCell>
                          <TableCell>{formatCurrency(r.amount_cents)}</TableCell>
                          <TableCell><StatusBadge status={r.status} /></TableCell>
                          <TableCell className="text-muted-foreground text-sm">{formatDate(r.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referral Metrics */}
          <TabsContent value="referrals">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Referral Codes</CardTitle>
                  <CardDescription>{data.referrals.totalCodes} codes generated</CardDescription>
                </CardHeader>
                <CardContent>
                  {data.referrals.codes.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No referral codes generated yet</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Code</TableHead>
                          <TableHead>Reward</TableHead>
                          <TableHead>Uses</TableHead>
                          <TableHead>Max Uses</TableHead>
                          <TableHead>Active</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.referrals.codes.map((c: any) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-mono font-medium">{c.code}</TableCell>
                            <TableCell>{c.reward_credits} credits</TableCell>
                            <TableCell>{c.uses_count}</TableCell>
                            <TableCell>{c.max_uses ?? "∞"}</TableCell>
                            <TableCell>
                              <Badge variant={c.is_active ? "default" : "secondary"}>
                                {c.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-sm">{formatDate(c.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Redemptions</CardTitle>
                  <CardDescription>{data.referrals.totalRedemptions} total — {data.referrals.totalCreditsAwarded.toLocaleString()} credits awarded</CardDescription>
                </CardHeader>
                <CardContent>
                  {data.referrals.redemptions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No redemptions yet</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Referrer</TableHead>
                          <TableHead>Referred</TableHead>
                          <TableHead>Credits</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.referrals.redemptions.map((r: any) => (
                          <TableRow key={r.id}>
                            <TableCell className="font-mono text-xs">{r.referrer_id.slice(0, 8)}…</TableCell>
                            <TableCell className="font-mono text-xs">{r.referred_id.slice(0, 8)}…</TableCell>
                            <TableCell>{r.credits_awarded}</TableCell>
                            <TableCell><StatusBadge status={r.status} /></TableCell>
                            <TableCell className="text-muted-foreground text-sm">{formatDate(r.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Overage Revenue */}
          <TabsContent value="overages">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Usage Overages</CardTitle>
                <CardDescription>{data.overages.totalRecords} records — {formatCurrency(data.overages.totalRevenue)} total revenue</CardDescription>
              </CardHeader>
              <CardContent>
                {data.overages.records.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No overage records yet</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Feature</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Rate</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Period</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.overages.records.map((o: any) => (
                        <TableRow key={o.id}>
                          <TableCell className="capitalize">{o.feature.replace(/_/g, " ")}</TableCell>
                          <TableCell>{o.overage_quantity}</TableCell>
                          <TableCell>{formatCurrency(o.rate_cents)}</TableCell>
                          <TableCell className="font-medium">{formatCurrency(o.total_cents)}</TableCell>
                          <TableCell><StatusBadge status={o.status} /></TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {formatDate(o.billing_period_start)} – {formatDate(o.billing_period_end)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
