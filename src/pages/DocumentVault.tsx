import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Search, Shield, PenTool, Clock, CheckCircle2, Sparkles, FolderOpen, Lock, Upload, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import useDocumentHead from "@/hooks/use-document-head";
import VaultUploadZone from "@/components/vault/VaultUploadZone";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatDistanceToNow } from "date-fns";

type DealDocument = {
  id: string;
  title: string;
  deal_id: string;
  document_type: string;
  status: string;
  created_at: string;
  content: string | null;
  fields: any;
  metadata: any;
  signed_at: string | null;
  signed_by: string | null;
};

const templates = [
  { name: "Service Agreement", desc: "Standard service contract with customizable clauses", category: "Contracts" },
  { name: "Non-Disclosure Agreement", desc: "Mutual or one-way NDA with AI clause optimization", category: "Legal" },
  { name: "Statement of Work", desc: "Detailed scope, deliverables, and timeline", category: "Contracts" },
  { name: "Invoice Template", desc: "Branded invoice with auto-calculated line items", category: "Billing" },
  { name: "Memorandum of Understanding", desc: "Partnership terms and intent documentation", category: "Legal" },
  { name: "Commission Schedule", desc: "Rate breakdowns by vertical and tier", category: "Billing" },
];

const DocumentVault = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [generateOpen, setGenerateOpen] = useState(false);
  const [documents, setDocuments] = useState<DealDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useDocumentHead({
    title: "AI Document Vault — Smart Contracts & E-Sign | QUANTUS V2+",
    description: "AI-powered document generation, encrypted storage, and digital e-signature workflow.",
    canonical: "https://quantus-loom.lovable.app/vault",
  });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("deal_documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setDocuments(data);
      setLoading(false);
    };
    load();
  }, [user]);

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
      signed: { label: "Signed", className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
      pending_signature: { label: "Awaiting Signature", className: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Clock },
      draft: { label: "Draft", className: "bg-secondary text-muted-foreground border-border", icon: FileText },
      ai_review: { label: "AI Review", className: "bg-primary/10 text-primary border-primary/20", icon: Sparkles },
    };
    const s = map[status] || map.draft;
    return (
      <Badge variant="outline" className={`text-[10px] gap-1 ${s.className}`}>
        <s.icon size={10} /> {s.label}
      </Badge>
    );
  };

  const filtered = documents.filter(d => d.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalDocs = documents.length;
  const pendingSigs = documents.filter(d => d.status === "pending_signature").length;
  const signedDocs = documents.filter(d => d.status === "signed").length;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopBar />
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                  <FolderOpen size={22} className="text-primary" />
                </div>
                Document Vault
                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary bg-primary/5">ENCRYPTED</Badge>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">AI-generated contracts, encrypted storage, and digital e-signatures.</p>
            </div>
            <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Sparkles size={14} /> Generate Document</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Sparkles size={18} className="text-primary" /> AI Document Generator
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Template</label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Choose a template…" /></SelectTrigger>
                      <SelectContent>
                        {templates.map(t => (
                          <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Deal Reference</label>
                    <Input placeholder="QAI-XXXXXXXX" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Special Instructions</label>
                    <Textarea placeholder="E.g., Include non-compete clause, payment terms net-30…" rows={3} />
                  </div>
                  <Button className="w-full gap-2" onClick={() => setGenerateOpen(false)}>
                    <Sparkles size={14} /> Generate with AI
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Documents", value: String(totalDocs), icon: FileText },
              { label: "Pending Signatures", value: String(pendingSigs), icon: PenTool },
              { label: "Signed", value: String(signedDocs), icon: CheckCircle2 },
              { label: "Templates", value: String(templates.length), icon: Sparkles },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="glass-card border-border/50">
                  <CardContent className="p-4 sm:p-5">
                    <stat.icon size={18} className="text-primary mb-3" />
                    <div className="font-display text-xl sm:text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <Tabs defaultValue="uploads" className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <TabsList className="bg-secondary/50">
                <TabsTrigger value="uploads">File Vault</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="signatures">E-Signatures</TabsTrigger>
              </TabsList>
              <div className="relative w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search documents…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-9 text-sm" />
              </div>
            </div>

            <TabsContent value="uploads">
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Upload size={18} className="text-primary" /> Secure File Vault
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <VaultUploadZone />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-3">
              {loading ? (
                <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                  <Loader2 size={16} className="animate-spin" /> Loading documents…
                </div>
              ) : filtered.length === 0 ? (
                <Card className="glass-card border-border/50 p-8 text-center">
                  <FileText size={24} className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No documents yet. Generate one or upload files to the vault.</p>
                </Card>
              ) : filtered.map((doc, i) => (
                <motion.div key={doc.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                  <Card className="glass-card border-border/50 hover:border-primary/20 transition-all">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="p-2.5 rounded-lg bg-primary/10 shrink-0">
                            <FileText size={18} className="text-primary" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-medium text-foreground truncate">{doc.title}</h3>
                              <Lock size={10} className="text-emerald-400" />
                            </div>
                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                              <span className="text-xs text-muted-foreground font-mono">{doc.deal_id.substring(0, 8)}</span>
                              <Badge variant="outline" className="text-[10px]">{doc.document_type}</Badge>
                              {getStatusBadge(doc.status)}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="templates">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((tpl, i) => (
                  <motion.div key={tpl.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}>
                    <Card className="glass-card border-border/50 hover:border-primary/30 transition-all cursor-pointer group h-full">
                      <CardContent className="p-5 flex flex-col h-full">
                        <Badge variant="outline" className="text-[10px] w-fit mb-3">{tpl.category}</Badge>
                        <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors mb-2">{tpl.name}</h3>
                        <p className="text-xs text-muted-foreground flex-1">{tpl.desc}</p>
                        <Button size="sm" variant="outline" className="mt-4 text-xs gap-1 w-full">
                          <Sparkles size={12} /> Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="signatures">
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PenTool size={18} className="text-primary" /> E-Signature Queue
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {documents.filter(d => d.status === "pending_signature").length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No documents awaiting signature.</p>
                  ) : documents.filter(d => d.status === "pending_signature").map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0 flex-wrap gap-2">
                      <div>
                        <h4 className="text-sm font-medium text-foreground">{doc.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Awaiting signature</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="text-xs gap-1"><PenTool size={12} /> Sign Now</Button>
                      </div>
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

export default DocumentVault;
