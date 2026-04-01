import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import useDocumentHead from "@/hooks/use-document-head";
import { supabase } from "@/integrations/supabase/client";
import {
  Search, Star, MapPin, Shield, CheckCircle2, Globe, Award,
  Plane, Stethoscope, Users, Sparkles, Truck, Handshake, ArrowRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface Vendor {
  id: string;
  name: string;
  company: string;
  category: string;
  description: string | null;
  location: string | null;
  specialties: string[];
  credentials: Record<string, unknown>;
  tier: string;
  is_verified: boolean;
  website: string | null;
}

const categoryConfig: Record<string, { icon: typeof Plane; label: string }> = {
  aviation: { icon: Plane, label: "Aviation" },
  medical: { icon: Stethoscope, label: "Medical" },
  staffing: { icon: Users, label: "Staffing" },
  lifestyle: { icon: Sparkles, label: "Lifestyle" },
  logistics: { icon: Truck, label: "Logistics" },
  partnerships: { icon: Handshake, label: "Partnerships" },
};

const tierColors: Record<string, string> = {
  premium: "bg-primary/10 text-primary border-primary/30",
  verified: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  standard: "bg-muted text-muted-foreground border-border",
};

const CredentialBadges = ({ credentials, category }: { credentials: Record<string, unknown>; category: string }) => {
  const badges: { label: string; icon: typeof Shield }[] = [];
  if (credentials?.aoc && category === "aviation") badges.push({ label: "AOC Verified", icon: Shield });
  if (credentials?.iso) badges.push({ label: `ISO ${credentials.iso}`, icon: Award });
  if (credentials?.licensed) badges.push({ label: "Licensed", icon: CheckCircle2 });
  if (badges.length === 0) return null;
  return (
    <div className="flex gap-1.5 flex-wrap">
      {badges.map(b => (
        <span key={b.label} className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[9px] font-body tracking-wider uppercase">
          <b.icon size={9} />{b.label}
        </span>
      ))}
    </div>
  );
};

const Marketplace = () => {
  useDocumentHead({
    title: "Vendor Marketplace — Quantus V2+",
    description: "Browse verified vendors across aviation, medical, staffing, and lifestyle. Real partners, real credentials.",
  });

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchVendors = async () => {
      const { data } = await supabase
        .from("vendors")
        .select("id, name, company, category, description, location, specialties, credentials, tier, is_verified, website")
        .eq("is_active", true)
        .order("tier", { ascending: true })
        .order("company", { ascending: true });
      setVendors((data as Vendor[]) || []);
      setLoading(false);
    };
    fetchVendors();
  }, []);

  const filtered = vendors.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = !q || v.name.toLowerCase().includes(q) || v.company.toLowerCase().includes(q) || v.specialties.some(s => s.toLowerCase().includes(q));
    const matchCat = !activeCategory || v.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-body text-[10px] tracking-[0.4em] uppercase text-primary mb-4">Vendor Marketplace</p>
            <h1 className="text-3xl md:text-4xl font-display tracking-tight text-foreground mb-4">
              Verified Global Partners
            </h1>
            <p className="text-sm text-muted-foreground font-body max-w-xl mx-auto">
              Every vendor on this marketplace has been reviewed and credentialed.
              Browse by category or search for specific services.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-6 max-w-5xl space-y-6">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors, companies, specialties…" className="pl-9 font-body text-sm" />
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

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Card key={i}><CardContent className="p-5 space-y-3"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/2" /><Skeleton className="h-3 w-full" /></CardContent></Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 border border-dashed border-border rounded-lg">
              <Globe size={40} className="text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-display text-foreground mb-2">
                {vendors.length === 0 ? "Marketplace Launching Soon" : "No vendors match your search"}
              </h3>
              <p className="text-sm text-muted-foreground font-body max-w-md mx-auto mb-6">
                {vendors.length === 0
                  ? "We're onboarding verified vendors across Aviation, Medical, Staffing, and Lifestyle. Be the first to join."
                  : "Try broadening your search or selecting a different category."}
              </p>
              {vendors.length === 0 && (
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/partner-with-us" className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-[10px] tracking-wider uppercase font-body hover:bg-primary/90 transition-colors">
                    Become a Partner <ArrowRight size={12} />
                  </Link>
                  <Link to="/waiting-list" className="inline-flex items-center gap-2 px-6 py-2.5 border border-border text-[10px] tracking-wider uppercase font-body text-muted-foreground hover:border-primary/30 transition-colors">
                    Join Waiting List
                  </Link>
                </div>
              )}
            </motion.div>
          )}

          {/* Vendor Cards */}
          {!loading && filtered.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((vendor, i) => {
                const cfg = categoryConfig[vendor.category] || { icon: Globe, label: vendor.category };
                const Icon = cfg.icon;
                return (
                  <motion.div key={vendor.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <Card className="hover:border-primary/20 transition-colors group h-full">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center border border-border">
                              <Icon size={18} className="text-muted-foreground" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-body text-foreground">{vendor.company}</p>
                                {vendor.is_verified && <CheckCircle2 size={12} className="text-emerald-500" />}
                              </div>
                              <p className="text-xs text-muted-foreground font-body">{vendor.name}</p>
                            </div>
                          </div>
                          <Badge className={`text-[8px] uppercase tracking-wider border ${tierColors[vendor.tier] || tierColors.standard}`}>
                            {vendor.tier}
                          </Badge>
                        </div>

                        {vendor.description && (
                          <p className="text-xs text-muted-foreground font-body mb-3 line-clamp-2">{vendor.description}</p>
                        )}

                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          {vendor.location && (
                            <span className="text-xs text-muted-foreground font-body flex items-center gap-1"><MapPin size={10} />{vendor.location}</span>
                          )}
                          <span className="text-xs text-muted-foreground font-body flex items-center gap-1">
                            <Icon size={10} />{cfg.label}
                          </span>
                        </div>

                        <CredentialBadges credentials={vendor.credentials as Record<string, unknown>} category={vendor.category} />

                        {vendor.specialties.length > 0 && (
                          <div className="flex gap-1.5 flex-wrap mt-3">
                            {vendor.specialties.slice(0, 4).map(s => (
                              <span key={s} className="px-2 py-0.5 border border-border text-[9px] font-body text-muted-foreground">{s}</span>
                            ))}
                            {vendor.specialties.length > 4 && (
                              <span className="px-2 py-0.5 text-[9px] font-body text-muted-foreground">+{vendor.specialties.length - 4}</span>
                            )}
                          </div>
                        )}

                        <div className="mt-4 pt-3 border-t border-border">
                          <Link to="/intake" className="inline-flex items-center gap-1.5 text-[10px] tracking-wider uppercase font-body text-primary hover:text-primary/80 transition-colors">
                            Request Quote <ArrowRight size={10} />
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* CTA */}
          <div className="text-center pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground font-body mb-4">Are you a vendor? List your services on Quantus.</p>
            <Link to="/partner-with-us" className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground text-[10px] tracking-wider uppercase font-body hover:bg-primary/90 transition-colors">
              Apply to Partner <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Marketplace;
