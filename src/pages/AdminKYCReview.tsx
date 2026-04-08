import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardPageWrapper from "@/components/dashboard/DashboardPageWrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Eye, Shield, Clock } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function AdminKYCReview() {
  const qc = useQueryClient();
  const [rejectNotes, setRejectNotes] = useState<Record<string, string>>({});

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["admin-kyc"],
    queryFn: async () => {
      const { data } = await supabase
        .from("kyc_verifications")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const updateKYC = useMutation({
    mutationFn: async ({ id, userId, status, notes }: { id: string; userId: string; status: string; notes?: string }) => {
      const { error } = await supabase.from("kyc_verifications").update({
        status,
        reviewed_at: new Date().toISOString(),
        notes: notes || null,
      } as any).eq("id", id);
      if (error) throw error;

      await supabase.from("profiles").update({ kyc_status: status } as any).eq("user_id", userId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-kyc"] });
      toast.success("KYC status updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const statusBadge = (s: string) => {
    const map: Record<string, { icon: any; color: string }> = {
      pending: { icon: Clock, color: "text-yellow-500" },
      verified: { icon: CheckCircle2, color: "text-green-500" },
      rejected: { icon: XCircle, color: "text-destructive" },
    };
    const cfg = map[s] || map.pending;
    const Icon = cfg.icon;
    return <span className={`flex items-center gap-1 text-xs ${cfg.color} capitalize`}><Icon size={12} />{s}</span>;
  };

  return (
    <DashboardPageWrapper title="KYC Review" subtitle="Review and approve identity verification submissions">
      <div className="space-y-4 max-w-3xl">
        {isLoading && <p className="text-sm text-muted-foreground">Loading submissions...</p>}
        {submissions.length === 0 && !isLoading && (
          <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">No KYC submissions yet.</CardContent></Card>
        )}
        {submissions.map((s: any) => (
          <Card key={s.id} className="border-border">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{s.user_id.slice(0, 8)}...</p>
                  <p className="text-xs text-muted-foreground capitalize">{s.document_type?.replace("_", " ")} • {new Date(s.created_at).toLocaleDateString()}</p>
                </div>
                {statusBadge(s.status)}
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                {s.document_front_path && (
                  <div className="p-2 bg-muted rounded-lg text-center">
                    <Eye size={12} className="mx-auto mb-1 text-muted-foreground" />
                    <span className="text-muted-foreground">ID Front</span>
                  </div>
                )}
                {s.document_back_path && (
                  <div className="p-2 bg-muted rounded-lg text-center">
                    <Eye size={12} className="mx-auto mb-1 text-muted-foreground" />
                    <span className="text-muted-foreground">ID Back</span>
                  </div>
                )}
                {s.address_proof_path && (
                  <div className="p-2 bg-muted rounded-lg text-center">
                    <Eye size={12} className="mx-auto mb-1 text-muted-foreground" />
                    <span className="text-muted-foreground">Address Proof</span>
                  </div>
                )}
              </div>

              {s.status === "pending" && (
                <div className="flex gap-2 items-end">
                  <input
                    type="text" placeholder="Rejection reason (optional)"
                    value={rejectNotes[s.id] || ""}
                    onChange={e => setRejectNotes(prev => ({ ...prev, [s.id]: e.target.value }))}
                    className="flex-1 text-xs border border-border rounded-lg px-3 py-2 bg-background text-foreground"
                  />
                  <Button size="sm" variant="outline"
                    onClick={() => updateKYC.mutate({ id: s.id, userId: s.user_id, status: "rejected", notes: rejectNotes[s.id] })}>
                    <XCircle size={12} className="mr-1" /> Reject
                  </Button>
                  <Button size="sm"
                    onClick={() => updateKYC.mutate({ id: s.id, userId: s.user_id, status: "verified" })}>
                    <CheckCircle2 size={12} className="mr-1" /> Approve
                  </Button>
                </div>
              )}

              {s.notes && <p className="text-xs text-muted-foreground italic">Note: {s.notes}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardPageWrapper>
  );
}
