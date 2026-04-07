import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Radar, Plus } from "lucide-react";
import { toast } from "sonner";

interface DiscoveredVendor {
  name: string;
  company: string;
  website?: string;
  location?: string;
  description?: string;
}

const CATEGORIES = ["aviation", "medical", "staffing", "hospitality", "logistics", "marine", "legal", "finance", "lifestyle"];

const VendorDiscoveryPanel = () => {
  const [discoveryCategory, setDiscoveryCategory] = useState("aviation");
  const [discoveryRegion, setDiscoveryRegion] = useState("");
  const [discovering, setDiscovering] = useState(false);
  const [discovered, setDiscovered] = useState<DiscoveredVendor[]>([]);
  const [addingVendor, setAddingVendor] = useState<string | null>(null);

  const runDiscovery = async () => {
    setDiscovering(true);
    setDiscovered([]);
    try {
      const { data, error } = await supabase.functions.invoke("vendor-discovery", {
        body: { category: discoveryCategory, region: discoveryRegion || undefined },
      });
      if (error) throw error;
      const suggestions = data?.data?.suggestions || [];
      setDiscovered(suggestions);
      if (suggestions.length === 0) {
        toast.info("No vendors discovered for this category/region.");
      } else {
        toast.success(`Found ${suggestions.length} potential vendors`);
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
      setDiscovered((prev) => prev.filter((d) => d.name !== v.name));
    }
    setAddingVendor(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Radar className="w-5 h-5 text-primary" /> AI Vendor Discovery
        </CardTitle>
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
  );
};

export default VendorDiscoveryPanel;
