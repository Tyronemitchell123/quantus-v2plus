import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface ScrapeResults {
  vendors_discovered: number;
  vendors_added: number;
  outreach_drafts: number;
  errors: string[];
}

const AutoScrapePanel = () => {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<ScrapeResults | null>(null);

  const runAutoScrape = async () => {
    setRunning(true);
    setResults(null);
    try {
      const { data, error } = await supabase.functions.invoke("auto-scrape-vendors");
      if (error) throw error;
      setResults(data);
      toast.success(`Auto-scrape complete: ${data?.vendors_added || 0} vendors added`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Auto-scrape failed");
    }
    setRunning(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" /> Auto-Scrape Cron
        </CardTitle>
        <CardDescription>
          Run the weekly vendor discovery pipeline on demand — searches across aviation, lifestyle, medical, hospitality, and marine verticals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={runAutoScrape} disabled={running} className="gap-2">
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {running ? "Running Pipeline…" : "Run Auto-Scrape Now"}
        </Button>

        {results && (
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="p-4 rounded-lg border border-border bg-card text-center">
              <p className="text-2xl font-bold text-foreground">{results.vendors_discovered}</p>
              <p className="text-xs text-muted-foreground mt-1">Discovered</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card text-center">
              <p className="text-2xl font-bold text-primary">{results.vendors_added}</p>
              <p className="text-xs text-muted-foreground mt-1">Added</p>
            </div>
            <div className="p-4 rounded-lg border border-border bg-card text-center">
              <p className="text-2xl font-bold text-foreground">{results.outreach_drafts}</p>
              <p className="text-xs text-muted-foreground mt-1">Outreach Drafts</p>
            </div>
          </div>
        )}

        {results?.errors && results.errors.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-destructive flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" /> {results.errors.length} error{results.errors.length !== 1 ? "s" : ""}
            </p>
            {results.errors.map((e, i) => (
              <p key={i} className="text-xs text-muted-foreground pl-5">• {e}</p>
            ))}
          </div>
        )}

        {results && results.errors.length === 0 && (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <CheckCircle className="w-4 h-4 text-primary" /> Pipeline completed without errors
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AutoScrapePanel;
