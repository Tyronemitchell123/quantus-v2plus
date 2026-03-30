import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Wand2, Tags, Loader2, ArrowRight, Copy, Check, Sparkles, BarChart3,
  Upload, X, File,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import ReactMarkdown from "react-markdown";
import useDocumentHead from "@/hooks/use-document-head";
import NLPHistorySidebar, { type HistoryEntry } from "@/components/nlp/NLPHistorySidebar";
import UpsellBanner from "@/components/UpsellBanner";
import { useUsageTracking } from "@/hooks/use-usage-tracking";
import { useSubscription } from "@/hooks/use-subscription";

type Tool = "summarize" | "sentiment" | "generate" | "extract-entities";

const tools: { id: Tool; label: string; icon: any; description: string }[] = [
  { id: "summarize", label: "Summarize", icon: FileText, description: "Condense long text into key points" },
  { id: "sentiment", label: "Sentiment", icon: BarChart3, description: "Analyse tone, emotion & key phrases" },
  { id: "generate", label: "Generate", icon: Wand2, description: "Create content from a prompt" },
  { id: "extract-entities", label: "Entities", icon: Tags, description: "Extract people, places & things" },
];

const sentimentColors: Record<string, string> = {
  very_positive: "text-emerald-400",
  positive: "text-emerald-300",
  neutral: "text-muted-foreground",
  negative: "text-orange-400",
  very_negative: "text-destructive",
};

const entityTypeColors: Record<string, string> = {
  person: "bg-blue-500/20 text-blue-300",
  organization: "bg-purple-500/20 text-purple-300",
  location: "bg-emerald-500/20 text-emerald-300",
  date: "bg-yellow-500/20 text-yellow-300",
  money: "bg-green-500/20 text-green-300",
  product: "bg-pink-500/20 text-pink-300",
  event: "bg-orange-500/20 text-orange-300",
  technology: "bg-cyan-500/20 text-cyan-300",
  other: "bg-muted text-muted-foreground",
};

const ACCEPTED_TYPES = [
  "text/plain", "text/markdown", "text/csv", "text/html",
  "application/json", "application/xml", "text/xml",
  "application/pdf",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function generateTitle(mode: Tool, text: string, prompt?: string): string {
  const source = mode === "generate" ? prompt || text : text;
  const trimmed = source.trim().replace(/\s+/g, " ");
  return trimmed.length > 60 ? trimmed.slice(0, 57) + "…" : trimmed;
}

export default function NLPTools() {
  useDocumentHead({ title: "AI Text Lab | QUANTUS", description: "NLP & LLM-powered text intelligence tools" });
  const { user } = useAuth();
  const [activeTool, setActiveTool] = useState<Tool>("summarize");
  const [text, setText] = useState("");
  const [genPrompt, setGenPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null);
  const [fileLoading, setFileLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // History state
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  // Fetch history on mount
  useEffect(() => {
    if (!user) { setHistoryLoading(false); return; }
    const fetchHistory = async () => {
      setHistoryLoading(true);
      const { data } = await supabase
        .from("nlp_analyses")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      setHistory((data as HistoryEntry[]) || []);
      setHistoryLoading(false);
    };
    fetchHistory();
  }, [user]);

  const saveToHistory = async (mode: Tool, inputText: string, prompt: string | undefined, resultData: any) => {
    if (!user) return;
    const title = generateTitle(mode, inputText, prompt);
    const { data, error } = await supabase
      .from("nlp_analyses")
      .insert({
        user_id: user.id,
        mode,
        input_text: inputText,
        prompt: prompt || null,
        result: resultData,
        title,
      })
      .select()
      .single();
    if (!error && data) {
      setHistory((prev) => [data as HistoryEntry, ...prev]);
      setActiveHistoryId(data.id);
    }
  };

  const deleteFromHistory = async (id: string) => {
    const { error } = await supabase.from("nlp_analyses").delete().eq("id", id);
    if (!error) {
      setHistory((prev) => prev.filter((e) => e.id !== id));
      if (activeHistoryId === id) setActiveHistoryId(null);
      toast({ title: "Deleted", description: "Analysis removed from history." });
    }
  };

  const loadFromHistory = (entry: HistoryEntry) => {
    setActiveTool(entry.mode as Tool);
    setText(entry.input_text);
    setGenPrompt(entry.prompt || "");
    setResult(entry.result);
    setActiveHistoryId(entry.id);
    setUploadedFile(null);
  };

  const processFile = useCallback(async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(txt|md|csv|json|xml|html|pdf)$/i)) {
      toast({ title: "Unsupported file type", description: "Please upload a .txt, .md, .csv, .json, .xml, .html, or .pdf file.", variant: "destructive" });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({ title: "File too large", description: "Maximum file size is 5 MB.", variant: "destructive" });
      return;
    }
    setFileLoading(true);
    try {
      const content = await file.text();
      setText(content);
      setUploadedFile({ name: file.name, size: file.size });
      toast({ title: "File loaded", description: `${file.name} ready for analysis` });
    } catch {
      toast({ title: "Failed to read file", description: "Could not read the file contents.", variant: "destructive" });
    } finally {
      setFileLoading(false);
    }
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [processFile]);

  const clearFile = () => {
    setUploadedFile(null);
    setText("");
  };

  const run = async () => {
    if (activeTool === "generate" ? !genPrompt.trim() : !text.trim()) return;
    setLoading(true);
    setResult(null);
    setActiveHistoryId(null);
    try {
      const { data, error } = await supabase.functions.invoke("nlp-tools", {
        body: {
          mode: activeTool,
          text: text.trim(),
          prompt: genPrompt.trim() || undefined,
        },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: "Analysis failed", description: "Something went wrong. Please try again.", variant: "destructive" });
        return;
      }
      const resultData = data?.data || data;
      setResult(resultData);
      // Save to history
      await saveToHistory(activeTool, text.trim(), genPrompt.trim() || undefined, resultData);
    } catch (e: any) {
      const status = e?.context?.status || e?.status;
      const msg =
        status === 429 ? "Rate limit reached — please wait a moment and try again." :
        status === 402 ? "AI credits exhausted. Please add credits to continue." :
        "Something went wrong. Please try again.";
      toast({ title: "Analysis failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (t: string) => {
    navigator.clipboard.writeText(t);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cardV = { hidden: { opacity: 0, y: 16, filter: "blur(4px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5 } } };
  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

  return (
    <div className="min-h-screen bg-background pt-16 flex">
      {/* Sidebar */}
      <NLPHistorySidebar
        history={history}
        loading={historyLoading}
        activeId={activeHistoryId}
        onSelect={loadFromHistory}
        onDelete={deleteFromHistory}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0 py-8 px-4 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <NLPUpsell />
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-quantum-purple/10 border border-quantum-purple/20 text-quantum-purple text-xs font-medium mb-4">
              <Sparkles size={12} />
              Powered by Quantum NLP
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3" style={{ lineHeight: 1.1 }}>
              AI Text Lab
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-balance">
              Summarise, analyse sentiment, generate content, and extract entities — all with a single interface.
            </p>
          </motion.div>

          {/* Tool Tabs */}
          <Tabs value={activeTool} onValueChange={(v) => { setActiveTool(v as Tool); setResult(null); setActiveHistoryId(null); }}>
            <TabsList className="grid grid-cols-4 w-full max-w-lg mx-auto mb-8 bg-secondary/50">
              {tools.map((t) => (
                <TabsTrigger key={t.id} value={t.id} className="gap-1.5 text-xs data-[state=active]:bg-quantum-purple/20 data-[state=active]:text-quantum-purple">
                  <t.icon size={14} />
                  <span className="hidden sm:inline">{t.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Input area */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.csv,.json,.xml,.html,.pdf"
              className="hidden"
              onChange={handleFileInput}
            />
            <motion.div layout className="bg-card border border-border rounded-xl p-6 mb-6">
              {activeTool === "generate" ? (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">What would you like to generate?</label>
                  <Input
                    placeholder="e.g. Write a product description for a quantum computing SaaS…"
                    value={genPrompt}
                    onChange={(e) => setGenPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !loading && run()}
                    className="bg-secondary/50 border-border"
                  />
                  <label className="text-sm font-medium text-muted-foreground">Optional context / reference text</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className={`relative transition-colors duration-200 rounded-lg ${dragOver ? "ring-2 ring-quantum-purple/50 bg-quantum-purple/5" : ""}`}
                  >
                    {uploadedFile ? (
                      <div className="flex items-center gap-3 bg-secondary/30 rounded-lg px-4 py-3 mb-2">
                        <File size={16} className="text-quantum-purple shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{uploadedFile.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(uploadedFile.size)}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={clearFile} className="h-7 w-7 p-0 shrink-0">
                          <X size={14} />
                        </Button>
                      </div>
                    ) : null}
                    <Textarea
                      placeholder="Paste reference material or drop a file here…"
                      value={text}
                      onChange={(e) => { setText(e.target.value); if (uploadedFile) setUploadedFile(null); }}
                      rows={4}
                      className="bg-secondary/50 border-border resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">
                      {activeTool === "summarize" && "Paste text to summarise"}
                      {activeTool === "sentiment" && "Paste text for sentiment analysis"}
                      {activeTool === "extract-entities" && "Paste text to extract entities from"}
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={fileLoading}
                      className="text-xs text-muted-foreground hover:text-quantum-purple gap-1.5 h-7"
                    >
                      {fileLoading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                      Upload file
                    </Button>
                  </div>

                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    className="relative"
                  >
                    <AnimatePresence>
                      {dragOver && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-quantum-purple/50 bg-quantum-purple/5 backdrop-blur-sm"
                        >
                          <div className="text-center">
                            <Upload size={24} className="mx-auto mb-2 text-quantum-purple" />
                            <p className="text-sm font-medium text-quantum-purple">Drop file here</p>
                            <p className="text-xs text-muted-foreground">.txt, .md, .csv, .json, .pdf</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {uploadedFile && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="flex items-center gap-3 bg-secondary/30 rounded-lg px-4 py-3 mb-2"
                      >
                        <File size={16} className="text-quantum-purple shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground truncate">{uploadedFile.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(uploadedFile.size)}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={clearFile} className="h-7 w-7 p-0 shrink-0">
                          <X size={14} />
                        </Button>
                      </motion.div>
                    )}

                    <Textarea
                      placeholder={uploadedFile ? "File content loaded — edit below or run analysis" : "Paste or type your text here, or drag & drop a file…"}
                      value={text}
                      onChange={(e) => { setText(e.target.value); if (uploadedFile) setUploadedFile(null); }}
                      rows={6}
                      className="bg-secondary/50 border-border resize-none"
                    />
                  </div>
                </div>
              )}
              <div className="flex justify-end mt-4">
                <Button
                  onClick={run}
                  disabled={loading || (activeTool === "generate" ? !genPrompt.trim() : !text.trim())}
                  className="bg-quantum-purple text-white hover:bg-quantum-purple/90 gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                  {loading ? "Analysing…" : "Run"}
                </Button>
              </div>
            </motion.div>

            {/* Results */}
            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  key={activeTool + "-result" + activeHistoryId}
                  initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-card border border-border rounded-xl p-6"
                >
                  {/* Summarize results */}
                  <TabsContent value="summarize" className="mt-0">
                    {result.summary && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-foreground">Summary</h3>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{result.wordCount} words</span>
                            <span>{result.readingTime}</span>
                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result.summary)} className="h-7 px-2">
                              {copied ? <Check size={12} /> : <Copy size={12} />}
                            </Button>
                          </div>
                        </div>
                        <p className="text-foreground/90 leading-relaxed">{result.summary}</p>
                        {result.keyPoints?.length > 0 && (
                          <motion.ul variants={stagger} initial="hidden" animate="show" className="space-y-2">
                            {result.keyPoints.map((kp: string, i: number) => (
                              <motion.li key={i} variants={cardV} className="flex gap-2 text-sm text-muted-foreground">
                                <span className="text-quantum-purple mt-0.5">•</span>
                                {kp}
                              </motion.li>
                            ))}
                          </motion.ul>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  {/* Sentiment results */}
                  <TabsContent value="sentiment" className="mt-0">
                    {result.overallSentiment && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Overall Sentiment</p>
                            <p className={`text-2xl font-bold capitalize ${sentimentColors[result.overallSentiment] || "text-foreground"}`}>
                              {result.overallSentiment.replace("_", " ")}
                            </p>
                          </div>
                          <div className="ml-auto text-right">
                            <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                            <p className="text-2xl font-bold text-foreground">{result.confidenceScore}%</p>
                          </div>
                        </div>
                        {result.emotions?.length > 0 && (
                          <div className="space-y-3">
                            <p className="text-sm font-medium text-foreground">Emotion Breakdown</p>
                            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-2">
                              {result.emotions.map((e: any, i: number) => (
                                <motion.div key={i} variants={cardV} className="flex items-center gap-3">
                                  <span className="text-sm w-24 text-muted-foreground capitalize">{e.emotion}</span>
                                  <Progress value={e.intensity} className="flex-1 h-2" />
                                  <span className="text-xs text-muted-foreground w-8 text-right">{e.intensity}%</span>
                                </motion.div>
                              ))}
                            </motion.div>
                          </div>
                        )}
                        {result.keyPhrases?.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-foreground">Key Phrases</p>
                            <div className="flex flex-wrap gap-2">
                              {result.keyPhrases.map((kp: any, i: number) => (
                                <Badge key={i} variant="outline" className={kp.sentiment === "positive" ? "border-emerald-500/30 text-emerald-400" : kp.sentiment === "negative" ? "border-destructive/30 text-destructive" : "border-border text-muted-foreground"}>
                                  {kp.phrase}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground italic">{result.summary}</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Generate results */}
                  <TabsContent value="generate" className="mt-0">
                    {result.content && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">{result.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{result.tone}</Badge>
                              <span className="text-xs text-muted-foreground">{result.wordCount} words</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result.content)} className="h-7 px-2">
                            {copied ? <Check size={12} /> : <Copy size={12} />}
                          </Button>
                        </div>
                        <div className="prose prose-sm prose-invert max-w-none text-foreground/90">
                          <ReactMarkdown>{result.content}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  {/* Entity results */}
                  <TabsContent value="extract-entities" className="mt-0">
                    {result.entities && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-foreground">Extracted Entities</h3>
                          <span className="text-xs text-muted-foreground">{result.totalEntities} found</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{result.summary}</p>
                        <motion.div variants={stagger} initial="hidden" animate="show" className="grid gap-2 sm:grid-cols-2">
                          {result.entities.map((e: any, i: number) => (
                            <motion.div key={i} variants={cardV} className="flex items-start gap-3 bg-secondary/30 rounded-lg px-3 py-2.5">
                              <Badge className={`text-[10px] uppercase tracking-wider shrink-0 mt-0.5 ${entityTypeColors[e.type] || entityTypeColors.other}`}>
                                {e.type}
                              </Badge>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{e.text}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2">{e.context}</p>
                              </div>
                            </motion.div>
                          ))}
                        </motion.div>
                      </div>
                    )}
                  </TabsContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
