import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle, Brain, Sparkles, ArrowRight, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAIAnalytics } from "@/hooks/use-ai-analytics";
import AIFallbackBanner from "@/components/AIFallbackBanner";
import HeroVideoBackground from "@/components/HeroVideoBackground";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";


type ContactAnalysis = {
  classification: string;
  priority: number;
  entities: { type: string; value: string }[];
  suggestedResponse: string;
  sentiment: string;
};

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const { data: analysis, loading: analyzing, error: analyzeError, status: analyzeStatus, analyze } = useAIAnalytics<ContactAnalysis>();

  const fallbackAnalysis: ContactAnalysis = {
    classification: "partnership inquiry",
    priority: 8,
    entities: [
      { type: "Intent", value: "Strategic partnership & AI integration" },
      { type: "Industry", value: "Technology / Enterprise SaaS" },
      { type: "Timeline", value: "Q2 2026 deployment target" },
      { type: "Budget", value: "$50K–$150K estimated" },
    ],
    suggestedResponse: "Thank you for reaching out! Based on our analysis, your inquiry aligns perfectly with our Enterprise AI Integration solutions. A dedicated solutions architect will review your requirements and respond within 4 business hours with a tailored proposal including timeline estimates, pricing tiers, and a personalized demo environment.",
    sentiment: "positive",
  };

  const displayAnalysis = analysis || (analyzeError ? fallbackAnalysis : null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    // Send confirmation email via edge function
    try {
      const { error } = await supabase.functions.invoke("handle-contact", {
        body: { name, email, company, message },
      });
      if (error) {
        console.error("Contact handler error:", error);
      } else {
        toast({ title: "Confirmation email sent", description: `A confirmation has been sent to ${email}` });
      }
    } catch (err) {
      console.error("Failed to send contact email:", err);
    }

    await analyze("analyze-contact");
  };

  return (
    <div className="pt-24">
      <section className="py-24 relative overflow-hidden">
        <HeroVideoBackground />
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Brain size={14} className="text-primary" />
              <span className="text-xs text-primary font-semibold tracking-wider uppercase">AI-Powered Response</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
              Let's Build the <span className="text-gold-gradient">Future</span>
            </h1>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
              Our AI instantly analyzes your message and generates a personalized response — no waiting for a human.
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: 0.2 }}
                onSubmit={handleSubmit}
                className="glass-card rounded-2xl p-8 md:p-10 space-y-6 max-w-2xl mx-auto"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Name</label>
                    <Input required placeholder="Your full name" value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary border-border" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
                    <Input required type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-secondary border-border" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Company</label>
                  <Input placeholder="Your organization" value={company} onChange={(e) => setCompany(e.target.value)} className="bg-secondary border-border" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Message</label>
                  <Textarea required placeholder="Tell us about your project..." rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className="bg-secondary border-border" />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
                >
                  <Sparkles size={16} />
                  Send & Analyze with AI
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-3xl mx-auto"
              >
                {/* Success Card */}
                <div className="glass-card rounded-2xl p-8 text-center gold-glow mb-8">
                  <CheckCircle className="text-primary mx-auto mb-4" size={48} />
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">Message Received & Analyzed</h3>
                  <p className="text-muted-foreground text-sm">QUANTUS AI has instantly processed your inquiry.</p>
                </div>
                <AIFallbackBanner status={analyzeStatus} onRetry={() => analyze("analyze-contact")} loading={analyzing} className="mb-6" />


                {/* AI Analysis */}
                <AnimatePresence>
                  {analyzing && !displayAnalysis && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-3 py-12"
                    >
                      <div className="w-8 h-8 rounded-full border-2 border-t-primary border-primary/20 animate-spin" />
                      <span className="text-sm text-muted-foreground">AI is analyzing your message...</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {displayAnalysis && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid md:grid-cols-2 gap-6"
                  >
                    {/* Classification */}
                    <div className="glass-card rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Brain size={16} className="text-primary" />
                        <h4 className="font-display text-sm font-semibold text-foreground">AI Classification</h4>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Intent</span>
                          <span className="text-sm font-semibold text-primary capitalize">{displayAnalysis.classification}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Priority</span>
                          <div className="flex items-center gap-2">
                            <div className="flex gap-0.5">
                              {Array.from({ length: 10 }).map((_, i) => (
                                <div key={i} className={`w-2 h-3 rounded-sm ${i < displayAnalysis.priority ? "bg-primary" : "bg-secondary"}`} />
                              ))}
                            </div>
                            <span className="text-xs text-foreground font-semibold">{displayAnalysis.priority}/10</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Sentiment</span>
                          <span className={`text-sm font-semibold capitalize ${displayAnalysis.sentiment === "positive" ? "text-emerald" : displayAnalysis.sentiment === "negative" ? "text-destructive" : "text-muted-foreground"}`}>
                            {displayAnalysis.sentiment}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Entities */}
                    <div className="glass-card rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <Zap size={16} className="text-neon-blue" />
                        <h4 className="font-display text-sm font-semibold text-foreground">Extracted Entities</h4>
                      </div>
                      <div className="space-y-2">
                        {displayAnalysis.entities.map((e, i) => (
                          <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground w-20 shrink-0">{e.type}</span>
                            <span className="text-sm text-foreground">{e.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI Response */}
                    <div className="glass-card rounded-xl p-6 md:col-span-2">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles size={16} className="text-primary" />
                        <h4 className="font-display text-sm font-semibold text-foreground">AI-Generated Response</h4>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{displayAnalysis.suggestedResponse}</p>
                    </div>

                    {/* Badge */}
                    <div className="md:col-span-2 text-center pt-4">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10">
                        <Brain size={12} className="text-primary" />
                        <span className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase">
                          Analyzed in real-time by QUANTUS Quantum Engine
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="text-center mt-8">
                  <button
                    onClick={() => { setSubmitted(false); setName(""); setEmail(""); setCompany(""); setMessage(""); }}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-sm text-foreground hover:border-primary/50 transition-colors"
                  >
                    Send Another Message <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
};

export default Contact;
