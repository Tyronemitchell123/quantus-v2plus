import { useState, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModuleData } from "@/hooks/use-module-data";
import ModuleLiveDeals from "@/components/modules/ModuleLiveDeals";
import { Link } from "react-router-dom";
import {
  Scale, ArrowRight, Sparkles, Star, MapPin, ChevronRight,
  FileText, Gavel, BookOpen, ShieldCheck,
} from "lucide-react";

const categories = [
  { id: "corporate", label: "Corporate Law", icon: "🏛", count: 15 },
  { id: "ip", label: "IP & Patents", icon: "💡", count: 9 },
  { id: "tax", label: "Tax & Trust", icon: "📊", count: 12 },
  { id: "litigation", label: "Litigation", icon: "⚖", count: 7 },
  { id: "immigration", label: "Immigration", icon: "🌐", count: 6 },
  { id: "arbitration", label: "Arbitration", icon: "🤝", count: 4 },
  { id: "notary", label: "Notary & Apostille", icon: "📜", count: 8 },
  { id: "compliance", label: "Compliance & AML", icon: "🛡", count: 10 },
];

const firmData: Record<string, Array<{
  name: string; jurisdiction: string; specialty: string;
  partners: number; founded: number; languages: string;
  vendorRating: number; retainerRange: string;
  hourlyRate: string; vendorNotes: string[];
}>> = {
  "corporate": [
    { name: "Harcourt Chambers LLP", jurisdiction: "England & Wales", specialty: "M&A, Private Equity", partners: 42, founded: 1897, languages: "EN, FR, DE", vendorRating: 97, retainerRange: "£50K–£250K", hourlyRate: "£850/hr", vendorNotes: ["Magic Circle alumni partners", "UHNW family office specialist"] },
    { name: "Meridian Legal Group", jurisdiction: "Multi-jurisdictional", specialty: "Cross-border M&A", partners: 28, founded: 2008, languages: "EN, AR, ZH", vendorRating: 94, retainerRange: "£30K–£150K", hourlyRate: "£650/hr", vendorNotes: ["GCC & Asia-Pacific coverage", "Crypto-asset structuring"] },
  ],
  "tax": [
    { name: "Sterling Tax Advisors", jurisdiction: "UK, Channel Islands, BVI", specialty: "Trust structuring, Estate planning", partners: 18, founded: 1985, languages: "EN, FR", vendorRating: 96, retainerRange: "£25K–£100K", hourlyRate: "£700/hr", vendorNotes: ["Non-dom specialist", "Multi-generational wealth planning"] },
  ],
  "ip": [
    { name: "Nexus IP Partners", jurisdiction: "EU, US, UK", specialty: "Patent prosecution, Brand protection", partners: 15, founded: 2012, languages: "EN, DE, JP", vendorRating: 92, retainerRange: "£15K–£80K", hourlyRate: "£550/hr", vendorNotes: ["Tech & pharma focus", "Opposition & litigation capability"] },
  ],
};

const LegalModule = forwardRef<HTMLDivElement>((_, ref) => {
  const [activeCat, setActiveCat] = useState("corporate");
  const { deals } = useModuleData("legal");
  const items = firmData[activeCat] || [];

  return (
    <div ref={ref} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Scale size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-medium">Legal</h2>
            <p className="text-xs text-muted-foreground">Law firms • IP • Tax & Trust • Compliance</p>
          </div>
        </div>
        <Link to="/intake" className="flex items-center gap-1 text-xs text-primary hover:underline">
          New Request <ArrowRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-3 glass-card p-3 space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 px-2">Practice Areas</p>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setActiveCat(c.id)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded transition-colors ${activeCat === c.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"}`}>
              <span className="flex items-center gap-2"><span>{c.icon}</span>{c.label}</span>
              <span className="text-[10px] opacity-60">{c.count}</span>
            </button>
          ))}
        </div>

        <div className="lg:col-span-5 space-y-3">
          <AnimatePresence mode="wait">
            <motion.div key={activeCat} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              {items.length === 0 ? (
                <div className="glass-card p-8 text-center text-muted-foreground text-sm">
                  <Gavel size={32} className="mx-auto mb-3 opacity-40" />
                  Select a practice area to browse vetted firms
                </div>
              ) : items.map((f, i) => (
                <div key={i} className="glass-card p-4 space-y-2 hover:border-primary/20 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-sm font-medium">{f.name}</h3>
                      <p className="text-[10px] text-muted-foreground">Est. {f.founded} • {f.partners} partners</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-primary">
                      <Star size={10} fill="currentColor" /> {f.vendorRating}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div className="bg-secondary/30 rounded px-2 py-1"><span className="text-muted-foreground">Jurisdiction</span><br/>{f.jurisdiction}</div>
                    <div className="bg-secondary/30 rounded px-2 py-1"><span className="text-muted-foreground">Hourly</span><br/>{f.hourlyRate}</div>
                    <div className="bg-secondary/30 rounded px-2 py-1"><span className="text-muted-foreground">Languages</span><br/>{f.languages}</div>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Specialty: {f.specialty}</p>
                  {f.vendorNotes.map((n, j) => (
                    <p key={j} className="text-[9px] text-muted-foreground/70 flex items-center gap-1"><ChevronRight size={8} />{n}</p>
                  ))}
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={14} className="text-primary" />
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Quantus V2+ Insights</p>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>• Cross-border M&A activity up 22% in Q1 2026</p>
              <p>• UK non-dom regime changes driving trust restructuring demand</p>
              <p>• AI-assisted due diligence reducing review time by 40%</p>
              <p>• Crypto regulatory clarity boosting digital asset structuring</p>
            </div>
          </div>
          <ModuleLiveDeals category="legal" deals={deals} />
        </div>
      </div>
    </div>
  );
});
LegalModule.displayName = "LegalModule";
export default LegalModule;
