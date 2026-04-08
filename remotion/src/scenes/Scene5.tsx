import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadBody } from "@remotion/google-fonts/DMSans";
import { PRIMARY, GREEN } from "../components/constants";

const { fontFamily: heading } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });
const { fontFamily: body } = loadBody("normal", { weights: ["400", "500"], subsets: ["latin"] });

export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 300 frames (45-55s = 10s)
  const bgScale = interpolate(frame, [0, 300], [1.08, 1.0], { extrapolateRight: "clamp" });

  // Quick cut rhythm: 3 text beats
  const beat1Op = interpolate(frame, [10, 30, 80, 100], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const beat1Y = interpolate(
    spring({ frame: frame - 10, fps, config: { damping: 15, stiffness: 120 } }),
    [0, 1], [50, 0]
  );

  const beat2Op = interpolate(frame, [100, 120, 180, 200], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const beat2Y = interpolate(
    spring({ frame: frame - 100, fps, config: { damping: 15, stiffness: 120 } }),
    [0, 1], [50, 0]
  );

  const beat3Op = interpolate(frame, [200, 220, 280, 300], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const beat3Y = interpolate(
    spring({ frame: frame - 200, fps, config: { damping: 15, stiffness: 120 } }),
    [0, 1], [50, 0]
  );

  return (
    <AbsoluteFill>
      {/* Background */}
      <div style={{ position: "absolute", inset: -40, transform: `scale(${bgScale})` }}>
        <Img src={staticFile("images/restaurant-busy.jpg")} style={{ width: "110%", height: "110%", objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(12,10,9,0.8), rgba(12,10,9,0.6))" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.5) 100%)" }} />

      {/* Center text — kinetic beats */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        {/* Beat 1 */}
        <div style={{
          position: "absolute",
          opacity: beat1Op, transform: `translateY(${beat1Y}px)`,
          fontFamily: heading, fontSize: 64, fontWeight: 700, color: "white",
          textAlign: "center" as const, lineHeight: 1.2,
          textShadow: "0 4px 40px rgba(0,0,0,0.5)",
        }}>
          Más rotación.
        </div>

        {/* Beat 2 */}
        <div style={{
          position: "absolute",
          opacity: beat2Op, transform: `translateY(${beat2Y}px)`,
          fontFamily: heading, fontSize: 64, fontWeight: 700, color: "white",
          textAlign: "center" as const, lineHeight: 1.2,
          textShadow: "0 4px 40px rgba(0,0,0,0.5)",
        }}>
          Menos errores.
        </div>

        {/* Beat 3 */}
        <div style={{
          position: "absolute",
          opacity: beat3Op, transform: `translateY(${beat3Y}px)`,
          fontFamily: heading, fontSize: 64, fontWeight: 700,
          textAlign: "center" as const, lineHeight: 1.2,
          textShadow: "0 4px 40px rgba(0,0,0,0.5)",
        }}>
          <span style={{ color: PRIMARY }}>Sin mozos</span>
          <br />
          <span style={{ color: "white" }}>intermediarios.</span>
        </div>
      </div>

      {/* Bottom accent line */}
      <div style={{
        position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)",
        display: "flex", gap: 12, alignItems: "center",
      }}>
        {["✓ Implementación en un día", "✓ Sin hardware", "✓ Solo un QR"].map((t, i) => {
          const op = interpolate(frame, [220 + i * 15, 240 + i * 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={t} style={{
              opacity: op, fontSize: 14, color: "rgba(255,255,255,0.7)",
              fontFamily: body, fontWeight: 500,
            }}>
              {t}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
