import { AbsoluteFill, Sequence } from "remotion";
import { Scene1 } from "./scenes/Scene1";
import { Scene2 } from "./scenes/Scene2";
import { Scene3 } from "./scenes/Scene3";
import { Scene4 } from "./scenes/Scene4";
import { Scene5 } from "./scenes/Scene5";
import { Scene6 } from "./scenes/Scene6";

export const MainVideo = () => {
  return (
    <AbsoluteFill>
      {/* Scene 1: 0-5s (0-150 frames) — Restaurant table, QR scanning */}
      <Sequence from={0} durationInFrames={150}>
        <Scene1 />
      </Sequence>

      {/* Scene 2: 5-20s (150-600 frames) — Client menu, cart, payment */}
      <Sequence from={150} durationInFrames={450}>
        <Scene2 />
      </Sequence>

      {/* Scene 3: 20-30s (600-900 frames) — Owner notification, live orders */}
      <Sequence from={600} durationInFrames={300}>
        <Scene3 />
      </Sequence>

      {/* Scene 4: 30-45s (900-1350 frames) — Dashboards, analytics */}
      <Sequence from={900} durationInFrames={450}>
        <Scene4 />
      </Sequence>

      {/* Scene 5: 45-55s (1350-1650 frames) — Quick cuts, rotation */}
      <Sequence from={1350} durationInFrames={300}>
        <Scene5 />
      </Sequence>

      {/* Scene 6: 55-60s (1650-1800 frames) — Logo, CTA */}
      <Sequence from={1650} durationInFrames={150}>
        <Scene6 />
      </Sequence>
    </AbsoluteFill>
  );
};
