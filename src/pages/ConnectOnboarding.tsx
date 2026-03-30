/**
 * Stripe Connect – Onboarding Page
 *
 * This page allows authenticated users to:
 * 1. Create a new Stripe Connected Account (V2 Express)
 * 2. Start the Stripe-hosted onboarding flow via Account Links
 * 3. View real-time onboarding & capability status fetched directly from Stripe
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import { CheckCircle, AlertCircle, Loader2, ExternalLink, RefreshCw } from "lucide-react";
import useDocumentHead from "@/hooks/use-document-head";

const ConnectOnboarding = () => {
  useDocumentHead({ title: "Vendor Onboarding — Stripe Connect | QUANTUS V2+", description: "Set up your Stripe connected account to receive commissions and vendor payouts." });
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  // ── Form state for creating a new connected account ─────────────────────
  const [displayName, setDisplayName] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  // ── Account state ───────────────────────────────────────────────────────
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);
  const [accountStatus, setAccountStatus] = useState<{
    readyToReceivePayments: boolean;
    onboardingComplete: boolean;
    requirementsStatus: string;
    displayName: string;
  } | null>(null);

  // ── Loading states ──────────────────────────────────────────────────────
  const [creating, setCreating] = useState(false);
  const [linking, setLinking] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);

  // ── On mount: check if user already has a connected account ─────────────
  useEffect(() => {
    if (!user) return;
    loadExistingAccount();
  }, [user]);

  // ── If returning from Stripe onboarding, refresh the status ─────────────
  useEffect(() => {
    const accountIdParam = searchParams.get("accountId");
    if (accountIdParam) {
      setStripeAccountId(accountIdParam);
      fetchAccountStatus(accountIdParam);
    }
  }, [searchParams]);

  /**
   * Load the user's existing connected account from our database
   */
  const loadExistingAccount = async () => {
    const { data } = await supabase
      .from("stripe_connected_accounts")
      .select("stripe_account_id")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (data?.stripe_account_id) {
      setStripeAccountId(data.stripe_account_id);
      fetchAccountStatus(data.stripe_account_id);
    }
  };

  /**
   * Step 1: Create a new V2 Connected Account via our edge function
   */
  const createAccount = async () => {
    if (!displayName || !contactEmail) {
      toast({ title: "Error", description: "Please fill in both fields", variant: "destructive" });
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-connect-accounts", {
        body: { action: "create", displayName, contactEmail },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setStripeAccountId(data.accountId);
      toast({ title: "Account Created", description: `Connected account ${data.accountId} created successfully.` });

      // Immediately fetch status
      fetchAccountStatus(data.accountId);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  /**
   * Step 2: Generate an Account Link and redirect to Stripe's onboarding
   */
  const startOnboarding = async () => {
    if (!stripeAccountId) return;

    setLinking(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-connect-accounts", {
        body: { action: "link", stripeAccountId },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // Redirect to Stripe's hosted onboarding in a new tab
      window.open(data.url, "_blank");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLinking(false);
    }
  };

  /**
   * Step 3: Fetch the account's current status directly from Stripe
   */
  const fetchAccountStatus = async (accountId: string) => {
    setLoadingStatus(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-connect-accounts", {
        body: { action: "status", stripeAccountId: accountId },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setAccountStatus(data);
    } catch (err: any) {
      console.error("Status fetch error:", err.message);
    } finally {
      setLoadingStatus(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardTopBar />
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Stripe Connect Onboarding</h1>
              <p className="text-muted-foreground mt-1">
                Set up your connected account to receive payments through our platform.
              </p>
            </div>

            {/* ── CREATE ACCOUNT CARD ──────────────────────────────────────── */}
            {!stripeAccountId && (
              <Card>
                <CardHeader>
                  <CardTitle>Create Connected Account</CardTitle>
                  <CardDescription>
                    Enter your details to create a Stripe Express account. This account will be used
                    to receive payouts from sales on the platform.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Display Name</label>
                    <Input
                      placeholder="Your business or display name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Contact Email</label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                  </div>
                  <Button onClick={createAccount} disabled={creating} className="w-full">
                    {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Connected Account
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* ── ACCOUNT STATUS CARD ─────────────────────────────────────── */}
            {stripeAccountId && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Account Status</CardTitle>
                      <CardDescription className="font-mono text-xs mt-1">
                        {stripeAccountId}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchAccountStatus(stripeAccountId)}
                      disabled={loadingStatus}
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 ${loadingStatus ? "animate-spin" : ""}`} />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingStatus && !accountStatus ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading status from Stripe…
                    </div>
                  ) : accountStatus ? (
                    <>
                      {/* Onboarding status */}
                      <div className="flex items-center gap-3">
                        {accountStatus.onboardingComplete ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        )}
                        <div>
                          <p className="font-medium text-foreground">Onboarding</p>
                          <p className="text-sm text-muted-foreground">
                            {accountStatus.onboardingComplete
                              ? "Complete — all requirements satisfied"
                              : `Action needed — status: ${accountStatus.requirementsStatus}`}
                          </p>
                        </div>
                        <Badge
                          variant={accountStatus.onboardingComplete ? "default" : "secondary"}
                          className="ml-auto"
                        >
                          {accountStatus.onboardingComplete ? "Complete" : "Pending"}
                        </Badge>
                      </div>

                      {/* Payments status */}
                      <div className="flex items-center gap-3">
                        {accountStatus.readyToReceivePayments ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-yellow-500" />
                        )}
                        <div>
                          <p className="font-medium text-foreground">Payments</p>
                          <p className="text-sm text-muted-foreground">
                            {accountStatus.readyToReceivePayments
                              ? "Ready to receive payments"
                              : "Not yet ready — complete onboarding first"}
                          </p>
                        </div>
                        <Badge
                          variant={accountStatus.readyToReceivePayments ? "default" : "secondary"}
                          className="ml-auto"
                        >
                          {accountStatus.readyToReceivePayments ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      {/* Onboard button */}
                      {!accountStatus.onboardingComplete && (
                        <Button onClick={startOnboarding} disabled={linking} className="w-full mt-2">
                          {linking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Onboard to Collect Payments
                        </Button>
                      )}
                    </>
                  ) : (
                    <p className="text-muted-foreground">Unable to load status. Click Refresh to retry.</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ── WEBHOOK SETUP INFO ──────────────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Webhook Configuration</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  To receive real-time updates when account requirements change, set up a webhook
                  in your Stripe Dashboard:
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Go to Developers → Webhooks → + Add destination</li>
                  <li>Select <strong>Connected accounts</strong> in "Events from"</li>
                  <li>Click <strong>Show advanced options</strong> → Payload style: <strong>Thin</strong></li>
                  <li>
                    Select events: <code className="text-xs bg-muted px-1 rounded">v2.core.account[requirements].updated</code> and{" "}
                    <code className="text-xs bg-muted px-1 rounded">v2.core.account[.recipient].capability_status_updated</code>
                  </li>
                  <li>
                    Set endpoint URL to your <code className="text-xs bg-muted px-1 rounded">stripe-connect-webhook</code> function
                  </li>
                  <li>Copy the signing secret and add it as <code className="text-xs bg-muted px-1 rounded">STRIPE_CONNECT_WEBHOOK_SECRET</code></li>
                </ol>
                <p className="mt-2">
                  For local development:
                </p>
                <code className="block text-xs bg-muted p-2 rounded overflow-x-auto">
                  stripe listen --thin-events 'v2.core.account[requirements].updated,v2.core.account[.recipient].capability_status_updated' --forward-thin-to http://localhost:54321/functions/v1/stripe-connect-webhook
                </code>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ConnectOnboarding;
