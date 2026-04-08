import { lazy, Suspense } from "react";
import useDocumentHead from "@/hooks/use-document-head";
import HeroSection from "@/components/landing/HeroSection";
import ValueProposition from "@/components/landing/ValueProposition";

const SocialProof = lazy(() => import("@/components/landing/SocialProof"));
const ModuleShowcase = lazy(() => import("@/components/landing/ModuleShowcase"));
const CinematicStrip = lazy(() => import("@/components/landing/CinematicStrip"));
const MembershipTiers = lazy(() => import("@/components/landing/MembershipTiers"));
const HowItWorks = lazy(() => import("@/components/landing/HowItWorks"));
const PartnerEcosystem = lazy(() => import("@/components/landing/PartnerEcosystem"));
const Testimonials = lazy(() => import("@/components/landing/Testimonials"));
const FinalCTA = lazy(() => import("@/components/landing/FinalCTA"));
const LeadCapture = lazy(() => import("@/components/landing/LeadCapture"));
const LiveActivityFeed = lazy(() => import("@/components/landing/LiveActivityFeed"));
const LandingFAQ = lazy(() => import("@/components/landing/LandingFAQ"));
const StickyEngagementBar = lazy(() => import("@/components/landing/StickyEngagementBar"));

const Index = () => {
  useDocumentHead({
    title: "Quantus V2+ — AI Deal Orchestration for UHNW Clients & Private Offices",
    description: "AI-powered deal orchestration across aviation, marine, medical, legal, finance, staffing & lifestyle. The sovereign intelligence platform trusted by UHNW clients and family offices worldwide.",
    canonical: "https://quantus-v2plus.lovable.app/",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Quantus V2+",
      url: "https://quantus-v2plus.lovable.app",
      logo: "https://quantus-v2plus.lovable.app/favicon.png",
      description: "Ultra-premium AI orchestration platform unifying 9 verticals for UHNW clients, private offices, and elite operators.",
      sameAs: [],
      contactPoint: { "@type": "ContactPoint", contactType: "sales", url: "https://quantus-v2plus.lovable.app/contact" },
    },
  });

  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <div className="luxury-divider" />
      <ValueProposition />
      <Suspense fallback={null}>
        <div className="luxury-divider" />
        <ModuleShowcase />
        <div className="luxury-divider" />
        <CinematicStrip />
        <div className="luxury-divider" />
        <LiveActivityFeed />
        <div className="luxury-divider" />
        <MembershipTiers />
        <div className="luxury-divider" />
        <HowItWorks />
        <div className="luxury-divider" />
        <PartnerEcosystem />
        <div className="luxury-divider" />
        <Testimonials />
        <div className="luxury-divider" />
        <SocialProof />
        <div className="luxury-divider" />
        <LandingFAQ />
        <div className="luxury-divider" />
        <FinalCTA />
        <LeadCapture />
        <StickyEngagementBar />
      </Suspense>
    </main>
  );
};

export default Index;
