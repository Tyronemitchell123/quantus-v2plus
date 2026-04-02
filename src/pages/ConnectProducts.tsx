/**
 * Quantus Marketplace — Product Management
 *
 * Allows connected account holders to create products on the platform.
 * Products are managed through the Quantus Commerce Engine with
 * destination-charge routing for sovereign revenue distribution.
 */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import { Loader2, Package, DollarSign } from "lucide-react";
import useDocumentHead from "@/hooks/use-document-head";

const ConnectProducts = () => {
  useDocumentHead({ title: "Product Management — Stripe Connect | QUANTUS V2+", description: "Manage your products and pricing through the QUANTUS V2+ marketplace." });
  const { user } = useAuth();
  const { toast } = useToast();

  // ── Connected account state ─────────────────────────────────────────────
  const [connectedAccountId, setConnectedAccountId] = useState<string | null>(null);

  // ── Product creation form ───────────────────────────────────────────────
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [priceInCents, setPriceInCents] = useState("");
  const [currency, setCurrency] = useState("usd");
  const [creating, setCreating] = useState(false);

  // ── Product list ────────────────────────────────────────────────────────
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadConnectedAccount();
    loadProducts();
  }, [user]);

  /**
   * Load the user's connected account ID from our database
   */
  const loadConnectedAccount = async () => {
    const { data } = await supabase
      .from("stripe_connected_accounts")
      .select("stripe_account_id")
      .eq("user_id", user!.id)
      .maybeSingle();

    if (data?.stripe_account_id) {
      setConnectedAccountId(data.stripe_account_id);
    }
  };

  /**
   * Load all products from the database (filtered to this user's account)
   */
  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      // Get the user's connected account first
      const userAccount = await supabase
        .from("stripe_connected_accounts")
        .select("stripe_account_id")
        .eq("user_id", user!.id)
        .maybeSingle();

      const accountId = userAccount.data?.stripe_account_id;
      if (!accountId) {
        setProducts([]);
        return;
      }

      const { data, error } = await supabase.functions.invoke("stripe-connect-products", {
        body: { action: "list", filterAccountId: accountId },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setProducts(data.products || []);
    } catch (err: any) {
      console.error("Load products error:", err.message);
    } finally {
      setLoadingProducts(false);
    }
  };

  /**
   * Create a new product on the platform, mapped to the connected account
   */
  const createProduct = async () => {
    if (!productName || !priceInCents || !connectedAccountId) {
      toast({
        title: "Error",
        description: connectedAccountId
          ? "Please fill in the product name and price."
          : "You need a connected account first. Go to the Onboarding page.",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-connect-products", {
        body: {
          action: "create",
          name: productName,
          description: productDescription || undefined,
          priceInCents: parseInt(priceInCents, 10),
          currency,
          connectedAccountId,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast({
        title: "Product Created",
        description: `${productName} is now available in the storefront.`,
      });

      // Reset form and reload
      setProductName("");
      setProductDescription("");
      setPriceInCents("");
      loadProducts();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setCreating(false);
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
              <h1 className="text-2xl font-bold text-foreground">Manage Products</h1>
              <p className="text-muted-foreground mt-1">
                Create products that customers can purchase through the storefront.
                Payments are routed to your connected account automatically.
              </p>
            </div>

            {/* ── No connected account warning ─────────────────────────── */}
            {!connectedAccountId && (
              <Card className="border-yellow-500/30 bg-yellow-500/5">
                <CardContent className="pt-6">
                  <p className="text-sm text-foreground">
                    You need to create a connected account before you can add products.{" "}
                    <a href="/connect/onboarding" className="text-primary underline">
                      Go to Onboarding →
                    </a>
                  </p>
                </CardContent>
              </Card>
            )}

            {/* ── CREATE PRODUCT ───────────────────────────────────────── */}
            {connectedAccountId && (
              <Card>
                <CardHeader>
                  <CardTitle>Create Product</CardTitle>
                  <CardDescription>
                    Products are created on the platform and linked to your connected account
                    ({connectedAccountId.slice(0, 12)}…).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Product Name *</label>
                    <Input
                      placeholder="e.g. Premium Consulting Hour"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Description</label>
                    <Textarea
                      placeholder="Describe your product…"
                      value={productDescription}
                      onChange={(e) => setProductDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">Price (in cents) *</label>
                      <Input
                        type="number"
                        placeholder="1000 = $10.00"
                        value={priceInCents}
                        onChange={(e) => setPriceInCents(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Currency</label>
                      <Input
                        placeholder="usd"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button onClick={createProduct} disabled={creating} className="w-full">
                    {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Product
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* ── MY PRODUCTS ──────────────────────────────────────────── */}
            <Card>
              <CardHeader>
                <CardTitle>My Products</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingProducts ? (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading…
                  </div>
                ) : products.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No products yet. Create your first product above.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border"
                      >
                        <Package className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">{product.name}</p>
                          {product.description && (
                            <p className="text-sm text-muted-foreground truncate">
                              {product.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                          <DollarSign className="h-4 w-4" />
                          {(product.price_cents / 100).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ConnectProducts;
