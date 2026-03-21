import useDocumentHead from "@/hooks/use-document-head";
import AboutHero from "@/components/about/AboutHero";
import AboutStats from "@/components/about/AboutStats";
import AboutMission from "@/components/about/AboutMission";
import AboutValues from "@/components/about/AboutValues";
import AboutTimeline from "@/components/about/AboutTimeline";
import AboutCTA from "@/components/about/AboutCTA";

const About = () => {
  useDocumentHead({
    title: "About QUANTUS AI — Autonomous Quantum Intelligence for Enterprise",
    description:
      "QUANTUS AI builds fully autonomous quantum-enhanced systems for enterprise. Zero human operators, 10¹⁸ ops/sec, protecting $2.4B+ in client revenue across 14 countries.",
    canonical: "https://quantus-loom.lovable.app/about",
  });

  return (
    <div className="pt-24">
      <AboutHero />
      <AboutStats />
      <AboutMission />
      <AboutValues />
      <AboutTimeline />
      <AboutCTA />
    </div>
  );
};

export default About;
