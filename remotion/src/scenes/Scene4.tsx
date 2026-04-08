import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadBody } from "@remotion/google-fonts/DMSans";
import { PhoneFrame } from "../components/PhoneFrame";
import { PRIMARY, BG_DARK, CARD_BG, MUTED, GREEN } from "../components/constants";

const { fontFamily: heading } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });
const { fontFamily: body } = loadBody("normal", { weights: ["400", "500", "700"], subsets: ["latin"] });

function DashboardPhoneScreen({ progress, scrollY }: { progress: number; scrollY: number }) {
  // Revenue chart bars
  const bars = [65, 45, 80, 55, 90, 70, 95, 60, 85, 75, 100, 88];
  const months = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

  // Top items
  const topItems = [
    { name: "Smash Burger", sold: 342, revenue: "$2.3M", pct: 95 },
    { name: "Pizza Muzza", sold: 278, revenue: "$1.4M", pct: 78 },
    { name: "Papas Trufadas", sold: 210, revenue: "$798K", pct: 62 },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#0C0A09" }}>
      <div style={{ padding: "44px 16px 12px" }}>
        <div style={{ fontFamily: heading, fontSize: 13, fontWeight: 700, color: "#A8A29E" }}>Dashboard</div>
        <div style={{ fontFamily: heading, fontSize: 18, fontWeight: 700, color: "white", marginTop: 4 }}>
          📊 Inteligencia del menú
        </div>
      </div>

      <div style={{ padding: "0 14px", transform: `translateY(${-scrollY}px)` }}>
        {/* Revenue card */}
        <div style={{
          opacity: interpolate(progress, [0, 0.15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          background: "#1C1917", borderRadius: 14, padding: 14, marginBottom: 10,
          border: "1px solid #292524",
        }}>
          <div style={{ fontSize: 11, color: MUTED, fontFamily: body }}>Ventas del mes</div>
          <div style={{ fontFamily: heading, fontSize: 24, fontWeight: 700, color: "white", marginTop: 4 }}>
            $4.2M
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
            <span style={{ fontSize: 10, color: GREEN, fontWeight: 700 }}>↑ 23%</span>
            <span style={{ fontSize: 10, color: MUTED }}>vs mes anterior</span>
          </div>

          {/* Mini chart */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, marginTop: 12, height: 50 }}>
            {bars.map((h, i) => {
              const barH = interpolate(progress, [0.1 + i * 0.02, 0.2 + i * 0.02], [0, h * 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <div style={{
                    width: "100%", height: barH, borderRadius: 3,
                    background: i === 11 ? PRIMARY : i >= 9 ? `${PRIMARY}88` : "#292524",
                  }} />
                  <span style={{ fontSize: 6, color: MUTED }}>{months[i]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top items */}
        <div style={{
          opacity: interpolate(progress, [0.3, 0.45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          background: "#1C1917", borderRadius: 14, padding: 14, marginBottom: 10,
          border: "1px solid #292524",
        }}>
          <div style={{ fontSize: 11, color: MUTED, fontFamily: body, marginBottom: 10 }}>Platos más rentables</div>
          {topItems.map((item, i) => {
            const barW = interpolate(progress, [0.35 + i * 0.08, 0.5 + i * 0.08], [0, item.pct], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontFamily: heading, fontSize: 11, fontWeight: 600, color: "white" }}>{item.name}</span>
                  <span style={{ fontSize: 10, color: PRIMARY, fontWeight: 700, fontFamily: heading }}>{item.revenue}</span>
                </div>
                <div style={{ height: 6, background: "#292524", borderRadius: 3 }}>
                  <div style={{ height: "100%", width: `${barW}%`, background: `linear-gradient(90deg, ${PRIMARY}, #EA580C)`, borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 9, color: MUTED, marginTop: 2 }}>{item.sold} vendidos</div>
              </div>
            );
          })}
        </div>

        {/* Table rotation */}
        <div style={{
          opacity: interpolate(progress, [0.55, 0.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          background: "#1C1917", borderRadius: 14, padding: 14,
          border: "1px solid #292524",
        }}>
          <div style={{ fontSize: 11, color: MUTED, fontFamily: body, marginBottom: 8 }}>Rotación de mesas</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
              const isOccupied = [1, 3, 5, 7].includes(n);
              return (
                <div key={n} style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: isOccupied ? `${GREEN}22` : "#292524",
                  border: `1px solid ${isOccupied ? GREEN + "44" : "#3F3F46"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, fontFamily: heading,
                  color: isOccupied ? GREEN : MUTED,
                }}>
                  {n}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 450 frames (30-45s = 15s)
  const dashProgress = interpolate(frame, [20, 420], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const scrollY = interpolate(frame, [150, 350], [0, 200], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const phoneSpring = spring({ frame, fps, config: { damping: 18, stiffness: 90 } });
  const phoneScale = interpolate(phoneSpring, [0, 1], [0.9, 1]);
  const floatY = Math.sin(frame * 0.035) * 5;

  const glowX = interpolate(frame, [0, 450], [0, 360]);
  const bgGlow = `radial-gradient(700px circle at ${60 + Math.sin(glowX * 0.015) * 15}% ${40 + Math.cos(glowX * 0.02) * 10}%, ${PRIMARY}12, transparent)`;

  const titleSpring = spring({ frame: frame - 5, fps, config: { damping: 20, stiffness: 100 } });

  // Text caption that appears mid-scene
  const captionOp = interpolate(frame, [200, 230, 400, 430], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const captionY = interpolate(frame, [200, 230], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: BG_DARK }}>
      <div style={{ position: "absolute", inset: 0, background: bgGlow }} />

      {/* Phone on left side */}
      <div style={{
        position: "absolute", left: 200, top: "50%",
        transform: `translateY(calc(-50% + ${floatY}px))`,
      }}>
        <PhoneFrame scale={phoneScale}>
          <DashboardPhoneScreen progress={dashProgress} scrollY={scrollY} />
        </PhoneFrame>
      </div>

      {/* Right side text */}
      <div style={{ position: "absolute", right: 100, top: "50%", transform: "translateY(-50%)", maxWidth: 550, textAlign: "right" as const }}>
        <div style={{
          opacity: interpolate(titleSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`,
          fontFamily: heading, fontSize: 14, fontWeight: 700,
          color: PRIMARY, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 16,
        }}>
          Inteligencia en tiempo real
        </div>
        <div style={{
          opacity: interpolate(titleSpring, [0, 1], [0, 1]),
          transform: `translateY(${interpolate(titleSpring, [0, 1], [40, 0])}px)`,
          fontFamily: heading, fontSize: 44, fontWeight: 700, color: "white", lineHeight: 1.2,
        }}>
          Cada pedido se convierte
          <br />
          <span style={{ color: PRIMARY }}>en dato al instante</span>
        </div>
        <div style={{
          opacity: interpolate(frame, [30, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          fontFamily: body, fontSize: 18, color: "#A8A29E", marginTop: 14, lineHeight: 1.5,
        }}>
          Ventas, rentabilidad, rotación de mesas.
          <br />
          Todo en tu celular.
        </div>

        {/* Stats row */}
        <div style={{
          opacity: captionOp, transform: `translateY(${captionY}px)`,
          display: "flex", gap: 24, marginTop: 40, justifyContent: "flex-end",
        }}>
          {[
            { label: "Ventas hoy", value: "$342K" },
            { label: "Pedidos", value: "47" },
            { label: "Ticket promedio", value: "$7.2K" },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" as const }}>
              <div style={{ fontFamily: heading, fontSize: 28, fontWeight: 700, color: "white" }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
