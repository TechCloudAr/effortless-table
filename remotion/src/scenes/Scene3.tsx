import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadBody } from "@remotion/google-fonts/DMSans";
import { PhoneFrame } from "../components/PhoneFrame";
import { PRIMARY, CARD_BG, MUTED, GREEN } from "../components/constants";

const { fontFamily: heading } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });
const { fontFamily: body } = loadBody("normal", { weights: ["400", "500", "700"], subsets: ["latin"] });

function OwnerPhoneScreen({ progress }: { progress: number }) {
  const notifSlide = interpolate(progress, [0, 0.2], [100, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const notifOp = interpolate(progress, [0, 0.15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const orders = [
    { mesa: 3, items: "2x Burger, 1x Pizza, 1x Papas", total: "$26.448", time: "Ahora", isNew: true },
    { mesa: 7, items: "1x Lomo, 2x Cerveza", total: "$14.200", time: "3 min", isNew: false },
    { mesa: 1, items: "3x Empanadas, 1x Fernet", total: "$11.800", time: "8 min", isNew: false },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#FFFAF5" }}>
      <div style={{
        background: `linear-gradient(135deg, #1C1917, #292524)`,
        padding: "44px 18px 16px", color: "white",
      }}>
        <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 700, opacity: 0.6 }}>Panel de gestión</div>
        <div style={{ fontFamily: heading, fontSize: 20, fontWeight: 700, marginTop: 4 }}>
          📋 Pedidos en vivo
        </div>
      </div>

      {/* New order notification */}
      <div style={{
        opacity: notifOp,
        transform: `translateY(${notifSlide}px)`,
        margin: "12px 14px",
        padding: 14,
        background: `linear-gradient(135deg, ${GREEN}15, ${GREEN}08)`,
        border: `2px solid ${GREEN}44`,
        borderRadius: 14,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{
            width: 8, height: 8, borderRadius: 4, background: GREEN,
            boxShadow: `0 0 8px ${GREEN}`,
          }} />
          <span style={{ fontFamily: heading, fontSize: 12, fontWeight: 700, color: GREEN }}>🔔 Nuevo pedido</span>
        </div>
        <div style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: "#1C1917" }}>
          Mesa 3 · $26.448
        </div>
        <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
          2x Smash Burger, 1x Pizza, 1x Papas
        </div>
      </div>

      {/* Orders list */}
      <div style={{ padding: "0 14px" }}>
        {orders.map((order, i) => {
          const op = interpolate(progress, [0.2 + i * 0.1, 0.35 + i * 0.1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} style={{
              opacity: op,
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 0", borderBottom: "1px solid #F5F5F4",
            }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontFamily: heading, fontSize: 13, fontWeight: 600 }}>Mesa {order.mesa}</span>
                  {order.isNew && (
                    <span style={{
                      fontSize: 9, background: `${GREEN}22`, color: GREEN,
                      padding: "1px 6px", borderRadius: 6, fontWeight: 700,
                    }}>NUEVO</span>
                  )}
                </div>
                <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{order.items}</div>
              </div>
              <div style={{ textAlign: "right" as const }}>
                <div style={{ fontFamily: heading, fontSize: 13, fontWeight: 700, color: PRIMARY }}>{order.total}</div>
                <div style={{ fontSize: 10, color: MUTED }}>{order.time}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 300 frames (20-30s = 10s)
  const bgScale = interpolate(frame, [0, 300], [1.05, 1.0], { extrapolateRight: "clamp" });

  const phoneSpring = spring({ frame: frame - 30, fps, config: { damping: 18, stiffness: 90 } });
  const phoneX = interpolate(phoneSpring, [0, 1], [400, 0]);
  const phoneOp = interpolate(phoneSpring, [0, 1], [0, 1]);

  const ownerProgress = interpolate(frame, [60, 280], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const floatY = Math.sin(frame * 0.035) * 6;

  const titleSpring = spring({ frame: frame - 10, fps, config: { damping: 20, stiffness: 100 } });
  const titleOp = interpolate(titleSpring, [0, 1], [0, 1]);
  const titleY = interpolate(titleSpring, [0, 1], [40, 0]);

  return (
    <AbsoluteFill>
      {/* Background */}
      <div style={{ position: "absolute", inset: -30, transform: `scale(${bgScale})` }}>
        <Img src={staticFile("images/owner-smile.jpg")} style={{ width: "110%", height: "110%", objectFit: "cover" }} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(12,10,9,0.85) 0%, rgba(12,10,9,0.5) 50%, rgba(12,10,9,0.3) 100%)" }} />

      {/* Left text */}
      <div style={{ position: "absolute", left: 100, top: "50%", transform: "translateY(-50%)", maxWidth: 500 }}>
        <div style={{
          opacity: titleOp, transform: `translateY(${titleY}px)`,
          fontFamily: heading, fontSize: 14, fontWeight: 700,
          color: PRIMARY, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 16,
        }}>
          Vista del dueño
        </div>
        <div style={{
          opacity: titleOp, transform: `translateY(${titleY}px)`,
          fontFamily: heading, fontSize: 46, fontWeight: 700, color: "white", lineHeight: 1.2,
        }}>
          Cada pedido llega
          <br />
          <span style={{ color: PRIMARY }}>al instante</span>
        </div>
        <div style={{
          opacity: interpolate(frame, [40, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          fontFamily: body, fontSize: 18, color: "#A8A29E", marginTop: 14, lineHeight: 1.5,
        }}>
          Sin gritos a la cocina. Sin anotaciones en papel.
          <br />
          El pedido aparece en el panel en tiempo real.
        </div>
      </div>

      {/* Phone on right */}
      <div style={{
        position: "absolute", right: 180, top: "50%",
        transform: `translateY(calc(-50% + ${floatY}px)) translateX(${phoneX}px)`,
        opacity: phoneOp,
      }}>
        <PhoneFrame>
          <OwnerPhoneScreen progress={ownerProgress} />
        </PhoneFrame>
      </div>
    </AbsoluteFill>
  );
};
