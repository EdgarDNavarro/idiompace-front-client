import { Composition } from "remotion";
import { HomeShowcase } from "./compositions/HomeShowcase";
import "./style.css";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="HomeShowcase"
        component={HomeShowcase}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: "IdiomPace - Learn Languages",
        }}
      />
    </>
  );
};
