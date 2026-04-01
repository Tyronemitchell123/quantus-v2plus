import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plane, Zap, RefreshCcw, Send, MessageSquare, DollarSign, Loader2,
} from "lucide-react";

type ToneMode = "aggressive" | "collaborative" | "default";

const AviationNegotiationSandbox = () => {
  const [scrapedPrice, setScrapedPrice] = useState("42000");
  const [competitorPrice, setCompetitorPrice] = useState("38500");
  const [leadName, setLeadName] = useState("Mr. Harrington");
  const [urgency, setUrgency] = useState<"low" | "medium" | "high">("high");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTone, setCurrentTone] = useState<ToneMode>("default");
  const [sent, setSent] = useState(false);

  const bookingValue = Number(scrapedPrice) || 0;
  const commission = bookingValue * 0.1;

  const triggerAgent = async (tone: ToneMode = "default") => {
    setIsGenerating(true);
    setSent(false);
    setCurrentTone(tone);

    const toneModifier =
      tone === "aggressive"
        ? " Be more assertive and create stronger urgency. Use competitor pricing as direct leverage."
        : tone === "collaborative"
          ? " Be warm and consultative. Position as a trusted advisor offering exclusive access."
          : "";

    try {
      const { data, error } = await supabase.functions.invoke("negotiate", {
        body: {
          action: "re-engage",
          sector: "Aviation",
          context_data: {
            origin: "London Luton",
            destination: "Cannes Mandelieu",
            aircraft: "Global 6000",
            price: Number(scrapedPrice),
            currency: "GBP",
            competitor_price: Number(competitorPrice),
          },
          custom_prompt: `Generate a WhatsApp-style message for ${leadName}. Our scraped price: £${Number(scrapedPrice).toLocaleString()}. Competitor price found by Firecrawl: £${Number(competitorPrice).toLocaleString()}. Urgency level: ${urgency}. Use the competitor price as leverage to close.${toneModifier}`,
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

  const handleSendApproval = () => {
    setSent(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ── INPUT PANEL ── */}
      <div className="lg:col-span-1 space-y-4">
        <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Plane className="h-5 w-5 text-blue-400" />
            <h3 className="text-sm font-semibold text-foreground">Simulation Inputs</h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Scraped Price (£)</label>
              <Input
                value={scrapedPrice}
                onChange={(e) => setScrapedPrice(e.target.value)}
                placeholder="42000"
                className="bg-background/50 border-border/30"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Competitor Price (£)</label>
              <Input
                value={competitorPrice}
                onChange={(e) => setCompetitorPrice(e.target.value)}
                placeholder="38500"
                className="bg-background/50 border-border/30"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Lead Name</label>
              <Input
                value={leadName}
                onChange={(e) => setLeadName(e.target.value)}
                placeholder="Mr. Harrington"
                className="bg-background/50 border-border/30"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Urgency Level</label>
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

            <Button
              onClick={() => triggerAgent("default")}
              disabled={isGenerating}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              {isGenerating ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Generating...</>
              ) : (
                <><Zap className="h-4 w-4 mr-2" /> Trigger Agent</>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ── CHAT PREVIEW ── */}
      <div className="lg:col-span-1 space-y-4">
        <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-sm p-5 min-h-[320px] flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="h-5 w-5 text-emerald-400" />
            <h3 className="text-sm font-semibold text-foreground">Live Chat Preview</h3>
            {currentTone !== "default" && (
              <Badge variant="outline" className="text-[10px] ml-auto border-primary/30 text-primary">
                {currentTone}
              </Badge>
            )}
          </div>

          {/* WhatsApp-style chat area */}
          <div className="flex-1 rounded-lg bg-[hsl(var(--background))] p-3 space-y-2 overflow-y-auto" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cpath d=\"M30 0L60 30 30 60 0 30z\" fill=\"none\" stroke=\"%23ffffff08\" /%3E%3C/svg%3E')" }}>
            {generatedMessage ? (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-[85%] ml-auto"
                >
                  <div className="bg-emerald-900/40 border border-emerald-700/30 rounded-xl rounded-tr-sm p-3">
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {generatedMessage}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1.5">
                      <span className="text-[10px] text-muted-foreground">
                        {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {sent && <span className="text-blue-400 text-[10px]">✓✓</span>}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                Click "Trigger Agent" to generate a message
              </div>
            )}
          </div>

          {/* Action buttons */}
          {generatedMessage && !isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-2 mt-3"
            >
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => triggerAgent("aggressive")}
                  className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  <RefreshCcw className="h-3 w-3 mr-1" /> More Aggressive
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => triggerAgent("collaborative")}
                  className="text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                >
                  <RefreshCcw className="h-3 w-3 mr-1" /> More Collaborative
                </Button>
              </div>
              <Button
                size="sm"
                onClick={handleSendApproval}
                disabled={sent}
                className={`text-xs ${
                  sent
                    ? "bg-emerald-600/20 text-emerald-400 border border-emerald-600/30"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                }`}
              >
                {sent ? (
                  <>✓ Sent for Approval</>
                ) : (
                  <><Send className="h-3 w-3 mr-1" /> Send to Client for Approval</>
                )}
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* ── COMMISSION TRACKER ── */}
      <div className="lg:col-span-1 space-y-4">
        <div className="rounded-xl border border-primary/30 bg-gradient-to-b from-primary/5 to-card/60 backdrop-blur-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Potential Commission</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-background/30 border border-border/20">
              <p className="text-xs text-muted-foreground mb-1">Booking Value</p>
              <p className="text-2xl font-bold text-foreground">
                £{bookingValue.toLocaleString()}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-xs text-primary/80 mb-1">Quantus Fee (10%)</p>
              <motion.p
                key={commission}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl font-bold text-primary"
              >
                £{commission.toLocaleString()}
              </motion.p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-2 rounded-lg bg-background/20 border border-border/10">
                <p className="text-[10px] text-muted-foreground">Competitor Delta</p>
                <p className="text-sm font-semibold text-amber-400">
                  £{Math.abs(bookingValue - (Number(competitorPrice) || 0)).toLocaleString()}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-background/20 border border-border/10">
                <p className="text-[10px] text-muted-foreground">Urgency</p>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${
                    urgency === "high"
                      ? "border-red-500/50 text-red-400"
                      : urgency === "medium"
                        ? "border-amber-500/50 text-amber-400"
                        : "border-emerald-500/50 text-emerald-400"
                  }`}
                >
                  {urgency.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {sent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4"
          >
            <p className="text-xs text-emerald-400 font-medium">
              ✓ Message queued for client approval. Commission will be tracked upon booking confirmation.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AviationNegotiationSandbox;
