/**
 * SEO metadata for pages that don't define their own useDocumentHead.
 * This component is used as a wrapper to inject SEO into pages via a simple hook call.
 */
import useDocumentHead from "@/hooks/use-document-head";

const SITE = "https://quantus-loom.lovable.app";

/** SEO configs for pages missing useDocumentHead */
export const PAGE_SEO: Record<string, { title: string; description: string; canonical?: string }> = {
  "/chat": {
    title: "AI Concierge — Holographic Chat | QUANTUS V2+",
    description: "Speak with QUANTUS V2+ holographic AI concierge for strategy, analytics, and real-time market intelligence.",
    canonical: `${SITE}/chat`,
  },
  "/connect/onboarding": {
    title: "Vendor Onboarding — Stripe Connect | QUANTUS V2+",
    description: "Set up your Stripe connected account to receive commissions and vendor payouts through QUANTUS V2+.",
    canonical: `${SITE}/connect/onboarding`,
  },
  "/connect/products": {
    title: "Product Management — Stripe Connect | QUANTUS V2+",
    description: "Manage your products and pricing through the QUANTUS V2+ marketplace.",
    canonical: `${SITE}/connect/products`,
  },
  "/connect/storefront": {
    title: "Marketplace Storefront | QUANTUS V2+",
    description: "Browse and purchase premium products from vetted QUANTUS V2+ vendors.",
    canonical: `${SITE}/connect/storefront`,
  },
  "/onboarding": {
    title: "Welcome to QUANTUS V2+ — Onboarding",
    description: "Complete your sovereign profile to unlock the full QUANTUS V2+ orchestration ecosystem.",
    canonical: `${SITE}/onboarding`,
  },
  "/recommendations": {
    title: "AI Recommendation Engine | QUANTUS V2+",
    description: "Proactive AI recommendations, playbooks, and risk alerts across your entire deal portfolio.",
    canonical: `${SITE}/recommendations`,
  },
  "/reset-password": {
    title: "Reset Password | QUANTUS V2+",
    description: "Set a new password for your QUANTUS V2+ account.",
    canonical: `${SITE}/reset-password`,
  },
  "/unsubscribe": {
    title: "Unsubscribe | QUANTUS V2+",
    description: "Manage your QUANTUS V2+ email preferences.",
    canonical: `${SITE}/unsubscribe`,
  },
};

export function usePageSEO(path: string) {
  const seo = PAGE_SEO[path];
  if (seo) {
    useDocumentHead(seo);
  }
}
