import { useState } from "react";
import { motion } from "framer-motion";
import useDocumentHead from "@/hooks/use-document-head";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import {
  Search, Star, MapPin, Shield, Phone, Mail, Globe, Award,
  Plane, Stethoscope, Users, Sparkles, Truck, Handshake, Filter,
  CheckCircle2, Clock, MessageSquare
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Vendor {
  id: string;
  name: string;
  company: string;
  category: "aviation" | "medical" | "staffing" | "lifestyle" | "logistics" | "partnerships";
  rating: number;
  deals: number;
  avgResponse: string;
  verified: boolean;
  location: string;
  specialties: string[];
  tier: "platinum" | "gold" | "silver";
}

const vendors: Vendor[] = [
  { id: "1", name: "James Whitfield", company: "Meridian Executive Aviation", category: "aviation", rating: 4.9, deals: 47, avgResponse: "12 min", verified: true, location: "London, UK", specialties: ["G700", "Global 7500", "Heavy Jets"], tier: "platinum" },
  { id: "2", name: "Dr. Elena Vasquez", company: "Harley Street Wellness", category: "medical", rating: 5.0, deals: 32, avgResponse: "45 min", verified: true, location: "London, UK", specialties: ["Executive Health", "Longevity", "Concierge Medicine"], tier: "platinum" },
  { id: "3", name: "Sophie Laurent", company: "Maison Laurent Staffing", category: "staffing", rating: 4.8, deals: 61, avgResponse: "20 min", verified: true, location: "Paris, FR", specialties: ["Household Staff", "Private Chefs", "Nannies"], tier: "gold" },
  { id: "4", name: "Marco Bellini", company: "Bellini Lifestyle Concierge", category: "lifestyle", rating: 4.7, deals: 28, avgResponse: "30 min", verified: true, location: "Milan, IT", specialties: ["Events", "Fine Dining", "Yachts"], tier: "gold" },
  { id: "5", name: "Hans Richter", company: "Alpine Logistics GmbH", category: "logistics", rating: 4.6, deals: 19, avgResponse: "1h", verified: true, location: "Zurich, CH", specialties: ["Art Transport", "Secure Storage", "White Glove"], tier: "silver" },
  { id: "6", name: "Aisha Rahman", company: "Gulf Partners Advisory", category: "partnerships", rating: 4.9, deals: 15, avgResponse: "2h", verified: true, location: "Dubai, AE", specialties: ["Joint Ventures", "Family Office", "M&A"], tier: "platinum" },
  { id: "7", name: "Captain Tom Elliot", company: "SkyVault Charter", category: "aviation", rating: 4.5, deals: 38, avgResponse: "15 min", verified: true, location: "Geneva, CH", specialties: ["Mid-Size Jets", "Turboprops", "Helicopter"], tier: "gold" },
  { id: "8", name: "Dr. Kenji Tanaka", company: "Tokyo Precision Medicine", category: "medical", rating: 4.8, deals: 12, avgResponse: "3h", verified: true, location: "Tokyo, JP", specialties: ["Diagnostics", "Genomics", "Stem Cell"], tier: "silver" },
];

const categoryConfig: Record<string, { icon: typeof Plane; label: string }> = {
  aviation: { icon: Plane, label: "Aviation" },
  medical: { icon: Stethoscope, label: "Medical" },
  staffing: { icon: Users, label: "Staffing" },
  lifestyle: { icon: Sparkles, label: "Lifestyle" },
  logistics: { icon: Truck, label: "Logistics" },
  partnerships: { icon: Handshake, label: "Partnerships" },
};

const tierColors: Record<string, string> = {
  platinum: "bg-primary/10 text-primary border-primary/30",
  gold: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  silver: "bg-slate-400/10 text-slate-400 border-slate-400/30",
};

const PrivateNetwork = () => {
  useDocumentHead({ title: "Private Network — Quantus A.I", description: "Exclusive vetted vendor directory with reputation scores and direct booking." });
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = vendors.filter(v => {
    const matchSearch = v.name.toLowerCase().includes(search.toLowerCase()) || v.company.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !activeCategory || v.category === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardTopBar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h1 className="text-2xl font-display tracking-tight text-foreground">Private Network Directory</h1>
            <p className="text-sm text-muted-foreground mt-1">Vetted partners with reputation scores and direct engagement</p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors…" className="pl-9 font-body text-sm" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button onClick={() => setActiveCategory(null)} className={`px-3 py-1.5 text-[9px] tracking-wider uppercase font-body border shrink-0 transition-all ${!activeCategory ? "border-primary text-primary bg-primary/5" : "border-border text-muted-foreground hover:border-primary/30"}`}>
                All
              </button>
              {Object.entries(categoryConfig).map(([key, cfg]) => (
                <button key={key} onClick={() => setActiveCategory(key === activeCategory ? null : key)} className={`px-3 py-1.5 text-[9px] tracking-wider uppercase font-body border shrink-0 transition-all flex items-center gap-1.5 ${activeCategory === key ? "border-primary text-primary bg-primary/5" : "border-border text-muted-foreground hover:border-primary/30"}`}>
                  <cfg.icon size={10} />{cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 text-center">
            {[
              { label: "Vetted Partners", value: vendors.length },
              { label: "Avg Rating", value: "4.8★" },
              { label: "Total Deals", value: vendors.reduce((s, v) => s + v.deals, 0) },
            ].map(s => (
              <div key={s.label}>
                <p className="text-lg font-display text-foreground">{s.value}</p>
                <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground font-body">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Vendor Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((vendor, i) => {
              const cfg = categoryConfig[vendor.category];
              const Icon = cfg.icon;
              return (
                <motion.div key={vendor.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="hover:border-primary/20 transition-colors group">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center border border-border">
                            <Icon size={20} className="text-muted-foreground" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-body text-foreground">{vendor.name}</p>
                              {vendor.verified && <CheckCircle2 size={12} className="text-emerald-500" />}
                            </div>
                            <p className="text-xs text-muted-foreground font-body">{vendor.company}</p>
                          </div>
                        </div>
                        <Badge className={`text-[8px] uppercase tracking-wider border ${tierColors[vendor.tier]}`}>
                          {vendor.tier}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-xs text-foreground font-body flex items-center gap-1"><Star size={10} className="text-amber-500" />{vendor.rating}</span>
                        <span className="text-xs text-muted-foreground font-body">{vendor.deals} deals</span>
                        <span className="text-xs text-muted-foreground font-body flex items-center gap-1"><Clock size={10} />{vendor.avgResponse}</span>
                        <span className="text-xs text-muted-foreground font-body flex items-center gap-1"><MapPin size={10} />{vendor.location}</span>
                      </div>

                      <div className="flex gap-1.5 flex-wrap mb-4">
                        {vendor.specialties.map(s => (
                          <span key={s} className="px-2 py-0.5 border border-border text-[9px] font-body text-muted-foreground">{s}</span>
                        ))}
                      </div>

                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="flex-1 px-3 py-2 bg-primary text-primary-foreground text-[10px] tracking-wider uppercase font-body hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5">
                          <MessageSquare size={10} /> Contact
                        </button>
                        <button className="px-3 py-2 border border-border text-[10px] tracking-wider uppercase font-body text-muted-foreground hover:border-primary/30 hover:text-foreground transition-all flex items-center gap-1.5">
                          <Shield size={10} /> View Profile
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PrivateNetwork;
