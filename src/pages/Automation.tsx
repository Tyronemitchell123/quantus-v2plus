import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Radar, Plane, Stethoscope, Hotel, HeartPulse, Bot } from "lucide-react";
import VendorDiscoveryPanel from "@/components/automation/VendorDiscoveryPanel";
import AutoScrapePanel from "@/components/automation/AutoScrapePanel";
import AviationScanPanel from "@/components/sovereign/AviationScanPanel";
import MedicalScanPanel from "@/components/sovereign/MedicalScanPanel";
import HospitalityScanPanel from "@/components/sovereign/HospitalityScanPanel";
import LongevityScanPanel from "@/components/sovereign/LongevityScanPanel";

const Automation = () => {
  return (
    <div className="min-h-screen p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" /> Automation Hub
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Consolidated Firecrawl scanning tools — vendor discovery, sector intelligence, and automated outreach
        </p>
      </div>

      <Tabs defaultValue="discovery" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="discovery" className="gap-1.5 text-xs">
            <Radar className="w-3.5 h-3.5" /> Vendor Discovery
          </TabsTrigger>
          <TabsTrigger value="aviation" className="gap-1.5 text-xs">
            <Plane className="w-3.5 h-3.5" /> Aviation
          </TabsTrigger>
          <TabsTrigger value="medical" className="gap-1.5 text-xs">
            <Stethoscope className="w-3.5 h-3.5" /> Medical
          </TabsTrigger>
          <TabsTrigger value="hospitality" className="gap-1.5 text-xs">
            <Hotel className="w-3.5 h-3.5" /> Hospitality
          </TabsTrigger>
          <TabsTrigger value="longevity" className="gap-1.5 text-xs">
            <HeartPulse className="w-3.5 h-3.5" /> Longevity
          </TabsTrigger>
          <TabsTrigger value="auto-scrape" className="gap-1.5 text-xs">
            <Bot className="w-3.5 h-3.5" /> Auto-Scrape
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discovery">
          <VendorDiscoveryPanel />
        </TabsContent>
        <TabsContent value="aviation">
          <AviationScanPanel />
        </TabsContent>
        <TabsContent value="medical">
          <MedicalScanPanel />
        </TabsContent>
        <TabsContent value="hospitality">
          <HospitalityScanPanel />
        </TabsContent>
        <TabsContent value="longevity">
          <LongevityScanPanel />
        </TabsContent>
        <TabsContent value="auto-scrape">
          <AutoScrapePanel />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Automation;
