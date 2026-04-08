import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import KYCUpload from "@/components/kyc/KYCUpload";
import DashboardPageWrapper from "@/components/dashboard/DashboardPageWrapper";
import { Shield, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const statusConfig = {
  verified: { icon: CheckCircle2, label: "Verified", color: "text-green-500", bg: "bg-green-500/10" },
  pending: { icon: Clock, label: "Pending Review", color: "text-yellow-500", bg: "bg-yellow-500/10" },
  rejected: { icon: XCircle, label: "Rejected", color: "text-destructive", bg: "bg-destructive/10" },
  unverified: { icon: Shield, label: "Not Verified", color: "text-muted-foreground", bg: "bg-muted" },
};

export default function KYCVerification() {
  const { user } = useAuth();

  const { data: kyc } = useQuery({
    queryKey: ["kyc", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("kyc_verifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  const status = (kyc?.status as keyof typeof statusConfig) || "unverified";
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <DashboardPageWrapper title="Identity Verification" subtitle="KYC compliance for high-value transactions">
      <div className="max-w-lg mx-auto space-y-6">
        <Card className="border-border">
          <CardContent className="p-6 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.bg}`}>
              <Icon size={24} className={config.color} />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{config.label}</p>
              <p className="text-xs text-muted-foreground">
                {status === "verified" && "Your identity has been verified."}
                {status === "pending" && "Your documents are being reviewed."}
                {status === "rejected" && `Rejected: ${kyc?.notes || "Please resubmit."}`}
                {status === "unverified" && "Submit documents to verify your identity."}
              </p>
            </div>
          </CardContent>
        </Card>

        {(status === "unverified" || status === "rejected") && user && (
          <KYCUpload userId={user.id} />
        )}
      </div>
    </DashboardPageWrapper>
  );
}
