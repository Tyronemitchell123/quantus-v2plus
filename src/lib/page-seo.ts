/**
 * Comprehensive SEO metadata for all public-facing pages.
 * Updated 2026-04-08 — expanded keywords, long-tail targeting, JSON-LD.
 */
import useDocumentHead from "@/hooks/use-document-head";

const SITE = "https://quantus-v2plus.lovable.app";

export const PAGE_SEO: Record<string, { title: string; description: string; canonical?: string; jsonLd?: Record<string, unknown> }> = {
  "/": {
    title: "Quantus V2+ — AI Deal Orchestration for UHNW Clients & Private Offices",
    description: "AI-powered deal orchestration across aviation, marine, medical, legal, finance, staffing & lifestyle. The sovereign intelligence platform trusted by UHNW clients and family offices worldwide.",
    canonical: `${SITE}/`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Quantus V2+",
      url: SITE,
      logo: `${SITE}/favicon.png`,
      description: "Ultra-premium AI orchestration platform unifying 9 verticals for UHNW clients, private offices, and elite operators.",
      sameAs: [],
      contactPoint: { "@type": "ContactPoint", contactType: "sales", url: `${SITE}/contact` },
      foundingDate: "2025",
      knowsAbout: [
        "AI Deal Orchestration", "Private Aviation Brokerage", "Luxury Concierge",
        "Medical Travel Coordination", "UHNW Wealth Management", "Marine & Yachts",
      ],
    },
  },
  "/about": {
    title: "About Quantus V2+ — Sovereign AI Intelligence for Elite Operations",
    description: "Built for family offices, private banks, and UHNW individuals. Quantus V2+ orchestrates multi-million dollar deals across aviation, marine, legal, finance & lifestyle verticals.",
    canonical: `${SITE}/about`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      name: "About Quantus V2+",
      description: "Sovereign AI intelligence platform for elite operations across 9 verticals.",
      mainEntity: { "@type": "Organization", name: "Quantus V2+", url: SITE },
    },
  },
  "/services": {
    title: "AI Deal Orchestration Services — 9 Verticals | Quantus V2+",
    description: "End-to-end AI deal orchestration: private aviation, marine charters, medical travel, legal compliance, finance advisory, staffing, logistics, partnerships & luxury lifestyle.",
    canonical: `${SITE}/services`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Quantus V2+ Deal Orchestration",
      provider: { "@type": "Organization", name: "Quantus V2+" },
      description: "AI-powered deal sourcing, vendor outreach, negotiation, and completion across 9 premium verticals.",
      serviceType: "Business Intelligence Platform",
      areaServed: { "@type": "Place", name: "Worldwide" },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Service Verticals",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Private Aviation" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Marine & Yachts" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Medical Travel" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Legal & Compliance" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Finance & Advisory" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Staffing & Crew" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Logistics & Transport" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Partnerships & Brokerage" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Luxury Lifestyle" } },
        ],
      },
    },
  },
  "/pricing": {
    title: "Pricing Plans — From $29/mo for AI Deal Intelligence | Quantus V2+",
    description: "Transparent pricing for AI deal orchestration. Starter $29/mo, Professional $149/mo, Teams $49/seat. Commission tracking, wealth dashboards & premium add-ons for UHNW offices.",
    canonical: `${SITE}/pricing`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Quantus V2+ Platform",
      description: "Ultra-premium AI orchestration platform for deal intelligence and commission tracking",
      brand: { "@type": "Brand", name: "Quantus V2+" },
      offers: [
        { "@type": "Offer", name: "Starter", price: "29", priceCurrency: "USD", billingIncrement: "P1M", url: `${SITE}/pricing` },
        { "@type": "Offer", name: "Professional", price: "149", priceCurrency: "USD", billingIncrement: "P1M", url: `${SITE}/pricing` },
        { "@type": "Offer", name: "Teams", price: "49", priceCurrency: "USD", billingIncrement: "P1M", url: `${SITE}/pricing` },
      ],
    },
  },
  "/contact": {
    title: "Contact Quantus V2+ — Enterprise & Partnership Enquiries",
    description: "Get in touch with the Quantus V2+ team for enterprise deployments, partnership opportunities, or concierge support. Response within 24 hours.",
    canonical: `${SITE}/contact`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: "Contact Quantus V2+",
      url: `${SITE}/contact`,
      mainEntity: {
        "@type": "Organization",
        name: "Quantus V2+",
        contactPoint: { "@type": "ContactPoint", contactType: "sales", url: `${SITE}/contact` },
      },
    },
  },
  "/blog": {
    title: "AI & Luxury Market Intelligence Blog | Quantus V2+",
    description: "Expert insights on AI deal orchestration, private aviation trends, UHNW wealth strategies, medical travel, and luxury market analysis.",
    canonical: `${SITE}/blog`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "Quantus V2+ Insights",
      url: `${SITE}/blog`,
      publisher: { "@type": "Organization", name: "Quantus V2+" },
    },
  },
  "/case-studies": {
    title: "Case Studies — Multi-Million Dollar Deal Orchestration | Quantus V2+",
    description: "Real-world results: how UHNW clients orchestrated aviation, marine, medical, and luxury deals with AI-powered intelligence and vendor matching.",
    canonical: `${SITE}/case-studies`,
  },
  "/enterprise": {
    title: "Enterprise AI Orchestration for Family Offices | Quantus V2+",
    description: "Bespoke AI platform deployment for family offices, private banks, and UHNW organizations. Dedicated infrastructure, white-label options, and 24/7 support.",
    canonical: `${SITE}/enterprise`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Service",
      name: "Quantus V2+ Enterprise",
      description: "Custom AI orchestration for enterprise organizations, family offices, and private banks.",
      serviceType: "Enterprise Software Platform",
      areaServed: { "@type": "Place", name: "Worldwide" },
    },
  },
  "/benefits": {
    title: "Why Quantus V2+ — AI Deal Automation & Commission Tracking",
    description: "Automated deal orchestration, AI vendor matching, real-time commission tracking, GDPR compliance, and 9-vertical coverage. See why elite operators choose Quantus.",
    canonical: `${SITE}/benefits`,
  },
  "/guide": {
    title: "Getting Started Guide — Quantus V2+ Platform Walkthrough",
    description: "Step-by-step guide to the Quantus V2+ platform: onboarding, deal creation, vendor outreach, commission tracking, and advanced AI features.",
    canonical: `${SITE}/guide`,
  },
  "/docs": {
    title: "API Documentation & Developer Guide | Quantus V2+",
    description: "Technical documentation for the Quantus V2+ API — webhooks, edge functions, deal pipeline endpoints, and integration guides.",
    canonical: `${SITE}/docs`,
  },
  "/auth": {
    title: "Sign In or Apply for Membership | Quantus V2+",
    description: "Access the Quantus V2+ platform. Sign in to your private intelligence dashboard or apply for membership with full KYC verification.",
    canonical: `${SITE}/auth`,
  },
  "/waiting-list": {
    title: "Join the Waiting List — Early Access to Quantus V2+",
    description: "Reserve your spot for early access to the Quantus V2+ AI orchestration platform. Priority onboarding for UHNW clients and family offices.",
    canonical: `${SITE}/waiting-list`,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Quantus V2+ Waiting List",
      description: "Apply for early access to the ultra-premium AI orchestration platform.",
      url: `${SITE}/waiting-list`,
    },
  },
  "/vendor-register": {
    title: "Vendor Registration — Become a Verified Service Provider | Quantus V2+",
    description: "Register as a verified vendor to receive deal opportunities, invoices, and commissions through the Quantus V2+ platform. Aviation, medical, legal & more.",
    canonical: `${SITE}/vendor-register`,
  },
  "/partner-with-us": {
    title: "Partner With Quantus V2+ — Strategic Alliance Opportunities",
    description: "Join the Quantus V2+ partner ecosystem. Brokerage, referral, and white-label partnership opportunities across 9 premium verticals.",
    canonical: `${SITE}/partner-with-us`,
  },
  "/kyc": {
    title: "Identity Verification (KYC) | Quantus V2+",
    description: "Complete your KYC verification to unlock high-value deal processing and priority access on the Quantus V2+ platform.",
    canonical: `${SITE}/kyc`,
  },
  "/chat": {
    title: "AI Concierge — Real-Time Intelligence Chat | Quantus V2+",
    description: "Chat with the Quantus V2+ AI concierge for deal strategy, market intelligence, vendor recommendations, and real-time analytics.",
    canonical: `${SITE}/chat`,
  },
  "/dashboard": {
    title: "Command Center — Live Deal Dashboard | Quantus V2+",
    description: "Your real-time command center: deal pipeline, revenue KPIs, AI-powered intelligence, and module access across all verticals.",
    canonical: `${SITE}/dashboard`,
  },
  "/deals": {
    title: "Deal Engine — AI Pipeline Management | Quantus V2+",
    description: "Manage your full deal pipeline from intake to completion. AI classification, vendor matching, negotiation, and automated document signing.",
    canonical: `${SITE}/deals`,
  },
  "/wealth": {
    title: "Wealth Dashboard — Portfolio Intelligence for UHNW | Quantus V2+",
    description: "Real-time net worth tracking, multi-asset allocation, and AI-powered portfolio narratives built for UHNW clients and family offices.",
    canonical: `${SITE}/wealth`,
  },
  "/quantum": {
    title: "Quantum Computing Lab — Circuit Design & Analysis | Quantus V2+",
    description: "Design, run, and analyze quantum circuits with AI-assisted generation, real-time cost estimation, and multi-device support.",
    canonical: `${SITE}/quantum`,
  },
  "/connect/onboarding": {
    title: "Vendor Payment Setup — Commission Payouts | Quantus V2+",
    description: "Set up your payment account to receive commissions and vendor payouts securely through the Quantus V2+ platform.",
    canonical: `${SITE}/connect/onboarding`,
  },
  "/connect/products": {
    title: "Product Management — Marketplace Listings | Quantus V2+",
    description: "Manage your products, pricing, and inventory through the Quantus V2+ marketplace ecosystem.",
    canonical: `${SITE}/connect/products`,
  },
  "/connect/storefront": {
    title: "Premium Marketplace — Vetted Vendor Products | Quantus V2+",
    description: "Browse and purchase premium products from verified Quantus V2+ vendors with secure payments and buyer protection.",
    canonical: `${SITE}/connect/storefront`,
  },
  "/onboarding": {
    title: "Complete Your Profile — Platform Setup | Quantus V2+",
    description: "Complete your sovereign profile to unlock the full Quantus V2+ orchestration ecosystem and personalized AI recommendations.",
    canonical: `${SITE}/onboarding`,
  },
  "/recommendations": {
    title: "AI Recommendations — Smart Deal Playbooks | Quantus V2+",
    description: "Proactive AI recommendations, deal playbooks, risk alerts, and opportunity scoring across your entire portfolio.",
    canonical: `${SITE}/recommendations`,
  },
  "/reset-password": {
    title: "Reset Password | Quantus V2+",
    description: "Set a new password for your Quantus V2+ account securely.",
    canonical: `${SITE}/reset-password`,
  },
  "/unsubscribe": {
    title: "Manage Email Preferences | Quantus V2+",
    description: "Update or unsubscribe from Quantus V2+ email communications.",
    canonical: `${SITE}/unsubscribe`,
  },
  "/privacy": {
    title: "Privacy Policy — GDPR Compliant | Quantus V2+",
    description: "Read the Quantus V2+ privacy policy. UK GDPR, EU GDPR, and PDPA compliant data handling with regional data residency options.",
    canonical: `${SITE}/privacy`,
  },
  "/terms": {
    title: "Terms of Service | Quantus V2+",
    description: "Quantus V2+ terms of service covering platform usage, subscriptions, commission structures, and user responsibilities.",
    canonical: `${SITE}/terms`,
  },
};

export function usePageSEO(path: string) {
  const seo = PAGE_SEO[path];
  if (seo) {
    useDocumentHead(seo);
  }
}
