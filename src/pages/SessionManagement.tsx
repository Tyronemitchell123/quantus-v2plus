import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Monitor, Smartphone, Globe, Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import DashboardPageWrapper from "@/components/layouts/DashboardPageWrapper";
import useDocumentHead from "@/hooks/use-document-head";

const SessionManagement = () => {
  useDocumentHead({ title: "Session Management — Quantus V2+", description: "Manage your active sessions and security." });
  const { user } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const currentSession = {
    device: navigator.userAgent.includes("Mobile") ? "Mobile" : "Desktop",
    browser: getBrowserName(),
    os: getOSName(),
    ip: "Current session",
    lastActive: "Now",
    isCurrent: true,
  };

  const handleSignOutAll = async () => {
    setSigningOut(true);
    try {
      await supabase.auth.signOut({ scope: "global" });
      toast.success("All sessions signed out");
      window.location.href = "/auth";
    } catch {
      toast.error("Failed to sign out all sessions");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <DashboardPageWrapper footerLeft="Quantus V2+ — Session Management">
      <div className="max-w-2xl space-y-6">
        {/* Current Session */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Shield size={16} className="text-primary" />
            <h3 className="text-sm font-body uppercase tracking-wider text-foreground">Current Session</h3>
          </div>
          <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl">
            {currentSession.device === "Mobile" ? (
              <Smartphone size={24} className="text-primary/60" />
            ) : (
              <Monitor size={24} className="text-primary/60" />
            )}
            <div className="flex-1">
              <p className="text-sm text-foreground">{currentSession.browser} on {currentSession.os}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                <Globe size={10} className="inline mr-1" />{currentSession.ip} — Active now
              </p>
            </div>
            <span className="text-[9px] uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded-full">Current</span>
          </div>
        </motion.div>

        {/* Security Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-2xl">
          <h3 className="text-sm font-body uppercase tracking-wider text-foreground mb-4">Account Security</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border/20">
              <span className="text-xs text-muted-foreground">Email</span>
              <span className="text-xs text-foreground">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/20">
              <span className="text-xs text-muted-foreground">Two-Factor Auth</span>
              <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">Email OTP Active</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/20">
              <span className="text-xs text-muted-foreground">Last Sign In</span>
              <span className="text-xs text-foreground">{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString("en-GB") : "N/A"}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-muted-foreground">Account Created</span>
              <span className="text-xs text-foreground">{user?.created_at ? new Date(user.created_at).toLocaleDateString("en-GB") : "N/A"}</span>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 rounded-2xl">
          <h3 className="text-sm font-body uppercase tracking-wider text-foreground mb-4">Security Actions</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={handleSignOutAll} disabled={signingOut}>
              <LogOut size={14} />
              {signingOut ? "Signing out all sessions…" : "Sign Out All Sessions"}
            </Button>
            <p className="text-[10px] text-muted-foreground">This will sign you out of all devices, including this one.</p>
          </div>
        </motion.div>
      </div>
    </DashboardPageWrapper>
  );
};

function getBrowserName(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("Edge")) return "Edge";
  return "Unknown Browser";
}

function getOSName(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Win")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  return "Unknown OS";
}

export default SessionManagement;
