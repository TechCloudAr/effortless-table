import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadBody } from "@remotion/google-fonts/DMSans";
import { PRIMARY, BG_DARK } from "../components/constants";

const { fontFamily: heading } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });
const { fontFamily: body } = loadBody("normal", { weights: ["400", "500"], subsets: ["latin"] });

export const Scene6: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 150 frames (55-60s = 5s)
  const logoSpring = spring({ frame: frame - 5, fps, config: { damping: 12, stiffness: 80 } });
  const logoScale = interpolate(logoSpring, [0, 1], [0.5, 1]);
  const logoOp = interpolate(logoSpring, [0, 1], [0, 1]);

  const taglineOp = interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const taglineY = interpolate(
    spring({ frame: frame - 30, fps, config: { damping: 20, stiffness: 100 } }),
    [0, 1], [30, 0]
  );

  const ctaOp = interpolate(frame, [55, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const glowPulse = Math.sin(frame * 0.06) * 0.3 + 0.7;

  // Fade to black at end
  const fadeOut = interpolate(frame, [130, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: BG_DARK }}>
      {/* Ambient glow */}
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(600px circle at 50% 45%, ${PRIMARY}${Math.round(glowPulse * 15).toString(16).padStart(2, "0")}, transparent)`,
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: `radial-gradient(400px circle at 50% 55%, #EA580C08, transparent)`,
      }} />

      {/* Center content */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        {/* Logo mark */}
        <div style={{
          opacity: logoOp, transform: `scale(${logoScale})`,
          display: "flex", alignItems: "center", gap: 16, marginBottom: 32,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: `linear-gradient(135deg, ${PRIMARY}, #EA580C)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32,
            boxShadow: `0 10px 40px ${PRIMARY}44`,
          }}>
            🍽️
          </div>
          <div style={{
            fontFamily: heading, fontSize: 52, fontWeight: 700, color: "white",
          }}>
            Mesa <span style={{ color: PRIMARY }}>Digital</span>
          </div>
        </div>

        {/* Tagline */}
        <div style={{
          opacity: taglineOp, transform: `translateY(${taglineY}px)`,
          fontFamily: body, fontSize: 24, color: "#A8A29E",
          textAlign: "center" as const, maxWidth: 500, lineHeight: 1.5,
        }}>
          Tu restaurante, potenciado por datos.
        </div>

        {/* CTA */}
        <div style={{
          opacity: ctaOp, marginTop: 40,
          padding: "14px 40px",
          background: `linear-gradient(135deg, ${PRIMARY}, #EA580C)`,
          borderRadius: 16,
          fontFamily: heading, fontSize: 20, fontWeight: 700, color: "white",
          boxShadow: `0 8px 30px ${PRIMARY}44`,
        }}>
          mesadigital.app
        </div>
      </div>

      {/* Fade out */}
      <div style={{
        position: "absolute", inset: 0, background: BG_DARK,
        opacity: fadeOut,
      }} />
    </AbsoluteFill>
  );
};
