import { motion } from "framer-motion";
import { Globe, Rocket, Gauge, Shield, Cog } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import useDocumentHead from "@/hooks/use-document-head";
import ForgeGenerate from "@/components/forge/ForgeGenerate";
import ForgeDeploy from "@/components/forge/ForgeDeploy";
import ForgeOptimize from "@/components/forge/ForgeOptimize";
import ForgeSecure from "@/components/forge/ForgeSecure";
import ForgeAdapter from "@/components/forge/ForgeAdapter";

const QuantusForge = () => {
  useDocumentHead({ title: "Quantus Forge — Website Engine", description: "The sovereign website engine module for building cinematic digital properties." });

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardTopBar onMobileMenuToggle={() => {}} notifications={[]} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-semibold text-foreground">Quantus Forge</h1>
                <p className="text-xs text-muted-foreground tracking-wider uppercase">Sovereign Website Engine — Generate · Deploy · Optimize · Secure</p>
              </div>
            </div>
          </motion.div>

          <Tabs defaultValue="generate" className="space-y-4">
            <TabsList className="bg-card/60 border border-border/50">
              <TabsTrigger value="generate" className="text-xs gap-1"><Rocket className="w-3 h-3" /> Generate</TabsTrigger>
              <TabsTrigger value="deploy" className="text-xs gap-1"><Globe className="w-3 h-3" /> Deploy</TabsTrigger>
              <TabsTrigger value="optimize" className="text-xs gap-1"><Gauge className="w-3 h-3" /> Optimize</TabsTrigger>
              <TabsTrigger value="secure" className="text-xs gap-1"><Shield className="w-3 h-3" /> Secure</TabsTrigger>
              <TabsTrigger value="adapter" className="text-xs gap-1"><Cog className="w-3 h-3" /> Adapter</TabsTrigger>
            </TabsList>

            <TabsContent value="generate"><ForgeGenerate /></TabsContent>
            <TabsContent value="deploy"><ForgeDeploy /></TabsContent>
            <TabsContent value="optimize"><ForgeOptimize /></TabsContent>
            <TabsContent value="secure"><ForgeSecure /></TabsContent>
            <TabsContent value="adapter"><ForgeAdapter /></TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default QuantusForge;
