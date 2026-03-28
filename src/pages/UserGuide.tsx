import { motion } from "framer-motion";
import {
  FileText, BarChart3, Wand2, Tags, Upload, History, Sparkles,
  ArrowRight, MousePointerClick, Copy, Trash2, BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import useDocumentHead from "@/hooks/use-document-head";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };

const toolGuides = [
  {
    icon: FileText,
    title: "Summarize",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    steps: [
      "Paste text or upload a document (.txt, .md, .csv, .json, .pdf — max 5 MB)",
      "Click Run to generate a concise summary",
      "Review the summary paragraph and key takeaway bullets",
      "Use the copy button to grab the summary for use elsewhere",
    ],
    tips: ["Longer texts produce better summaries — aim for at least 200 words", "Word count and estimated reading time appear in the results header"],
  },
  {
    icon: BarChart3,
    title: "Sentiment Analysis",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    steps: [
      "Paste customer feedback, reviews, emails, or any text",
      "Click Run to analyse tone and emotion",
      "Check the overall sentiment rating and confidence score",
      "Explore the emotion breakdown bars and highlighted key phrases",
    ],
    tips: ["Works best with natural language — conversational or opinion-heavy text", "Key phrases are colour-coded by positive, neutral, or negative sentiment"],
  },
  {
    icon: Wand2,
    title: "Generate",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    steps: [
      "Type a prompt describing the content you need (e.g. 'product description for a quantum SaaS')",
      "Optionally paste reference material or drop a file for context",
      "Click Run and wait for the AI to generate polished content",
      "Copy the result — it supports Markdown formatting",
    ],
    tips: ["Be specific in your prompt for better results", "Adding context or reference text significantly improves output quality"],
  },
  {
    icon: Tags,
    title: "Entity Extraction",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    steps: [
      "Paste an article, report, or any text containing names, places, and terms",
      "Click Run to extract named entities",
      "Browse entities organised by type — people, organisations, locations, dates, and more",
      "Each entity includes a brief context snippet showing where it appeared",
    ],
    tips: ["Great for quickly scanning long documents for key names and references", "Entity types are colour-coded for easy visual scanning"],
  },
];

const featureHighlights = [
  {
    icon: Upload,
    title: "Drag & Drop Upload",
    description: "Drop .txt, .md, .csv, .json, .xml, .html, or .pdf files directly onto the input area. Files are limited to 5 MB.",
  },
  {
    icon: History,
    title: "Analysis History",
    description: "Every analysis is automatically saved to the sidebar. Click any past result to reload it instantly, or delete entries you no longer need.",
  },
  {
    icon: Copy,
    title: "One-Click Copy",
    description: "Copy summaries, generated content, or entity lists to your clipboard with a single click.",
  },
  {
    icon: Trash2,
    title: "History Management",
    description: "Hover over any history entry to reveal the delete button. Your history is private — only you can see your saved analyses.",
  },
];

export default function UserGuide() {
  useDocumentHead({ title: "User Guide | QUANTUS V2+ Lab", description: "Learn how to use the AI Text Lab — summarization, sentiment analysis, content generation, and entity extraction." });

  return (
    <div className="min-h-screen bg-background pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-quantum-purple/10 border border-quantum-purple/20 text-quantum-purple text-xs font-medium mb-4">
            <BookOpen size={12} />
            User Guide
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4" style={{ lineHeight: 1.1 }}>
            AI Text Lab Guide
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-balance text-lg">
            Everything you need to know to get the most out of QUANTUS V2+'s text intelligence tools.
          </p>
          <div className="mt-6">
            <Link to="/nlp">
              <Button className="bg-quantum-purple text-white hover:bg-quantum-purple/90 gap-2">
                Open AI Lab <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Quick Start */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="mb-20"
        >
          <motion.h2 variants={fadeUp} className="text-2xl font-bold text-foreground mb-6">
            Quick Start
          </motion.h2>
          <motion.div variants={fadeUp} className="bg-card border border-border rounded-xl p-6 space-y-4">
            {[
              { step: 1, text: "Navigate to the AI Lab from the top navigation bar or click the button above" },
              { step: 2, text: "Choose a tool — Summarize, Sentiment, Generate, or Entities" },
              { step: 3, text: "Paste text or drag-and-drop a file into the input area" },
              { step: 4, text: "Click Run and review your results" },
              { step: 5, text: "Results are automatically saved to the history sidebar for later access" },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-4">
                <span className="shrink-0 w-8 h-8 rounded-full bg-quantum-purple/15 text-quantum-purple text-sm font-bold flex items-center justify-center">
                  {item.step}
                </span>
                <p className="text-foreground/90 pt-1">{item.text}</p>
              </div>
            ))}
          </motion.div>
        </motion.section>

        {/* Tool Guides */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={stagger}
          className="mb-20"
        >
          <motion.h2 variants={fadeUp} className="text-2xl font-bold text-foreground mb-8">
            Tool Guides
          </motion.h2>
          <div className="space-y-6">
            {toolGuides.map((tool) => (
              <motion.div
                key={tool.title}
                variants={fadeUp}
                className="bg-card border border-border rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-lg ${tool.bg} flex items-center justify-center`}>
                    <tool.icon size={20} className={tool.color} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{tool.title}</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Steps */}
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">How to use</p>
                    <ol className="space-y-2.5">
                      {tool.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-foreground/85">
                          <span className="shrink-0 w-5 h-5 rounded-full bg-secondary text-muted-foreground text-[10px] font-bold flex items-center justify-center mt-0.5">
                            {i + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Tips */}
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-3">Tips</p>
                    <ul className="space-y-2.5">
                      {tool.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Sparkles size={12} className={`${tool.color} mt-1 shrink-0`} />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Features */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="mb-20"
        >
          <motion.h2 variants={fadeUp} className="text-2xl font-bold text-foreground mb-8">
            Features
          </motion.h2>
          <motion.div variants={stagger} className="grid sm:grid-cols-2 gap-4">
            {featureHighlights.map((feat) => (
              <motion.div
                key={feat.title}
                variants={fadeUp}
                className="bg-card border border-border rounded-xl p-5 flex items-start gap-4"
              >
                <div className="w-9 h-9 rounded-lg bg-quantum-purple/10 flex items-center justify-center shrink-0">
                  <feat.icon size={18} className="text-quantum-purple" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-1">{feat.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feat.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Supported File Types */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="mb-20"
        >
          <motion.h2 variants={fadeUp} className="text-2xl font-bold text-foreground mb-6">
            Supported File Types
          </motion.h2>
          <motion.div variants={fadeUp} className="bg-card border border-border rounded-xl p-6">
            <div className="flex flex-wrap gap-2">
              {[".txt", ".md", ".csv", ".json", ".xml", ".html", ".pdf"].map((ext) => (
                <Badge key={ext} variant="outline" className="text-sm px-3 py-1 font-mono">
                  {ext}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Maximum file size: <span className="text-foreground font-medium">5 MB</span>. 
              Drag and drop files directly onto the input area, or click the upload button.
            </p>
          </motion.div>
        </motion.section>

        {/* FAQ */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
        >
          <motion.h2 variants={fadeUp} className="text-2xl font-bold text-foreground mb-6">
            Frequently Asked Questions
          </motion.h2>
          <motion.div variants={stagger} className="space-y-4">
            {[
              { q: "Is my data private?", a: "Yes. Your analysis history is tied to your account and protected by row-level security. No one else can access your saved results." },
              { q: "What happens if I hit a rate limit?", a: "You'll see a friendly message asking you to wait. Rate limits reset quickly — just try again after a short pause." },
              { q: "Can I use the AI Lab on mobile?", a: "Absolutely. The interface is fully responsive. The history sidebar collapses to icons on smaller screens." },
              { q: "How accurate is the sentiment analysis?", a: "The AI provides a confidence score with every analysis. For best results, use clear, natural-language text — conversational or opinion-heavy content works best." },
              { q: "Can I delete my analysis history?", a: "Yes. Hover over any entry in the history sidebar and click the trash icon to remove it permanently." },
            ].map((faq, i) => (
              <motion.div key={i} variants={fadeUp} className="bg-card border border-border rounded-xl p-5">
                <h4 className="text-sm font-semibold text-foreground mb-2">{faq.q}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
}
