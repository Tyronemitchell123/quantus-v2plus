import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Shield, Loader2, Globe, Mail, Search, Radar, Plus, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface Vendor {
  id: string;
  name: string;
  company: string;
  email: string | null;
  category: string;
  location: string | null;
  tier: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  specialties: string[];
  credentials: Record<string, unknown>;
}

interface DiscoveredVendor {
  name: string;
  company: string;
  website?: string;
  location?: string;
  description?: string;
}

const CATEGORIES = ["aviation", "medical", "staffing", "hospitality", "logistics", "marine", "legal", "finance", "lifestyle"];

const VendorManagementTab = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [discoveryCategory, setDiscoveryCategory] = useState("aviation");
  const [discoveryRegion, setDiscoveryRegion] = useState("");
  const [discovering, setDiscovering] = useState(false);
  const [discovered, setDiscovered] = useState<DiscoveredVendor[]>([]);
  const [addingVendor, setAddingVendor] = useState<string | null>(null);

  const fetchVendors = async () => {
    const { data, error } = await supabase
      .from("vendors")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setVendors(data as Vendor[]);
    setLoading(false);
  };

  useEffect(() => { fetchVendors(); }, []);

  const updateVendor = async (id: string, updates: Record<string, unknown>) => {
    setActionLoading(id);
    const { error } = await supabase.from("vendors").update(updates).eq("id", id);
    if (error) {
      toast.error("Failed to update vendor");
    } else {
      toast.success("Vendor updated");
      fetchVendors();
    }
    setActionLoading(null);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const runDiscovery = async () => {
    setDiscovering(true);
    setDiscovered([]);
    try {
      const { data, error } = await supabase.functions.invoke("vendor-discovery", {
        body: { category: discoveryCategory, region: discoveryRegion || undefined },
      });
      if (error) throw error;
      setDiscovered(data?.data?.suggestions || []);
      if ((data?.data?.suggestions || []).length === 0) {
        toast.info("No vendors discovered for this category/region.");
      } else {
        toast.success(`Found ${data.data.suggestions.length} potential vendors`);
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Discovery failed");
    }
    setDiscovering(false);
  };

  const addDiscoveredVendor = async (v: DiscoveredVendor) => {
    setAddingVendor(v.name);
    const { error } = await supabase.from("vendors").insert({
      name: v.name,
      company: v.company || v.name,
      category: discoveryCategory,
      website: v.website || null,
      location: v.location || null,
      description: v.description || null,
      is_active: false,
      is_verified: false,
      tier: "standard",
      metadata: { source: "ai_discovery", discovered_at: new Date().toISOString() },
    } as any);
    if (error) {
      toast.error("Failed to add vendor");
    } else {
      toast.success(`${v.name} added — pending activation`);
      fetchVendors();
      setDiscovered((prev) => prev.filter((d) => d.name !== v.name));
    }
    setAddingVendor(null);
  };

  return (
    <div className="space-y-6">
      {/* AI Discovery Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Radar className="w-5 h-5 text-primary" /> AI Vendor Discovery</CardTitle>
          <CardDescription>Use Firecrawl to automatically find vendors from industry directories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</label>
              <Select value={discoveryCategory} onValueChange={setDiscoveryCategory}>
                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Region (optional)</label>
              <Input
                value={discoveryRegion}
                onChange={(e) => setDiscoveryRegion(e.target.value)}
                placeholder="e.g. London, EMEA"
                className="w-[180px]"
              />
            </div>
            <Button onClick={runDiscovery} disabled={discovering} className="gap-2">
              {discovering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {discovering ? "Scanning…" : "Discover Vendors"}
            </Button>
          </div>

          {discovered.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-foreground">{discovered.length} potential vendors found</p>
              <div className="grid gap-2">
                {discovered.map((d) => (
                  <div key={d.name} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
                    <div>
                      <p className="text-sm font-medium text-foreground">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.website || d.description}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1 text-xs"
                      disabled={addingVendor === d.name}
                      onClick={() => addDiscoveredVendor(d)}
                    >
                      {addingVendor === d.name ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vendor Table */}
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Vendor Management</CardTitle>
        <CardDescription>
          {vendors.length} registered vendor{vendors.length !== 1 ? "s" : ""} — approve, verify, or deactivate
        </CardDescription>
      </CardHeader>
      <CardContent>
        {vendors.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No vendors registered yet. Applications from /partner-with-us and /vendor-register will appear here.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{v.company}</p>
                        <p className="text-xs text-muted-foreground">{v.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {v.email ? (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {v.email}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{v.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        {v.location ? <><Globe className="w-3 h-3" /> {v.location}</> : "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={v.tier === "premium" ? "default" : "secondary"} className="capitalize">
                        {v.tier}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {v.is_verified && (
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">Verified</Badge>
                        )}
                        <Badge variant={v.is_active ? "default" : "destructive"}>
                          {v.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(v.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        {!v.is_verified && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-xs"
                            disabled={actionLoading === v.id}
                            onClick={() => updateVendor(v.id, { is_verified: true, tier: "verified" })}
                          >
                            <Shield className="w-3 h-3" /> Verify
                          </Button>
                        )}
                        {v.is_active ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-xs text-destructive"
                            disabled={actionLoading === v.id}
                            onClick={() => updateVendor(v.id, { is_active: false })}
                          >
                            <XCircle className="w-3 h-3" /> Deactivate
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-xs"
                            disabled={actionLoading === v.id}
                            onClick={() => updateVendor(v.id, { is_active: true })}
                          >
                            <CheckCircle className="w-3 h-3" /> Activate
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VendorManagementTab;
