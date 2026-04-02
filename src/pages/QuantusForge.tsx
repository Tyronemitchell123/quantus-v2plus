import { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe, Layout, Layers, Paintbrush, Rocket, Plus, Settings, Eye,
  Code2, Smartphone, Monitor, ArrowUpRight, Search, Sparkles, CheckCircle2,
  Clock, FileCode2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import useDocumentHead from "@/hooks/use-document-head";
import { toast } from "sonner";

/* ── Template data ───────────────────────────── */
const templates = [
  { id: "sovereign-portfolio", name: "Sovereign Portfolio", category: "UHNW Personal", pages: 7, description: "Black-gold personal brand site with cinematic hero", status: "ready" },
  { id: "family-office", name: "Family Office", category: "Finance", pages: 12, description: "Private wealth dashboard with gated access portal", status: "ready" },
  { id: "aviation-charter", name: "Aviation Charter", category: "Aviation", pages: 9, description: "Fleet showcase with real-time availability integration", status: "ready" },
  { id: "medical-practice", name: "Longevity Clinic", category: "Medical", pages: 11, description: "Practitioner profiles, treatment menus, HIPAA-compliant intake", status: "ready" },
  { id: "hospitality-venue", name: "Hospitality Venue", category: "Hospitality", pages: 8, description: "Property showcase with BMS-calibrated booking flow", status: "ready" },
  { id: "legal-firm", name: "Sovereign Legal", category: "Legal", pages: 6, description: "Minimalist authority site with encrypted consultation booking", status: "coming" },
];

const existingSites = [
  { id: "1", name: "quantus-v2plus.lovable.app", template: "Sovereign Portfolio", status: "live", lastEdited: "2 hours ago", pages: 7, performance: 96 },
];

const QuantusForge = () => {
  useDocumentHead({ title: "Quantus Forge — Website Engine", description: "The sovereign website engine module for building cinematic digital properties." });

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [siteName, setSiteName] = useState("");
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  const handleCreateSite = () => {
    if (!selectedTemplate || !siteName.trim()) {
      toast.error("Select a template and enter a site name");
      return;
    }
    toast.success(`Site "${siteName}" created with ${templates.find(t => t.id === selectedTemplate)?.name} template`);
    setSiteName("");
    setSelectedTemplate(null);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopBar onMobileMenuToggle={() => {}} notifications={[]} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-semibold text-foreground">Quantus Forge</h1>
                <p className="text-xs text-muted-foreground tracking-wider uppercase">Sovereign Website Engine — Build & Manage Digital Properties</p>
              </div>
            </div>
          </motion.div>

          <Tabs defaultValue="sites" className="space-y-4">
            <TabsList className="bg-card/60 border border-border/50">
              <TabsTrigger value="sites" className="text-xs">My Sites</TabsTrigger>
              <TabsTrigger value="create" className="text-xs">Create New</TabsTrigger>
              <TabsTrigger value="templates" className="text-xs">Template Gallery</TabsTrigger>
            </TabsList>

            {/* Active Sites */}
            <TabsContent value="sites" className="space-y-4">
              {existingSites.length === 0 ? (
                <Card className="bg-card/60 border-border/50">
                  <CardContent className="p-12 text-center">
                    <Globe className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-sm font-medium text-foreground mb-2">No sites yet</h3>
                    <p className="text-xs text-muted-foreground mb-4">Create your first sovereign digital property</p>
                    <Button size="sm" className="gap-2"><Plus className="w-3 h-3" /> Create Site</Button>
                  </CardContent>
                </Card>
              ) : (
                existingSites.map((site, i) => (
                  <motion.div key={site.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-medium text-foreground">{site.name}</h3>
                              <Badge variant="outline" className="text-success border-success/30 text-[9px]">{site.status}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">Template: {site.template} · {site.pages} pages</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs">
                              <Eye className="w-3 h-3" /> Preview
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs">
                              <Paintbrush className="w-3 h-3" /> Edit
                            </Button>
                            <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs">
                              <Settings className="w-3 h-3" /> Settings
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Performance</span>
                            <div className="flex items-center gap-2">
                              <Progress value={site.performance} className="h-1.5 flex-1" />
                              <span className="text-xs font-mono text-foreground">{site.performance}</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Last Edited</span>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" /> {site.lastEdited}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Actions</span>
                            <Button size="sm" variant="outline" className="h-7 text-[10px] gap-1 w-full">
                              <ArrowUpRight className="w-3 h-3" /> Visit Live Site
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </TabsContent>

            {/* Create New Site */}
            <TabsContent value="create">
              <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Create New Sovereign Site
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground">Site Name</label>
                    <Input
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      placeholder="e.g. Meridian Capital Group"
                      className="bg-background border-border/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-muted-foreground">Select Template</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {templates.filter(t => t.status === "ready").map((tmpl) => (
                        <Card
                          key={tmpl.id}
                          className={`cursor-pointer transition-all duration-200 ${
                            selectedTemplate === tmpl.id
                              ? "border-primary bg-primary/5"
                              : "border-border/50 bg-card/40 hover:border-primary/30"
                          }`}
                          onClick={() => setSelectedTemplate(tmpl.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-medium text-foreground">{tmpl.name}</h4>
                              {selectedTemplate === tmpl.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                            </div>
                            <Badge variant="outline" className="text-[9px] mb-2">{tmpl.category}</Badge>
                            <p className="text-xs text-muted-foreground">{tmpl.description}</p>
                            <p className="text-[10px] text-muted-foreground mt-2">{tmpl.pages} pages</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleCreateSite} className="gap-2" disabled={!selectedTemplate || !siteName.trim()}>
                    <Rocket className="w-4 h-4" />
                    Launch Site
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Template Gallery */}
            <TabsContent value="templates">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((tmpl, i) => (
                  <motion.div key={tmpl.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
                    <Card className="bg-card/60 backdrop-blur-sm border-border/50 overflow-hidden">
                      <div className="h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                        <Layout className="w-10 h-10 text-primary/30" />
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-foreground">{tmpl.name}</h3>
                          <Badge variant="outline" className={`text-[9px] ${tmpl.status === "ready" ? "text-success border-success/30" : "text-muted-foreground"}`}>
                            {tmpl.status === "ready" ? "Available" : "Coming Soon"}
                          </Badge>
                        </div>
                        <Badge variant="outline" className="text-[9px] mb-2">{tmpl.category}</Badge>
                        <p className="text-xs text-muted-foreground mb-3">{tmpl.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-muted-foreground">{tmpl.pages} pages</span>
                          <Button size="sm" variant="ghost" className="h-7 text-[10px] gap-1" disabled={tmpl.status !== "ready"}>
                            <Eye className="w-3 h-3" /> Preview
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default QuantusForge;
