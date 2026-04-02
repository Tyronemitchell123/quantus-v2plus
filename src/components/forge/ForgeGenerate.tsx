import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, Layout, CheckCircle2, Rocket, Globe, FileCode2,
  Paintbrush, Layers, ArrowRight, Wand2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const templates = [
  { id: "sovereign-portfolio", name: "Sovereign Portfolio", category: "UHNW Personal", pages: 7, description: "Black-gold personal brand site with cinematic hero" },
  { id: "family-office", name: "Family Office", category: "Finance", pages: 12, description: "Private wealth dashboard with gated access portal" },
  { id: "aviation-charter", name: "Aviation Charter", category: "Aviation", pages: 9, description: "Fleet showcase with real-time availability integration" },
  { id: "longevity-clinic", name: "Longevity Clinic", category: "Medical", pages: 11, description: "Practitioner profiles, treatment menus, HIPAA-compliant intake" },
  { id: "hospitality-venue", name: "Hospitality Venue", category: "Hospitality", pages: 8, description: "Property showcase with BMS-calibrated booking flow" },
  { id: "sovereign-legal", name: "Sovereign Legal", category: "Legal", pages: 6, description: "Minimalist authority site with encrypted consultation booking" },
];

const ForgeGenerate = () => {
  const [siteName, setSiteName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [helixProfile, setHelixProfile] = useState("obsidian-gold");
  const [brief, setBrief] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    if (!selectedTemplate || !siteName.trim()) {
      toast.error("Select a template and enter a site name");
      return;
    }
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      toast.success(`"${siteName}" generated with Helix DNA profile: ${helixProfile}`);
      setSiteName("");
      setSelectedTemplate(null);
      setBrief("");
    }, 2500);
  };

  return (
    <div className="space-y-6">
      {/* AI Brief */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-primary" />
            AI Site Brief
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Site Name</label>
              <Input value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="e.g. Meridian Capital Group" className="bg-background border-border/50" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Helix DNA Profile</label>
              <Select value={helixProfile} onValueChange={setHelixProfile}>
                <SelectTrigger className="bg-background border-border/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="obsidian-gold">Obsidian Gold (Default)</SelectItem>
                  <SelectItem value="arctic-silver">Arctic Silver</SelectItem>
                  <SelectItem value="midnight-sapphire">Midnight Sapphire</SelectItem>
                  <SelectItem value="custom">Custom DNA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Creative Brief (Optional)</label>
            <Textarea value={brief} onChange={(e) => setBrief(e.target.value)} placeholder="Describe the desired aesthetic, key messaging, target audience..." className="bg-background border-border/50 min-h-[80px]" />
          </div>
        </CardContent>
      </Card>

      {/* Template Selection */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Select Sovereign Template</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.map((tmpl, i) => (
            <motion.div key={tmpl.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card
                className={`cursor-pointer transition-all duration-200 overflow-hidden ${
                  selectedTemplate === tmpl.id ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/50 bg-card/40 hover:border-primary/30"
                }`}
                onClick={() => setSelectedTemplate(tmpl.id)}
              >
                <div className="h-24 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <Layout className="w-8 h-8 text-primary/30" />
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-foreground">{tmpl.name}</h4>
                    {selectedTemplate === tmpl.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  </div>
                  <Badge variant="outline" className="text-[9px] mb-2">{tmpl.category}</Badge>
                  <p className="text-xs text-muted-foreground">{tmpl.description}</p>
                  <p className="text-[10px] text-muted-foreground mt-2">{tmpl.pages} pages · Helix-aligned</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Generation Pipeline */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground">Generation Pipeline</h3>
            <Badge variant="outline" className="text-[9px]">Forge.Adapter → Helix.DNA → Deploy</Badge>
          </div>
          <div className="flex items-center gap-2 mb-6">
            {["Brief Received", "Helix DNA Applied", "Template Rendered", "Assets Generated", "Deployed"].map((step, i) => (
              <div key={step} className="flex items-center gap-2 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-mono ${
                  generating && i <= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>{i + 1}</div>
                <span className="text-[10px] text-muted-foreground hidden lg:inline">{step}</span>
                {i < 4 && <ArrowRight className="w-3 h-3 text-muted-foreground/30 hidden lg:inline" />}
              </div>
            ))}
          </div>
          <Button onClick={handleGenerate} disabled={!selectedTemplate || !siteName.trim() || generating} className="gap-2">
            {generating ? <span className="animate-spin"><Sparkles className="w-4 h-4" /></span> : <Rocket className="w-4 h-4" />}
            {generating ? "Generating…" : "Launch Site"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgeGenerate;
