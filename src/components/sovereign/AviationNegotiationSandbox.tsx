import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Plane, Zap, RefreshCcw, Send, MessageSquare, DollarSign, Loader2,
  Camera, Clock, Shield, ExternalLink,
} from "lucide-react";

type ToneMode = "urgency" | "relationship" | "default";

const AviationNegotiationSandbox = () => {
  const [targetAsset, setTargetAsset] = useState("Gulfstream G650 - LTN to TEB");
  const [quantusPrice, setQuantusPrice] = useState("42000");
  const [competitorPrice, setCompetitorPrice] = useState("48500");
  const [leadContext, setLeadContext] = useState("Mr. Sterling, ghosted last 3 NYC inquiries.");
  const [urgency, setUrgency] = useState<"low" | "medium" | "high">("high");

  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTone, setCurrentTone] = useState<ToneMode>("default");
  const [sent, setSent] = useState(false);

  // Firecrawl evidence
  const [evidenceScreenshot, setEvidenceScreenshot] = useState<string | null>(null);
  const [isFetchingEvidence, setIsFetchingEvidence] = useState(false);

  const bookingValue = Number(quantusPrice) || 0;
  const compPrice = Number(competitorPrice) || 0;
  const commission = bookingValue * 0.1;
  const saving = compPrice - bookingValue;

  const fetchCompetitorEvidence = async () => {
    setIsFetchingEvidence(true);
    try {
      const { data, error } = await supabase.functions.invoke("aviation-manifest-scan", {
        body: {
          target_urls: ["https://www.intellijet.co.uk/empty-leg-flights"],
          screenshot: true,
        },
      });
      if (error) throw error;
      if (data?.screenshot) {
        setEvidenceScreenshot(data.screenshot);
      }
    } catch {
      // Silent fail — evidence is supplementary
    } finally {
      setIsFetchingEvidence(false);
    }
  };

  const triggerAgent = async (tone: ToneMode = "default") => {
    setIsGenerating(true);
    setSent(false);
    setCurrentTone(tone);

    const toneModifier =
      tone === "urgency"
        ? " Emphasize the 4-hour booking window. Create extreme scarcity. Mention the aircraft departs regardless."
        : tone === "relationship"
          ? " Emphasize the G650's specific tail quality and cabin configuration. Position as a trusted aviation advisor with insider access."
          : "";

    try {
      // Fetch evidence in parallel
      fetchCompetitorEvidence();

      const { data, error } = await supabase.functions.invoke("negotiate", {
        body: {
          action: "re-engage",
          sector: "Aviation",
          context_data: {
            origin: targetAsset.split(" - ")[1]?.split(" to ")[0] || "London Luton",
            destination: targetAsset.split(" to ")[1] || "Teterboro",
            aircraft: targetAsset.split(" - ")[0] || "Gulfstream G650",
            price: bookingValue,
            currency: "USD",
          },
          custom_prompt: `You are the Quantus Elite Closer. Your tone is 'Calm, Data-Dense, and Scarcity-Driven'. Do not apologize for the price; justify it via the Firecrawl market arbitrage. Focus on the $${saving.toLocaleString()} direct saving.\n\nGenerate a WhatsApp-style message for the following scenario:\n- Asset: ${targetAsset}\n- Our Price: $${bookingValue.toLocaleString()}\n- Competitor Price (Firecrawl verified): $${compPrice.toLocaleString()}\n- Direct Saving: $${saving.toLocaleString()}\n- Lead Context: ${leadContext}\n- Urgency: ${urgency}${toneModifier}\n\nKeep it under 60 words. Never reveal you are AI. Address the client by name.`,
        },
      });

      if (error) throw error;
      setGeneratedMessage(data.message || "Unable to generate message.");
    } catch (err: any) {
      setGeneratedMessage(`[Error] ${err.message || "Generation failed. Check your session."}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendWhatsApp = () => {
    setSent(true);
  };

  return (
    <div className="relative">
      {/* ── FLOATING COMMISSION TICKER ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute -top-2 right-0 z-10"
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 backdrop-blur-md shadow-lg shadow-[#D4AF37]/5">
          <DollarSign className="h-3.5 w-3.5 text-[#D4AF37]" />
          <span className="text-[10px] tracking-[0.15em] uppercase text-[#D4AF37]/70 font-medium">Potential Quantus Fee</span>
          <motion.span
            key={commission}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-sm font-bold text-[#D4AF37] font-mono"
          >
            ${commission.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </motion.span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 pt-10">
        {/* ── SCENARIO CARD (The Intel) ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-4 w-4 text-[#D4AF37]" />
              <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-foreground">Scenario Card — Intel</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground mb-1 block">Target Asset</label>
                <Input
                  value={targetAsset}
                  onChange={(e) => setTargetAsset(e.target.value)}
                  className="bg-background/50 border-border/30 font-mono text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground mb-1 block">Quantus Price ($)</label>
                  <Input
                    value={quantusPrice}
                    onChange={(e) => setQuantusPrice(e.target.value)}
                    className="bg-background/50 border-[#D4AF37]/30 text-[#D4AF37] font-mono text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground mb-1 flex items-center gap-1">
                    Competitor Price ($)
                    <span className="text-[8px] text-blue-400">(Firecrawl)</span>
                  </label>
                  <Input
                    value={competitorPrice}
                    onChange={(e) => setCompetitorPrice(e.target.value)}
                    className="bg-background/50 border-border/30 font-mono text-sm text-muted-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground mb-1 block">Lead Context</label>
                <Textarea
                  value={leadContext}
                  onChange={(e) => setLeadContext(e.target.value)}
                  rows={2}
                  className="bg-background/50 border-border/30 text-sm resize-none"
                />
              </div>
              <div>
                <label className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground mb-1.5 block">Urgency Level</label>
                <div className="flex gap-2">
                  {(["low", "medium", "high"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setUrgency(level)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        urgency === level
                          ? level === "high"
                            ? "bg-red-500/20 border-red-500/50 text-red-400"
                            : level === "medium"
                              ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                              : "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                          : "bg-background/30 border-border/20 text-muted-foreground"
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Saving callout */}
              {saving > 0 && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#D4AF37]/5 border border-[#D4AF37]/20">
                  <Zap className="h-3.5 w-3.5 text-[#D4AF37]" />
                  <span className="text-xs text-[#D4AF37]">
                    Client saves <span className="font-bold font-mono">${saving.toLocaleString()}</span> vs competitor
                  </span>
                </div>
              )}

              <Button
                onClick={() => triggerAgent("default")}
                disabled={isGenerating}
                className="w-full font-semibold border border-[#D4AF37]/50 bg-[#D4AF37]/15 text-[#D4AF37] hover:bg-[#D4AF37]/25 hover:text-[#D4AF37]"
              >
                {isGenerating ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Running Agent...</>
                ) : (
                  <><Zap className="h-4 w-4 mr-2" /> Trigger Agent</>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* ── LIVE CHAT + EVIDENCE ── */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm p-5 min-h-[420px] flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-foreground">Live Draft Preview</h3>
              {currentTone !== "default" && (
                <Badge variant="outline" className="text-[9px] ml-auto border-[#D4AF37]/30 text-[#D4AF37]">
                  {currentTone === "urgency" ? "⚡ Higher Urgency" : "🤝 Relationship-First"}
                </Badge>
              )}
            </div>

            {/* Chat area */}
            <div
              className="flex-1 rounded-lg bg-[hsl(var(--background))] p-4 space-y-3 overflow-y-auto"
              style={{
                backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M30 0L60 30 30 60 0 30z\" fill=\"none\" stroke=\"%23ffffff05\" /%3E%3C/svg%3E')",
              }}
            >
              {generatedMessage ? (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    {/* AI message bubble — monospace editorial */}
                    <div className="max-w-[88%] ml-auto">
                      <div className="bg-emerald-900/40 border border-emerald-700/30 rounded-xl rounded-tr-sm p-4">
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-mono">
                          {generatedMessage}
                        </p>
                        <div className="flex items-center justify-end gap-1.5 mt-2">
                          <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {sent && <span className="text-blue-400 text-[10px]">✓✓</span>}
                        </div>
                      </div>
                    </div>

                    {/* Firecrawl evidence attachment */}
                    {(evidenceScreenshot || isFetchingEvidence) && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="max-w-[88%] ml-auto"
                      >
                        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Camera className="h-3 w-3 text-blue-400" />
                            <span className="text-[9px] tracking-[0.15em] uppercase text-blue-400 font-medium">
                              Firecrawl Evidence — Competitor Price Verification
                            </span>
                          </div>
                          {isFetchingEvidence ? (
                            <div className="h-20 rounded bg-background/30 flex items-center justify-center">
                              <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                              <span className="text-[10px] text-muted-foreground ml-2">Capturing screenshot...</span>
                            </div>
                          ) : evidenceScreenshot ? (
                            <img
                              src={`data:image/png;base64,${evidenceScreenshot}`}
                              alt="Competitor price evidence"
                              className="rounded border border-border/20 max-h-32 w-full object-cover"
                            />
                          ) : null}
                          <div className="flex items-center gap-1 mt-1.5">
                            <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />
                            <span className="text-[9px] text-muted-foreground font-mono">
                              intellijet.co.uk — ${compPrice.toLocaleString()} verified
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                  <Plane className="h-8 w-8 opacity-20" />
                  <span className="text-xs">Configure scenario and trigger the agent</span>
                </div>
              )}
            </div>

            {/* ── ACTION BAR — Cyber-Gold ── */}
            {generatedMessage && !isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-2 mt-4"
              >
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => triggerAgent("urgency")}
                    className="text-xs border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 font-medium"
                  >
                    <RefreshCcw className="h-3 w-3 mr-1.5" /> Refine: Higher Urgency
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => triggerAgent("relationship")}
                    className="text-xs border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 font-medium"
                  >
                    <RefreshCcw className="h-3 w-3 mr-1.5" /> Refine: Relationship-First
                  </Button>
                </div>
                <Button
                  size="sm"
                  onClick={handleSendWhatsApp}
                  disabled={sent}
                  className={`text-xs font-semibold ${
                    sent
                      ? "bg-emerald-600/20 text-emerald-400 border border-emerald-600/30"
                      : "bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black border-none"
                  }`}
                >
                  {sent ? (
                    <>✓ Queued to Client WhatsApp</>
                  ) : (
                    <><Send className="h-3 w-3 mr-1.5" /> Send to Client WhatsApp</>
                  )}
                </Button>
              </motion.div>
            )}
          </div>

          {/* Sent confirmation */}
          {sent && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-start gap-3"
            >
              <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Send className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-emerald-400 font-medium">Message queued for WhatsApp delivery</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Commission of <span className="text-[#D4AF37] font-mono font-bold">${commission.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span> will be tracked upon booking confirmation.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AviationNegotiationSandbox;
