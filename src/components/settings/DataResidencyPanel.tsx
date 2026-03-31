import { useState } from "react";
import { Globe, Shield, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Region {
  id: string;
  name: string;
  flag: string;
  location: string;
  frameworks: string[];
  status: "available" | "coming_soon";
  description: string;
}

const REGIONS: Region[] = [
  {
    id: "uk",
    name: "United Kingdom",
    flag: "🇬🇧",
    location: "London, UK",
    frameworks: ["UK GDPR", "Data Protection Act 2018", "ICO Registered"],
    status: "available",
    description: "Data stored in UK-based data centres. Compliant with post-Brexit UK data protection laws and ICO requirements.",
  },
  {
    id: "eu",
    name: "European Union",
    flag: "🇪🇺",
    location: "Frankfurt, DE",
    frameworks: ["EU GDPR", "ePrivacy Directive", "SCCs"],
    status: "available",
    description: "Data stored within EU borders. Full GDPR compliance with Standard Contractual Clauses for any sub-processor transfers.",
  },
  {
    id: "apac-sg",
    name: "APAC — Singapore",
    flag: "🇸🇬",
    location: "Singapore",
    frameworks: ["PDPA", "MAS TRM", "APEC CBPR"],
    status: "available",
    description: "Data stored in Singapore. Compliant with the Personal Data Protection Act and MAS Technology Risk Management guidelines.",
  },
  {
    id: "apac-au",
    name: "APAC — Australia",
    flag: "🇦🇺",
    location: "Sydney, AU",
    frameworks: ["Privacy Act 1988", "APPs", "OAIC Registered"],
    status: "coming_soon",
    description: "Data stored in Australian data centres. Compliant with the Australian Privacy Principles and OAIC guidelines.",
  },
  {
    id: "apac-jp",
    name: "APAC — Japan",
    flag: "🇯🇵",
    location: "Tokyo, JP",
    frameworks: ["APPI", "JIPDEC", "EU Adequacy"],
    status: "coming_soon",
    description: "Data stored in Japan. Compliant with the Act on Protection of Personal Information, with EU adequacy recognition.",
  },
];

const DataResidencyPanel = () => {
  const [selectedRegion, setSelectedRegion] = useState("uk");

  const handleSelect = (regionId: string) => {
    const region = REGIONS.find((r) => r.id === regionId);
    if (region?.status === "coming_soon") {
      toast.info(`${region.name} region is coming soon. We'll notify you when available.`);
      return;
    }
    setSelectedRegion(regionId);
    toast.success(`Data residency set to ${region?.name}. All new data will be stored in ${region?.location}.`);
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground font-display">
            <Globe className="text-primary" size={20} />
            Data Residency Zone
          </CardTitle>
          <CardDescription>
            Choose where your data is physically stored. This affects compliance obligations, latency, and applicable privacy frameworks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {REGIONS.map((region) => {
            const isSelected = selectedRegion === region.id;
            const isAvailable = region.status === "available";

            return (
              <button
                key={region.id}
                onClick={() => handleSelect(region.id)}
                className={`w-full text-left rounded-xl border p-4 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : isAvailable
                    ? "border-border/40 bg-secondary/30 hover:border-primary/40 hover:bg-secondary/50"
                    : "border-border/20 bg-muted/20 opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{region.flag}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-sm">{region.name}</span>
                        {isSelected && <CheckCircle2 className="text-primary" size={16} />}
                        {!isAvailable && (
                          <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-400">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{region.location}</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{region.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {region.frameworks.map((fw) => (
                    <Badge key={fw} variant="secondary" className="text-[10px] font-normal">
                      {fw}
                    </Badge>
                  ))}
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* Compliance summary */}
      <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground font-display text-base">
            <Shield className="text-primary" size={18} />
            Compliance Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={14} />
              <span>All regions use AES-256 encryption at rest and TLS 1.3 in transit</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={14} />
              <span>SOC 2 Type II and ISO 27001 certified infrastructure</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={14} />
              <span>Data Processing Agreements (DPAs) available for all regions</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={14} />
              <span>Cross-border transfers governed by SCCs / APEC CBPR where applicable</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={14} />
              <span>Changing region does not migrate historical data — only new records are affected</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataResidencyPanel;
