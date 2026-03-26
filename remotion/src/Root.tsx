import { Composition } from "remotion";
import { AboutHeroVideo } from "./AboutHeroVideo";

export const RemotionRoot = () => (
  <>
    <Composition
      id="about-hero"
      component={AboutHeroVideo}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
