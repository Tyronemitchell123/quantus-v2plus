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

const Index = () => {
  useDocumentHead({
    title: "Quantus A.I — Ultra-Premium Intelligence Platform",
    description: "A multi-vertical orchestration engine for UHNW clients. Aviation, medical travel, staffing, luxury lifestyle — unified in one private interface.",
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
