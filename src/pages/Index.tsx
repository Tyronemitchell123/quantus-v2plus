import useDocumentHead from "@/hooks/use-document-head";
import HeroSection from "@/components/landing/HeroSection";
import ValueProposition from "@/components/landing/ValueProposition";
import ModuleShowcase from "@/components/landing/ModuleShowcase";
import CinematicStrip from "@/components/landing/CinematicStrip";
import MembershipTiers from "@/components/landing/MembershipTiers";
import HowItWorks from "@/components/landing/HowItWorks";
import PartnerEcosystem from "@/components/landing/PartnerEcosystem";
import Testimonials from "@/components/landing/Testimonials";
import FinalCTA from "@/components/landing/FinalCTA";
import LeadCapture from "@/components/landing/LeadCapture";

const Index = () => {
  useDocumentHead({
    title: "Quantus V2+ — Ultra-Premium Intelligence Platform",
    description: "A multi-vertical orchestration engine for UHNW clients. Aviation, medical travel, staffing, luxury lifestyle — unified in one private interface.",
    canonical: "https://quantus-loom.lovable.app/",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Quantus V2+",
      url: "https://quantus-loom.lovable.app",
      logo: "https://quantus-loom.lovable.app/favicon.png",
      description: "Ultra-premium AI orchestration platform for UHNW clients across aviation, medical, staffing, and lifestyle verticals.",
      sameAs: [],
      contactPoint: { "@type": "ContactPoint", contactType: "sales", url: "https://quantus-loom.lovable.app/contact" },
    },
  });

  return (
    <main className="min-h-screen bg-background">
      <HeroSection />
      <div className="luxury-divider" />
      <ValueProposition />
      <div className="luxury-divider" />
      <ModuleShowcase />
      <div className="luxury-divider" />
      <CinematicStrip />
      <div className="luxury-divider" />
      <MembershipTiers />
      <div className="luxury-divider" />
      <HowItWorks />
      <div className="luxury-divider" />
      <PartnerEcosystem />
      <div className="luxury-divider" />
      <Testimonials />
      <div className="luxury-divider" />
      <FinalCTA />
    </main>
  );
};

export default Index;
