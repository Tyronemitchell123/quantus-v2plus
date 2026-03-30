/**
 * Stripe Connect – Storefront Page
 *
 * A public-facing storefront that displays all products from all connected
 * accounts. Customers can purchase any product — the checkout uses
 * destination charges so that:
 *   - The customer pays the platform
 *   - A 10% application fee is retained by the platform
 *   - The remaining 90% is transferred to the seller's connected account
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import { Loader2, ShoppingCart, Store, CheckCircle, DollarSign } from "lucide-react";
import useDocumentHead from "@/hooks/use-document-head";

const ConnectStorefront = () => {
  useDocumentHead({ title: "Marketplace Storefront | QUANTUS V2+", description: "Browse and purchase premium products from vetted QUANTUS V2+ vendors." });
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingProductId, setBuyingProductId] = useState<string | null>(null);

  // ── Check for success/cancel query params from Stripe Checkout ──────────
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast({ title: "Payment Successful!", description: "Thank you for your purchase." });
    }
    if (searchParams.get("canceled") === "true") {
      toast({ title: "Payment Canceled", description: "You can try again anytime.", variant: "destructive" });
    }
  }, [searchParams]);

  // ── Load all products on mount ──────────────────────────────────────────
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-connect-products", {
        body: { action: "list" },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setProducts(data.products || []);
    } catch (err: any) {
      console.error("Load products error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initiate a Stripe Checkout Session with destination charges.
   * The customer is redirected to Stripe's hosted checkout page.
   */
  const buyProduct = async (product: any) => {
    setBuyingProductId(product.id);
    try {
      const { data, error } = await supabase.functions.invoke("stripe-connect-checkout", {
        body: {
          productId: product.id,
          quantity: 1,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // Redirect to Stripe Checkout in a new tab
      window.open(data.url, "_blank");
    } catch (err: any) {
      toast({ title: "Checkout Error", description: err.message, variant: "destructive" });
    } finally {
      setBuyingProductId(null);
    }
  };

  // ── Group products by seller ────────────────────────────────────────────
  const sellerGroups = products.reduce((groups: Record<string, any[]>, product) => {
    const seller = product.seller_name || "Unknown Seller";
    if (!groups[seller]) groups[seller] = [];
    groups[seller].push(product);
    return groups;
  }, {});

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardTopBar />
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
              <Store className="h-7 w-7 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Storefront</h1>
                <p className="text-muted-foreground">
                  Browse and purchase products from our sellers. Payments are securely processed via Stripe.
                </p>
              </div>
            </div>

            {/* ── Success banner ────────────────────────────────────────── */}
            {searchParams.get("success") === "true" && (
              <Card className="border-green-500/30 bg-green-500/5">
                <CardContent className="pt-6 flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <p className="text-foreground font-medium">
                    Payment successful! The seller has been notified.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* ── Loading state ─────────────────────────────────────────── */}
            {loading ? (
              <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading products…
              </div>
            ) : products.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No products available yet.</p>
                  <p className="text-sm mt-1">Sellers can add products from the Products page.</p>
                </CardContent>
              </Card>
            ) : (
              /* ── Product grid grouped by seller ──────────────────────── */
              Object.entries(sellerGroups).map(([seller, sellerProducts]) => (
                <div key={seller} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-foreground">{seller}</h2>
                    <Badge variant="secondary">{(sellerProducts as any[]).length} products</Badge>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {(sellerProducts as any[]).map((product: any) => (
                      <Card key={product.id} className="flex flex-col">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">{product.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-between gap-4">
                          {product.description && (
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {product.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-lg font-bold text-foreground">
                              <DollarSign className="h-5 w-5" />
                              {(product.price_cents / 100).toFixed(2)}
                              <span className="text-xs text-muted-foreground uppercase ml-1">
                                {product.currency}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => buyProduct(product)}
                              disabled={buyingProductId === product.id}
                            >
                              {buyingProductId === product.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <ShoppingCart className="h-4 w-4 mr-1" />
                                  Buy
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
            )}

            {/* ── How it works info ────────────────────────────────────── */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-base">How Payments Work</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>
                  This storefront uses <strong>Stripe Connect destination charges</strong>:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>You pay the listed price via Stripe's secure checkout</li>
                  <li>A 10% platform fee is retained by Quantus V2+</li>
                  <li>The remaining 90% is transferred directly to the seller</li>
                  <li>Sellers can track their payouts in their Stripe Express dashboard</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ConnectStorefront;
