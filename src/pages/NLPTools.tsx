import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, MessageSquareText, Wand2, Tags, Loader2, ArrowRight, Copy, Check, Sparkles, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import useDocumentHead from "@/hooks/use-document-head";

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

export default function NLPTools() {
  useDocumentHead({ title: "AI Text Lab | QUANTUS", description: "NLP & LLM-powered text intelligence tools" });
  const [activeTool, setActiveTool] = useState<Tool>("summarize");
  const [text, setText] = useState("");
  const [genPrompt, setGenPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const run = async () => {
    if (activeTool === "generate" ? !genPrompt.trim() : !text.trim()) return;
    setLoading(true);
    setResult(null);
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
        toast({ title: "Error", description: data.error, variant: "destructive" });
        return;
      }
      setResult(data?.data || data);
    } catch (e: any) {
      toast({ title: "Failed", description: e.message || "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (t: string) => {
    navigator.clipboard.writeText(t);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cardV = { hidden: { opacity: 0, y: 16, filter: "blur(4px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } };
  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
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
        <Tabs value={activeTool} onValueChange={(v) => { setActiveTool(v as Tool); setResult(null); }}>
          <TabsList className="grid grid-cols-4 w-full max-w-lg mx-auto mb-8 bg-secondary/50">
            {tools.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="gap-1.5 text-xs data-[state=active]:bg-quantum-purple/20 data-[state=active]:text-quantum-purple">
                <t.icon size={14} />
                <span className="hidden sm:inline">{t.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Input area */}
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
                <Textarea
                  placeholder="Paste any reference material here (optional)…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={4}
                  className="bg-secondary/50 border-border resize-none"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground">
                  {activeTool === "summarize" && "Paste text to summarise"}
                  {activeTool === "sentiment" && "Paste text for sentiment analysis"}
                  {activeTool === "extract-entities" && "Paste text to extract entities from"}
                </label>
                <Textarea
                  placeholder="Paste or type your text here…"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={6}
                  className="bg-secondary/50 border-border resize-none"
                />
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
                key={activeTool + "-result"}
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
  );
}
