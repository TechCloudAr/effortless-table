import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadBody } from "@remotion/google-fonts/DMSans";
import { PRIMARY } from "../components/constants";

const { fontFamily: heading } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });
const { fontFamily: body } = loadBody("normal", { weights: ["400", "500"], subsets: ["latin"] });

export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgScale = interpolate(frame, [0, 150], [1.1, 1.0], { extrapolateRight: "clamp" });
  const bgX = interpolate(frame, [0, 150], [-20, 0], { extrapolateRight: "clamp" });

  const fadeIn = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" });
  const scanLine = interpolate(frame, [40, 120], [0, 1], { extrapolateRight: "clamp" });

  const titleY = interpolate(
    spring({ frame: frame - 20, fps, config: { damping: 20, stiffness: 100 } }),
    [0, 1], [60, 0]
  );
  const titleOp = interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const subtitleOp = interpolate(frame, [50, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const qrPulse = Math.sin(frame * 0.1) * 0.05 + 1;

  const vignetteOp = 0.5;

  return (
    <AbsoluteFill>
      {/* Background image with slow zoom */}
      <div style={{ position: "absolute", inset: -40, transform: `scale(${bgScale}) translateX(${bgX}px)` }}>
        <Img src={staticFile("images/restaurant-table.jpg")} style={{ width: "110%", height: "110%", objectFit: "cover" }} />
      </div>

      {/* Warm overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(12,10,9,0.4), rgba(12,10,9,0.7))" }} />

      {/* Vignette */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)", opacity: vignetteOp }} />

      {/* QR scan effect */}
      <div style={{
        position: "absolute",
        right: 320,
        top: "50%",
        transform: `translateY(-50%) scale(${qrPulse})`,
        opacity: interpolate(scanLine, [0, 0.3, 0.8, 1], [0, 1, 1, 0.6]),
        width: 180,
        height: 180,
        border: `3px solid ${PRIMARY}`,
        borderRadius: 20,
        boxShadow: `0 0 40px ${PRIMARY}44, inset 0 0 40px ${PRIMARY}11`,
      }}>
        {/* Scanning line */}
        <div style={{
          position: "absolute",
          left: 10,
          right: 10,
          top: `${interpolate(scanLine, [0, 1], [10, 90])}%`,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${PRIMARY}, transparent)`,
          boxShadow: `0 0 20px ${PRIMARY}`,
        }} />
      </div>

      {/* Text overlay left */}
      <div style={{ position: "absolute", left: 100, bottom: 140, maxWidth: 600 }}>
        <div style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          fontFamily: heading,
          fontSize: 56,
          fontWeight: 700,
          color: "white",
          lineHeight: 1.15,
          textShadow: "0 4px 30px rgba(0,0,0,0.5)",
        }}>
          El cliente escanea.
          <br />
          <span style={{ color: PRIMARY }}>La magia empieza.</span>
        </div>
        <div style={{
          opacity: subtitleOp,
          fontFamily: body,
          fontSize: 20,
          color: "rgba(255,255,255,0.7)",
          marginTop: 16,
          textShadow: "0 2px 10px rgba(0,0,0,0.5)",
        }}>
          Un QR por mesa. Sin apps. Sin esperas.
        </div>
      </div>

      {/* Fade in from black */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "#0C0A09",
        opacity: interpolate(frame, [0, 20], [1, 0], { extrapolateRight: "clamp" }),
      }} />
    </AbsoluteFill>
  );
};
