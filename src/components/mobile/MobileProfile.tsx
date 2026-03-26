import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  User, Shield, Bell, FileText, Bookmark, Crown, Eye, EyeOff,
  ChevronRight, LogOut, Moon,
} from "lucide-react";

const tiers: Record<string, { label: string; color: string }> = {
  professional: { label: "Professional", color: "text-primary" },
  enterprise: { label: "Enterprise", color: "text-primary" },
  starter: { label: "Starter", color: "text-muted-foreground" },
  free: { label: "Free", color: "text-muted-foreground" },
};

const MobileProfile = () => {
  const [obsidianMode, setObsidianMode] = useState(false);
  const tier = tiers.professional;

  const sections = [
    {
      items: [
        { icon: Crown, label: "Membership", sub: tier.label, to: "/account/subscription", accent: true },
        { icon: Shield, label: "Privacy Mode", sub: obsidianMode ? "Obsidian Active" : "Standard", toggle: true },
      ],
    },
    {
      items: [
        { icon: Bell, label: "Notifications", to: "/settings" },
        { icon: Bookmark, label: "Saved Items", to: "/settings" },
        { icon: FileText, label: "Documents", to: "/documents" },
      ],
    },
    {
      items: [
        { icon: Moon, label: "Appearance", to: "/settings" },
        { icon: LogOut, label: "Sign Out", to: "/auth", destructive: true },
      ],
    },
  ];

  return (
    <div className="lg:hidden space-y-6 pb-24">
      {/* Profile header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full border border-primary/20 bg-secondary/50 flex items-center justify-center">
          <User size={22} className="text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-display text-lg text-foreground">
            {obsidianMode ? "Member" : "Alexander Kensington"}
          </h3>
          <p className="font-body text-[10px] tracking-[0.15em] uppercase text-primary/70">
            {tier.label} Member
          </p>
        </div>
      </div>

      {/* Obsidian Mode banner */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setObsidianMode(!obsidianMode)}
        className={`w-full flex items-center justify-between px-4 py-3.5 border transition-all duration-500 ${
          obsidianMode
            ? "border-primary/30 bg-primary/[0.06]"
            : "border-border bg-card"
        }`}
      >
        <div className="flex items-center gap-3">
          {obsidianMode ? (
            <EyeOff size={14} className="text-primary" />
          ) : (
            <Eye size={14} className="text-muted-foreground" />
          )}
          <div className="text-left">
            <p className="font-body text-[11px] tracking-[0.1em] uppercase text-foreground">
              Obsidian Mode
            </p>
            <p className="font-body text-[9px] text-muted-foreground mt-0.5">
              {obsidianMode ? "All sensitive data hidden" : "Tap to activate privacy shield"}
            </p>
          </div>
        </div>
        <div className={`w-10 h-5 rounded-full border transition-all duration-300 flex items-center px-0.5 ${
          obsidianMode ? "border-primary/40 bg-primary/20" : "border-border bg-secondary"
        }`}>
          <motion.div
            className={`w-4 h-4 rounded-full ${obsidianMode ? "bg-primary" : "bg-muted-foreground/30"}`}
            animate={{ x: obsidianMode ? 18 : 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        </div>
      </motion.button>

      {/* Sections */}
      {sections.map((section, si) => (
        <div key={si} className="border border-border bg-card overflow-hidden">
          {section.items.map((item, ii) => (
            <Link
              key={item.label}
              to={item.to || "#"}
              onClick={item.toggle ? (e) => { e.preventDefault(); setObsidianMode(!obsidianMode); } : undefined}
              className={`flex items-center justify-between px-4 py-3.5 transition-colors ${
                ii > 0 ? "border-t border-border" : ""
              } ${item.destructive ? "text-destructive" : "text-foreground"}`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={15} strokeWidth={1.5} className={
                  item.accent ? "text-primary" : item.destructive ? "text-destructive" : "text-muted-foreground"
                } />
                <div>
                  <p className="font-body text-[12px]">{item.label}</p>
                  {item.sub && (
                    <p className="font-body text-[9px] text-muted-foreground mt-0.5">{item.sub}</p>
                  )}
                </div>
              </div>
              <ChevronRight size={14} className="text-muted-foreground/30" />
            </Link>
          ))}
        </div>
      ))}

      {/* Footer */}
      <p className="font-body text-[8px] tracking-[0.2em] uppercase text-muted-foreground/30 text-center pt-4">
        Quantus A.I — The Obsidian Standard
      </p>
    </div>
  );
};

export default MobileProfile;
