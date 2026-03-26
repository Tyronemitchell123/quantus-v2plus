import { motion } from "framer-motion";
import videoLifestyleAsset from "@/assets/video-lifestyle.mp4.asset.json";

const CinematicStrip = () => (
  <section className="relative h-[50vh] overflow-hidden">
    <video
      autoPlay loop muted playsInline
      className="absolute inset-0 w-full h-full object-cover"
    >
      <source src={videoLifestyleAsset.url} type="video/mp4" />
    </video>
    <div className="absolute inset-0 bg-background/65" />
    <div className="relative z-10 flex items-center justify-center h-full">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="text-center px-6"
      >
        <p className="font-display text-2xl sm:text-3xl md:text-5xl font-medium italic text-foreground leading-snug">
          Luxury is not noise.
          <br />
          <span className="text-primary">Luxury is precision.</span>
        </p>
      </motion.div>
    </div>
  </section>
);

export default CinematicStrip;
