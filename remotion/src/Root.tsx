import { Composition } from "remotion";
import { AboutHeroVideo } from "./AboutHeroVideo";
import { HomepageHeroVideo } from "./HomepageHeroVideo";
import { ShowcaseVideo } from "./ShowcaseVideo";

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
    <Composition
      id="homepage-hero"
      component={HomepageHeroVideo}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="showcase"
      component={ShowcaseVideo}
      durationInFrames={630}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
