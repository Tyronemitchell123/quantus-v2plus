/**
 * Comprehensive SEO metadata for all public-facing pages.
 */
import useDocumentHead from "@/hooks/use-document-head";

const SITE = "https://quantus-loom.lovable.app";

export const PAGE_SEO: Record<string, { title: string; description: string; canonical?: string; jsonLd?: Record<string, unknown> }> = {
  "/": {
    title: "Quantus V2+ — Ultra-Premium AI Intelligence Platform for UHNW Clients",
    description: "AI orchestration for ultra-high-net-worth clients. Aviation, marine, medical, legal, finance, staffing & lifestyle unified in one sovereign interface.",
    canonical: `${SITE}/`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Quantus V2+",
      url: SITE,
      logo: `${SITE}/favicon.png`,
      description: "Ultra-premium AI orchestration platform for UHNW clients across 9 verticals.",
      sameAs: [],
      contactPoint: { "@type": "ContactPoint", contactType: "sales", url: `${SITE}/contact` },
    },
  },
  "/about": {
    title: "About Quantus V2+ — The Sovereign Intelligence Platform",
    description: "Quantus V2+ orchestrates multi-million dollar deals across aviation, marine, legal, finance & lifestyle verticals for elite private offices worldwide.",
    canonical: `${SITE}/about`,
  },
  "/services": {
    title: "Services — 9-Vertical Deal Orchestration | Quantus V2+",
    description: "End-to-end AI-powered deal orchestration across aviation, marine, medical, legal, finance, staffing, logistics, partnerships, and lifestyle verticals.",
    canonical: `${SITE}/services`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Quantus V2+ Deal Orchestration",
      provider: { "@type": "Organization", name: "Quantus V2+" },
      description: "AI-powered deal sourcing, vendor outreach, negotiation, and completion across 9 premium verticals.",
      serviceType: "Business Intelligence Platform",
    },
  },
  "/pricing": {
    title: "Pricing — Starter, Professional & Teams Plans | Quantus V2+",
    description: "Transparent pricing from $29/mo. AI deal orchestration, commission tracking, wealth dashboards, and premium add-ons for UHNW private offices.",
    canonical: `${SITE}/pricing`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Quantus V2+ Platform",
      description: "Ultra-premium AI orchestration platform",
      offers: [
        { "@type": "Offer", name: "Starter", price: "29", priceCurrency: "USD", billingIncrement: "P1M" },
        { "@type": "Offer", name: "Professional", price: "149", priceCurrency: "USD", billingIncrement: "P1M" },
        { "@type": "Offer", name: "Teams", price: "49", priceCurrency: "USD", billingIncrement: "P1M" },
      ],
    },
  },
  "/contact": {
    title: "Contact Us — Get in Touch | Quantus V2+",
    description: "Reach the Quantus V2+ team for enterprise inquiries, partnership opportunities, or platform support.",
    canonical: `${SITE}/contact`,
  },
  "/blog": {
    title: "Insights & Intelligence Blog | Quantus V2+",
    description: "Expert analysis on AI orchestration, deal intelligence, aviation, marine, legal, finance, and ultra-luxury market trends.",
    canonical: `${SITE}/blog`,
  },
  "/case-studies": {
    title: "Case Studies — Real-World Deal Orchestration | Quantus V2+",
    description: "See how Quantus V2+ clients have orchestrated multi-million dollar deals across aviation, marine, medical, and luxury verticals.",
    canonical: `${SITE}/case-studies`,
  },
  "/enterprise": {
    title: "Enterprise Solutions — Custom AI Orchestration | Quantus V2+",
    description: "Bespoke intelligence platform deployment for family offices, private banks, and ultra-luxury organizations with dedicated support.",
    canonical: `${SITE}/enterprise`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Quantus V2+ Enterprise",
      description: "Custom AI orchestration for enterprise organizations and family offices.",
      serviceType: "Enterprise Software Platform",
    },
  },
  "/benefits": {
    title: "Platform Benefits — Why Choose Quantus V2+",
    description: "Automated deal orchestration, AI-powered vendor matching, real-time commission tracking, and 9-vertical coverage in one sovereign platform.",
    canonical: `${SITE}/benefits`,
  },
  "/guide": {
    title: "User Guide — Getting Started | Quantus V2+",
    description: "Comprehensive guide to using the Quantus V2+ platform — from onboarding to deal completion.",
    canonical: `${SITE}/guide`,
  },
  "/docs": {
    title: "API Documentation | Quantus V2+",
    description: "Technical documentation for integrating with the Quantus V2+ API, webhooks, and edge functions.",
    canonical: `${SITE}/docs`,
  },
  "/chat": {
    title: "AI Concierge — Holographic Chat | Quantus V2+",
    description: "Speak with the Quantus V2+ holographic AI concierge for strategy, analytics, and real-time market intelligence.",
    canonical: `${SITE}/chat`,
  },
  "/connect/onboarding": {
    title: "Vendor Onboarding — Stripe Connect | Quantus V2+",
    description: "Set up your Stripe connected account to receive commissions and vendor payouts through Quantus V2+.",
    canonical: `${SITE}/connect/onboarding`,
  },
  "/connect/products": {
    title: "Product Management — Marketplace | Quantus V2+",
    description: "Manage your products and pricing through the Quantus V2+ marketplace.",
    canonical: `${SITE}/connect/products`,
  },
  "/connect/storefront": {
    title: "Marketplace Storefront | Quantus V2+",
    description: "Browse and purchase premium products from vetted Quantus V2+ vendors with secure Stripe payments.",
    canonical: `${SITE}/connect/storefront`,
  },
  "/onboarding": {
    title: "Welcome — Complete Your Profile | Quantus V2+",
    description: "Complete your sovereign profile to unlock the full Quantus V2+ orchestration ecosystem.",
    canonical: `${SITE}/onboarding`,
  },
  "/recommendations": {
    title: "AI Recommendation Engine | Quantus V2+",
    description: "Proactive AI recommendations, playbooks, and risk alerts across your entire deal portfolio.",
    canonical: `${SITE}/recommendations`,
  },
  "/reset-password": {
    title: "Reset Password | Quantus V2+",
    description: "Set a new password for your Quantus V2+ account.",
    canonical: `${SITE}/reset-password`,
  },
  "/unsubscribe": {
    title: "Unsubscribe | Quantus V2+",
    description: "Manage your Quantus V2+ email preferences.",
    canonical: `${SITE}/unsubscribe`,
  },
  "/dashboard": {
    title: "Command Center — Dashboard | Quantus V2+",
    description: "Your real-time command center for deals, revenue, modules, and AI-powered intelligence across all verticals.",
    canonical: `${SITE}/dashboard`,
  },
  "/deal-engine": {
    title: "Deal Engine — AI Deal Orchestration | Quantus V2+",
    description: "End-to-end AI deal pipeline from intake to completion across aviation, marine, medical, legal, and more.",
    canonical: `${SITE}/deal-engine`,
  },
  "/wealth": {
    title: "Wealth Dashboard — Portfolio Intelligence | Quantus V2+",
    description: "Real-time net worth tracking, asset allocation, and AI-powered portfolio narratives for UHNW clients.",
    canonical: `${SITE}/wealth`,
  },
  "/quantum": {
    title: "Quantum Computing Lab | Quantus V2+",
    description: "Design, run, and analyze quantum circuits with AI-assisted circuit generation and cost optimization.",
    canonical: `${SITE}/quantum`,
  },
  "/privacy": {
    title: "Privacy Policy | Quantus V2+",
    description: "Read the Quantus V2+ privacy policy covering data protection, GDPR compliance, and information handling.",
    canonical: `${SITE}/privacy`,
  },
  "/terms": {
    title: "Terms of Service | Quantus V2+",
    description: "Read the Quantus V2+ terms of service covering platform usage, subscriptions, and user responsibilities.",
    canonical: `${SITE}/terms`,
  },
  "/auth": {
    title: "Sign In or Create Account | Quantus V2+",
    description: "Access the Quantus V2+ platform — sign in or create your account to start orchestrating deals.",
    canonical: `${SITE}/auth`,
  },
};

export function usePageSEO(path: string) {
  const seo = PAGE_SEO[path];
  if (seo) {
    useDocumentHead(seo);
  }
}
