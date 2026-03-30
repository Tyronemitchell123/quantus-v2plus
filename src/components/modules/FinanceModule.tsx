import { useState, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useModuleData } from "@/hooks/use-module-data";
import ModuleLiveDeals from "@/components/modules/ModuleLiveDeals";
import { Link } from "react-router-dom";
import {
  Landmark, ArrowRight, Sparkles, Star, MapPin, ChevronRight,
  TrendingUp, PiggyBank, BarChart3, Briefcase,
} from "lucide-react";

const categories = [
  { id: "wealth", label: "Wealth Management", icon: "💎", count: 16 },
  { id: "tax-advisory", label: "Tax Advisory", icon: "📋", count: 11 },
  { id: "insurance", label: "Insurance Brokers", icon: "🛡", count: 9 },
  { id: "ma", label: "M&A Advisory", icon: "🤝", count: 6 },
  { id: "banking", label: "Private Banking", icon: "🏦", count: 8 },
  { id: "fund", label: "Fund Management", icon: "📈", count: 7 },
  { id: "forex", label: "FX & Treasury", icon: "💱", count: 5 },
  { id: "fintech", label: "FinTech Solutions", icon: "⚡", count: 10 },
];

const providerData: Record<string, Array<{
  name: string; aum: string; jurisdiction: string;
  minAccount: string; specialty: string; founded: number;
  vendorRating: number; feeStructure: string;
  vendorNotes: string[];
}>> = {
  "wealth": [
    { name: "Rothschild & Co Wealth", aum: "CHF 280B", jurisdiction: "Switzerland, UK, France", minAccount: "CHF 5M", specialty: "Multi-generational wealth preservation", founded: 1838, vendorRating: 99, feeStructure: "0.5–1.2% AUM", vendorNotes: ["200+ year heritage", "Direct access to private equity co-investments"] },
    { name: "Lombard Odier", aum: "CHF 310B", jurisdiction: "Switzerland, Global", minAccount: "CHF 1M", specialty: "Sustainable investing, ESG integration", founded: 1796, vendorRating: 97, feeStructure: "0.6–1.0% AUM", vendorNotes: ["Pioneer in sustainable investing", "Proprietary CLIC® framework"] },
  ],
  "ma": [
    { name: "Lazard", aum: "$250B+ advised", jurisdiction: "Global", minAccount: "Deal-based", specialty: "Cross-border M&A, Restructuring", founded: 1848, vendorRating: 98, feeStructure: "1–2% deal value", vendorNotes: ["Independent advisory — no conflicts", "Sovereign wealth fund relationships"] },
  ],
  "banking": [
    { name: "Coutts & Co", aum: "£33B", jurisdiction: "UK", minAccount: "£1M", specialty: "Lending, Estate planning", founded: 1692, vendorRating: 96, feeStructure: "Tiered", vendorNotes: ["Royal Warrant holder", "Bespoke lending solutions"] },
  ],
};

const FinanceModule = forwardRef<HTMLDivElement>((_, ref) => {
  const [activeCat, setActiveCat] = useState("wealth");
  const { deals } = useModuleData("finance");
  const items = providerData[activeCat] || [];

  return (
    <div ref={ref} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Landmark size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-medium">Finance</h2>
            <p className="text-xs text-muted-foreground">Wealth management • M&A • Private banking • Insurance</p>
          </div>
        </div>
        <Link to="/intake" className="flex items-center gap-1 text-xs text-primary hover:underline">
          New Request <ArrowRight size={12} />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-3 glass-card p-3 space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 px-2">Services</p>
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
                  <Briefcase size={32} className="mx-auto mb-3 opacity-40" />
                  Select a service to browse vetted providers
                </div>
              ) : items.map((p, i) => (
                <div key={i} className="glass-card p-4 space-y-2 hover:border-primary/20 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-sm font-medium">{p.name}</h3>
                      <p className="text-[10px] text-muted-foreground">Est. {p.founded} • {p.jurisdiction}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-primary">
                      <Star size={10} fill="currentColor" /> {p.vendorRating}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div className="bg-secondary/30 rounded px-2 py-1"><span className="text-muted-foreground">AUM</span><br/>{p.aum}</div>
                    <div className="bg-secondary/30 rounded px-2 py-1"><span className="text-muted-foreground">Min Account</span><br/>{p.minAccount}</div>
                    <div className="bg-secondary/30 rounded px-2 py-1"><span className="text-muted-foreground">Fees</span><br/>{p.feeStructure}</div>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Specialty: {p.specialty}</p>
                  {p.vendorNotes.map((n, j) => (
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
              <p>• UHNW allocation shifting 15% toward private credit in 2026</p>
              <p>• Family office direct deals bypassing traditional PE up 30%</p>
              <p>• Digital asset custody becoming standard at Swiss private banks</p>
              <p>• Insurance-linked securities gaining traction for portfolio diversification</p>
            </div>
          </div>
          <ModuleLiveDeals category="finance" deals={deals} />
        </div>
      </div>
    </div>
  );
});
FinanceModule.displayName = "FinanceModule";
export default FinanceModule;
