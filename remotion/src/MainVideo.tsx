import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadBody } from "@remotion/google-fonts/DMSans";

const { fontFamily: heading } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });
const { fontFamily: body } = loadBody("normal", { weights: ["400", "500", "700"], subsets: ["latin"] });

const PRIMARY = "#F97316";
const BG_DARK = "#0C0A09";
const BG_WARM = "#FFFAF5";
const CARD_BG = "#FFFFFF";
const MUTED = "#78716C";

// Phone frame component
function PhoneFrame({ children, x, y, scale, opacity }: { children: React.ReactNode; x: number; y: number; scale: number; opacity: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: `scale(${scale})`,
        opacity,
        width: 380,
        height: 780,
        borderRadius: 52,
        background: "#1C1917",
        padding: 12,
        boxShadow: `0 40px 100px -20px rgba(0,0,0,0.5), 0 0 60px ${PRIMARY}33`,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 42,
          overflow: "hidden",
          background: BG_WARM,
          position: "relative",
        }}
      >
        {/* Notch */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 150,
            height: 32,
            background: "#1C1917",
            borderRadius: "0 0 20px 20px",
            zIndex: 10,
          }}
        />
        {children}
      </div>
    </div>
  );
}

// Menu screen
function MenuScreen({ scrollY }: { scrollY: number }) {
  const items = [
    { name: "Bife de Chorizo", price: "$8.500", tag: "🔥 Popular", color: "#FED7AA" },
    { name: "Empanadas x6", price: "$4.200", tag: "⭐ Top", color: "#D9F99D" },
    { name: "Provoleta", price: "$3.800", tag: "🧀 Clásico", color: "#FDE68A" },
    { name: "Ensalada Caesar", price: "$3.500", tag: "🥗 Fresco", color: "#BBF7D0" },
    { name: "Lomo al Champignon", price: "$9.200", tag: "🔥 Premium", color: "#FECACA" },
    { name: "Mollejas", price: "$5.100", tag: "🥩 Parrilla", color: "#FED7AA" },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${PRIMARY}, #EA580C)`,
          padding: "44px 20px 20px",
          color: "white",
        }}
      >
        <div style={{ fontFamily: heading, fontSize: 18, fontWeight: 700 }}>🔥 Fuego & Sazón</div>
        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>Mesa 5 · ⭐ 4.8</div>
        <div
          style={{
            marginTop: 12,
            background: "rgba(255,255,255,0.15)",
            borderRadius: 12,
            padding: "10px 16px",
            fontSize: 13,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          🔍 Buscar en el menú...
        </div>
      </div>

      {/* Categories */}
      <div
        style={{
          display: "flex",
          gap: 8,
          padding: "12px 16px",
          background: CARD_BG,
          borderBottom: "1px solid #F5F5F4",
        }}
      >
        {["🥩 Parrilla", "🥗 Entradas", "🍰 Postres"].map((cat, i) => (
          <div
            key={cat}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 600,
              fontFamily: heading,
              background: i === 0 ? PRIMARY : "#F5F5F4",
              color: i === 0 ? "white" : MUTED,
              whiteSpace: "nowrap",
            }}
          >
            {cat}
          </div>
        ))}
      </div>

      {/* Items */}
      <div style={{ padding: "8px 16px", transform: `translateY(${-scrollY}px)` }}>
        {items.map((item, i) => (
          <div
            key={item.name}
            style={{
              display: "flex",
              gap: 12,
              padding: 14,
              marginBottom: 8,
              background: CARD_BG,
              borderRadius: 16,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              alignItems: "center",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 600, color: "#1C1917" }}>
                {item.name}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: MUTED,
                  marginTop: 4,
                  background: "#F5F5F4",
                  display: "inline-block",
                  padding: "2px 8px",
                  borderRadius: 10,
                }}
              >
                {item.tag}
              </div>
              <div style={{ fontFamily: heading, fontSize: 15, fontWeight: 700, color: PRIMARY, marginTop: 6 }}>
                {item.price}
              </div>
            </div>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 14,
                background: `linear-gradient(135deg, ${item.color}, ${item.color}CC)`,
                position: "relative",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  bottom: -4,
                  right: -4,
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  background: PRIMARY,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  fontWeight: 700,
                  border: `2px solid ${BG_WARM}`,
                }}
              >
                +
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Cart screen
function CartScreen({ progress }: { progress: number }) {
  const items = [
    { name: "Bife de Chorizo", qty: 1, price: "$8.500" },
    { name: "Empanadas x6", qty: 1, price: "$4.200" },
    { name: "Provoleta", qty: 1, price: "$3.800" },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: BG_WARM }}>
      <div
        style={{
          padding: "50px 20px 16px",
          fontFamily: heading,
          fontSize: 20,
          fontWeight: 700,
          color: "#1C1917",
        }}
      >
        🛒 Tu pedido
      </div>
      <div style={{ padding: "0 20px" }}>
        {items.map((item, i) => {
          const itemOpacity = interpolate(progress, [i * 0.15, i * 0.15 + 0.2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div
              key={item.name}
              style={{
                opacity: itemOpacity,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 0",
                borderBottom: "1px solid #F5F5F4",
              }}
            >
              <div>
                <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 600 }}>{item.name}</div>
                <div style={{ fontSize: 12, color: MUTED }}>x{item.qty}</div>
              </div>
              <div style={{ fontFamily: heading, fontSize: 14, fontWeight: 700, color: PRIMARY }}>{item.price}</div>
            </div>
          );
        })}

        <div
          style={{
            opacity: interpolate(progress, [0.5, 0.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            marginTop: 20,
            padding: 16,
            background: CARD_BG,
            borderRadius: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: MUTED }}>Subtotal</span>
            <span style={{ fontSize: 13, fontFamily: heading, fontWeight: 600 }}>$16.500</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 15, fontFamily: heading, fontWeight: 700 }}>Total</span>
            <span style={{ fontSize: 15, fontFamily: heading, fontWeight: 700, color: PRIMARY }}>$19.140</span>
          </div>
        </div>

        <div
          style={{
            opacity: interpolate(progress, [0.7, 0.9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            marginTop: 20,
            background: `linear-gradient(135deg, ${PRIMARY}, #EA580C)`,
            color: "white",
            fontFamily: heading,
            fontWeight: 700,
            fontSize: 15,
            padding: "14px 0",
            borderRadius: 14,
            textAlign: "center" as const,
          }}
        >
          Confirmar pedido →
        </div>
      </div>
    </div>
  );
}

// Order confirmed screen
function OrderConfirmedScreen({ progress }: { progress: number }) {
  const checkScale = interpolate(progress, [0, 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: BG_WARM,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 30,
      }}
    >
      <div
        style={{
          width: 90,
          height: 90,
          borderRadius: 45,
          background: "#22C55E",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 44,
          transform: `scale(${checkScale})`,
          marginBottom: 20,
        }}
      >
        ✓
      </div>
      <div
        style={{
          opacity: interpolate(progress, [0.3, 0.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          fontFamily: heading,
          fontSize: 22,
          fontWeight: 700,
          color: "#1C1917",
          textAlign: "center" as const,
        }}
      >
        ¡Pedido confirmado!
      </div>
      <div
        style={{
          opacity: interpolate(progress, [0.5, 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          fontSize: 13,
          color: MUTED,
          marginTop: 8,
          textAlign: "center" as const,
        }}
      >
        Mesa 5 · Pedido #127
      </div>
      <div
        style={{
          opacity: interpolate(progress, [0.6, 0.9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          marginTop: 24,
          padding: "10px 24px",
          background: "#F0FDF4",
          borderRadius: 12,
          fontSize: 13,
          color: "#16A34A",
          fontWeight: 600,
        }}
      >
        🍳 Preparando tu pedido...
      </div>
    </div>
  );
}

export const MainVideo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Background glow animation
  const glowX = interpolate(frame, [0, 300], [0, 360]);
  const bgGlow1 = `radial-gradient(600px circle at ${30 + Math.sin(glowX * 0.02) * 15}% ${40 + Math.cos(glowX * 0.015) * 10}%, ${PRIMARY}22, transparent)`;
  const bgGlow2 = `radial-gradient(400px circle at ${70 + Math.cos(glowX * 0.025) * 10}% ${60 + Math.sin(glowX * 0.02) * 15}%, #F5920022, transparent)`;

  // Phone entrance
  const phoneSpring = spring({ frame, fps, config: { damping: 20, stiffness: 80 } });
  const phoneX = interpolate(phoneSpring, [0, 1], [1920, 1050]);
  const phoneY = 100;
  const phoneScale = interpolate(phoneSpring, [0, 1], [0.8, 1]);

  // Text entrance
  const titleSpring = spring({ frame: frame - 10, fps, config: { damping: 18, stiffness: 100 } });
  const subtitleSpring = spring({ frame: frame - 25, fps, config: { damping: 18 } });

  // Menu scroll (frames 60-150)
  const scrollY = interpolate(frame, [60, 150], [0, 200], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Transition to cart (frames 150-180)
  const cartTransition = interpolate(frame, [150, 180], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Cart progress (frames 180-240)
  const cartProgress = interpolate(frame, [180, 240], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Transition to confirmed (frames 240-260)
  const confirmTransition = interpolate(frame, [240, 260], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Confirm progress (frames 260-300)
  const confirmProgress = interpolate(frame, [260, 300], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Float animation
  const floatY = Math.sin(frame * 0.04) * 6;

  // Text transitions across scenes
  const textLine1 = frame < 150 ? "Tu cliente escanea el QR" : frame < 240 ? "Arma su pedido" : "Pedido confirmado";
  const textLine2 = frame < 150 ? "y explora tu menú" : frame < 240 ? "y paga desde su celular" : "en segundos";

  const textSwitch1 = frame === 0 ? 1 : (frame >= 148 && frame <= 155) || (frame >= 238 && frame <= 245) ? 
    interpolate(frame % 150 < 10 ? frame % 150 : 0, [0, 5], [1, 0], { extrapolateRight: "clamp" }) : 1;

  return (
    <AbsoluteFill style={{ background: BG_DARK }}>
      {/* Background glows */}
      <div style={{ position: "absolute", inset: 0, background: bgGlow1 }} />
      <div style={{ position: "absolute", inset: 0, background: bgGlow2 }} />

      {/* Floating accent shapes */}
      {[0, 1, 2, 3, 4].map((i) => {
        const delay = i * 60;
        const size = 4 + i * 2;
        const x = 100 + i * 180;
        const y = 200 + Math.sin((frame + delay) * 0.03) * 80;
        const opacity = interpolate(frame, [20 + i * 10, 50 + i * 10], [0, 0.15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: size / 2,
              background: PRIMARY,
              opacity,
            }}
          />
        );
      })}

      {/* Left side text */}
      <div style={{ position: "absolute", left: 120, top: 280, maxWidth: 700 }}>
        {/* Badge */}
        <div
          style={{
            opacity: interpolate(titleSpring, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(titleSpring, [0, 1], [30, 0])}px)`,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: `${PRIMARY}22`,
            border: `1px solid ${PRIMARY}44`,
            borderRadius: 24,
            padding: "8px 18px",
            marginBottom: 28,
            color: PRIMARY,
            fontSize: 16,
            fontWeight: 600,
            fontFamily: heading,
          }}
        >
          ⚡ Mesa Digital
        </div>

        {/* Title */}
        <div
          style={{
            opacity: interpolate(titleSpring, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(titleSpring, [0, 1], [40, 0])}px)`,
            fontFamily: heading,
            fontSize: 52,
            fontWeight: 700,
            lineHeight: 1.15,
            color: "white",
            marginBottom: 12,
          }}
        >
          {textLine1}
          <br />
          <span style={{ color: PRIMARY }}>{textLine2}</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            opacity: interpolate(subtitleSpring, [0, 1], [0, 1]),
            transform: `translateY(${interpolate(subtitleSpring, [0, 1], [30, 0])}px)`,
            fontFamily: body,
            fontSize: 20,
            color: "#A8A29E",
            lineHeight: 1.6,
            maxWidth: 500,
          }}
        >
          Sin mozo intermediario. Sin esperas.
          <br />
          Todo desde el celular del cliente.
        </div>

        {/* Social proof */}
        <div
          style={{
            opacity: interpolate(subtitleSpring, [0, 1], [0, 1]),
            marginTop: 40,
            display: "flex",
            gap: 24,
          }}
        >
          {["Implementación en un día", "Sin hardware", "Solo un QR"].map((t) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#A8A29E", fontFamily: body }}>
              <div style={{ width: 18, height: 18, borderRadius: 9, background: "#22C55E33", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#22C55E" }}>✓</div>
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Phone */}
      <PhoneFrame x={phoneX} y={phoneY + floatY} scale={phoneScale} opacity={1}>
        {/* Menu screen */}
        <div style={{ opacity: 1 - cartTransition }}>
          <MenuScreen scrollY={scrollY} />
        </div>
        {/* Cart screen */}
        {cartTransition > 0 && confirmTransition < 1 && (
          <div style={{ opacity: cartTransition * (1 - confirmTransition) }}>
            <CartScreen progress={cartProgress} />
          </div>
        )}
        {/* Confirmed screen */}
        {confirmTransition > 0 && (
          <div style={{ opacity: confirmTransition }}>
            <OrderConfirmedScreen progress={confirmProgress} />
          </div>
        )}
      </PhoneFrame>

      {/* Step indicators */}
      <div style={{ position: "absolute", bottom: 60, left: 120, display: "flex", gap: 12 }}>
        {["Explorar menú", "Armar pedido", "Confirmar"].map((label, i) => {
          const isActive = i === 0 ? frame < 150 : i === 1 ? frame >= 150 && frame < 240 : frame >= 240;
          return (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 16px",
                borderRadius: 20,
                background: isActive ? `${PRIMARY}33` : "rgba(255,255,255,0.05)",
                border: `1px solid ${isActive ? PRIMARY : "rgba(255,255,255,0.1)"}`,
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  background: isActive ? PRIMARY : "rgba(255,255,255,0.1)",
                  color: isActive ? "white" : "#78716C",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: heading,
                }}
              >
                {i + 1}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: isActive ? "white" : "#78716C", fontFamily: heading }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
