import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Bell, Webhook, Key, Brain, Shield } from "lucide-react";
import useDocumentHead from "@/hooks/use-document-head";
import ExportPanel from "@/components/settings/ExportPanel";
import AlertsPanel from "@/components/settings/AlertsPanel";
import WebhooksPanel from "@/components/settings/WebhooksPanel";
import ApiKeysPanel from "@/components/settings/ApiKeysPanel";
import AuditLogPanel from "@/components/settings/AuditLogPanel";

const tabs = [
  { key: "export", label: "Data Export", icon: Download },
  { key: "alerts", label: "Anomaly Alerts", icon: Bell },
  { key: "webhooks", label: "Webhooks", icon: Webhook },
  { key: "api-keys", label: "API Keys", icon: Key },
  { key: "audit", label: "Audit Log", icon: Shield },
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState("export");

  useDocumentHead({
    title: "Settings — QUANTUS AI",
    description: "Manage your data exports, anomaly alerts, webhooks, and API keys.",
  });

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Brain className="text-primary" size={24} />
            <p className="text-primary font-display text-sm tracking-[0.3em] uppercase">Platform Settings</p>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">Settings</h1>
        </motion.div>

        {/* Tab nav */}
        <div className="flex gap-1 mb-8 overflow-x-auto pb-2 scrollbar-thin">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "export" && <ExportPanel />}
          {activeTab === "alerts" && <AlertsPanel />}
          {activeTab === "webhooks" && <WebhooksPanel />}
          {activeTab === "api-keys" && <ApiKeysPanel />}
          {activeTab === "audit" && <AuditLogPanel />}
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
