import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile } from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadBody } from "@remotion/google-fonts/DMSans";
import { PhoneFrame } from "../components/PhoneFrame";
import { PRIMARY, BG_DARK, CARD_BG, MUTED, GREEN } from "../components/constants";

const { fontFamily: heading } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });
const { fontFamily: body } = loadBody("normal", { weights: ["400", "500", "700"], subsets: ["latin"] });

const menuItems = [
  { name: "Smash Burger Doble", price: "$6.900", tag: "🔥 Popular", img: "images/food-burger.jpg" },
  { name: "Pizza Muzzarella", price: "$5.200", tag: "⭐ Top", img: "images/food-pizza.jpg" },
  { name: "Ensalada Caesar", price: "$4.100", tag: "🥗 Fresco", img: "images/food-salad.jpg" },
  { name: "Papas Trufadas", price: "$3.800", tag: "✨ Nueva", img: "images/food-fries.jpg" },
  { name: "Lomo Completo", price: "$7.500", tag: "🥩 Premium", img: "images/food-lomo.jpg" },
];

const cartItems = [
  { name: "Smash Burger Doble", qty: 2, price: "$13.800" },
  { name: "Pizza Muzzarella", qty: 1, price: "$5.200" },
  { name: "Papas Trufadas", qty: 1, price: "$3.800" },
];

function MenuPhoneScreen({ scrollY, addProgress }: { scrollY: number; addProgress: number }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div style={{
        background: `linear-gradient(135deg, ${PRIMARY}, #EA580C)`,
        padding: "44px 18px 18px",
        color: "white",
      }}>
        <div style={{ fontFamily: heading, fontSize: 16, fontWeight: 700 }}>🍔 La Parrilla de Juan</div>
        <div style={{ fontSize: 11, opacity: 0.8, marginTop: 3 }}>Mesa 3 · ⭐ 4.9</div>
        <div style={{
          marginTop: 10,
          background: "rgba(255,255,255,0.15)",
          borderRadius: 10,
          padding: "8px 14px",
          fontSize: 12,
          color: "rgba(255,255,255,0.7)",
        }}>
          🔍 Buscar en el menú...
        </div>
      </div>

      <div style={{
        display: "flex", gap: 6, padding: "10px 14px",
        background: CARD_BG, borderBottom: "1px solid #F5F5F4",
      }}>
        {["🍔 Burgers", "🍕 Pizzas", "🥗 Ensaladas"].map((cat, i) => (
          <div key={cat} style={{
            padding: "5px 12px", borderRadius: 16, fontSize: 11, fontWeight: 600,
            fontFamily: heading,
            background: i === 0 ? PRIMARY : "#F5F5F4",
            color: i === 0 ? "white" : MUTED,
            whiteSpace: "nowrap",
          }}>{cat}</div>
        ))}
      </div>

      <div style={{ padding: "6px 14px", transform: `translateY(${-scrollY}px)` }}>
        {menuItems.map((item, i) => {
          const isAdded = i < 3 && addProgress > (i * 0.25 + 0.1);
          return (
            <div key={item.name} style={{
              display: "flex", gap: 10, padding: 12, marginBottom: 6,
              background: CARD_BG, borderRadius: 14,
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              alignItems: "center",
              border: isAdded ? `2px solid ${PRIMARY}44` : "2px solid transparent",
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: heading, fontSize: 13, fontWeight: 600, color: "#1C1917" }}>{item.name}</div>
                <div style={{
                  fontSize: 9, color: MUTED, marginTop: 3,
                  background: "#F5F5F4", display: "inline-block",
                  padding: "2px 6px", borderRadius: 8,
                }}>{item.tag}</div>
                <div style={{ fontFamily: heading, fontSize: 13, fontWeight: 700, color: PRIMARY, marginTop: 4 }}>{item.price}</div>
              </div>
              <div style={{
                width: 64, height: 64, borderRadius: 12,
                position: "relative", flexShrink: 0,
                overflow: "hidden",
              }}>
                <Img src={staticFile(item.img)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{
                  position: "absolute", bottom: 2, right: 2,
                  width: 22, height: 22, borderRadius: 11,
                  background: isAdded ? GREEN : PRIMARY,
                  color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, border: "2px solid white",
                  transform: isAdded ? "scale(1.1)" : "scale(1)",
                }}>
                  {isAdded ? "✓" : "+"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CartPhoneScreen({ progress }: { progress: number }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#FFFAF5" }}>
      <div style={{ padding: "48px 18px 14px", fontFamily: heading, fontSize: 18, fontWeight: 700, color: "#1C1917" }}>
        🛒 Tu pedido
      </div>
      <div style={{ padding: "0 18px" }}>
        {cartItems.map((item, i) => {
          const op = interpolate(progress, [i * 0.12, i * 0.12 + 0.15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={item.name} style={{
              opacity: op, display: "flex", justifyContent: "space-between",
              alignItems: "center", padding: "12px 0", borderBottom: "1px solid #F5F5F4",
            }}>
              <div>
                <div style={{ fontFamily: heading, fontSize: 13, fontWeight: 600 }}>{item.name}</div>
                <div style={{ fontSize: 11, color: MUTED }}>x{item.qty}</div>
              </div>
              <div style={{ fontFamily: heading, fontSize: 13, fontWeight: 700, color: PRIMARY }}>{item.price}</div>
            </div>
          );
        })}

        <div style={{
          opacity: interpolate(progress, [0.4, 0.55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          marginTop: 16, padding: 14, background: CARD_BG, borderRadius: 14,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: MUTED }}>Subtotal</span>
            <span style={{ fontSize: 12, fontFamily: heading, fontWeight: 600 }}>$22.800</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 14, fontFamily: heading, fontWeight: 700 }}>Total</span>
            <span style={{ fontSize: 14, fontFamily: heading, fontWeight: 700, color: PRIMARY }}>$26.448</span>
          </div>
        </div>

        {/* MercadoPago button */}
        <div style={{
          opacity: interpolate(progress, [0.55, 0.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          marginTop: 14,
          background: "#009EE3",
          color: "white", fontFamily: heading, fontWeight: 700, fontSize: 14,
          padding: "12px 0", borderRadius: 12, textAlign: "center" as const,
        }}>
          💳 Pagar con Mercado Pago
        </div>
      </div>
    </div>
  );
}

function ConfirmPhoneScreen({ progress }: { progress: number }) {
  const checkScale = interpolate(progress, [0, 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{
      position: "absolute", inset: 0, background: "#FFFAF5",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28,
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: 40, background: GREEN,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 40, color: "white", transform: `scale(${checkScale})`, marginBottom: 16,
      }}>✓</div>
      <div style={{
        opacity: interpolate(progress, [0.25, 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        fontFamily: heading, fontSize: 20, fontWeight: 700, color: "#1C1917", textAlign: "center" as const,
      }}>
        Pedido recibido ✓
      </div>
      <div style={{
        opacity: interpolate(progress, [0.4, 0.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        fontSize: 12, color: MUTED, marginTop: 6, textAlign: "center" as const,
      }}>
        Mesa 3 · Pedido #204
      </div>
      <div style={{
        opacity: interpolate(progress, [0.5, 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        marginTop: 20, padding: "8px 20px", background: "#F0FDF4",
        borderRadius: 10, fontSize: 12, color: "#16A34A", fontWeight: 600,
      }}>
        🍳 Preparando tu pedido...
      </div>
    </div>
  );
}

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 450 frames total (5-20s = 15s)
  // 0-120: menu browsing with scroll and adding items
  // 120-200: transition to cart
  // 200-320: cart + pay
  // 320-400: transition to confirm
  // 400-450: confirmed

  const phoneSpring = spring({ frame, fps, config: { damping: 20, stiffness: 80 } });
  const phoneScale = interpolate(phoneSpring, [0, 1], [0.85, 1]);

  const scrollY = interpolate(frame, [20, 100], [0, 160], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const addProgress = interpolate(frame, [40, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const cartTransition = interpolate(frame, [120, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cartProgress = interpolate(frame, [150, 300], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const confirmTransition = interpolate(frame, [320, 350], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const confirmProgress = interpolate(frame, [350, 450], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const floatY = Math.sin(frame * 0.04) * 5;

  const glowX = interpolate(frame, [0, 450], [0, 360]);
  const bgGlow = `radial-gradient(600px circle at ${35 + Math.sin(glowX * 0.02) * 15}% ${45 + Math.cos(glowX * 0.015) * 10}%, ${PRIMARY}15, transparent)`;

  // Text that changes with each phone screen
  const textLabel = frame < 120 ? "Explora el menú" : frame < 320 ? "Armá tu pedido" : "¡Listo!";
  const textSub = frame < 120 ? "Fotos, precios y categorías" : frame < 320 ? "Pagá con Mercado Pago" : "Pedido confirmado en segundos";

  const textOp = interpolate(frame, [5, 25], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: BG_DARK }}>
      <div style={{ position: "absolute", inset: 0, background: bgGlow }} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(500px circle at 70% 60%, #EA580C0D, transparent)` }} />

      {/* Left text */}
      <div style={{ position: "absolute", left: 120, top: "50%", transform: "translateY(-50%)", maxWidth: 550 }}>
        <div style={{
          opacity: textOp,
          fontFamily: heading, fontSize: 14, fontWeight: 700,
          color: PRIMARY, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 16,
        }}>
          Vista del cliente
        </div>
        <div style={{
          opacity: textOp,
          fontFamily: heading, fontSize: 48, fontWeight: 700, color: "white", lineHeight: 1.2, marginBottom: 12,
        }}>
          {textLabel}
        </div>
        <div style={{
          opacity: textOp,
          fontFamily: body, fontSize: 20, color: "#A8A29E", lineHeight: 1.5,
        }}>
          {textSub}
        </div>

        {/* Step indicators */}
        <div style={{ display: "flex", gap: 10, marginTop: 40, opacity: textOp }}>
          {["Menú", "Carrito", "Pago"].map((s, i) => {
            const isActive = i === 0 ? frame < 120 : i === 1 ? frame >= 120 && frame < 320 : frame >= 320;
            return (
              <div key={s} style={{
                padding: "6px 14px", borderRadius: 16,
                background: isActive ? `${PRIMARY}33` : "rgba(255,255,255,0.05)",
                border: `1px solid ${isActive ? PRIMARY : "rgba(255,255,255,0.1)"}`,
                fontSize: 12, fontWeight: 600, color: isActive ? "white" : "#78716C",
                fontFamily: heading,
              }}>{s}</div>
            );
          })}
        </div>
      </div>

      {/* Phone on right */}
      <div style={{
        position: "absolute", right: 200, top: "50%",
        transform: `translateY(calc(-50% + ${floatY}px))`,
      }}>
        <PhoneFrame scale={phoneScale}>
          <div style={{ opacity: 1 - cartTransition }}>
            <MenuPhoneScreen scrollY={scrollY} addProgress={addProgress} />
          </div>
          {cartTransition > 0 && confirmTransition < 1 && (
            <div style={{ opacity: cartTransition * (1 - confirmTransition) }}>
              <CartPhoneScreen progress={cartProgress} />
            </div>
          )}
          {confirmTransition > 0 && (
            <div style={{ opacity: confirmTransition }}>
              <ConfirmPhoneScreen progress={confirmProgress} />
            </div>
          )}
        </PhoneFrame>
      </div>
    </AbsoluteFill>
  );
};
