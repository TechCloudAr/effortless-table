import React from "react";

const PRIMARY = "#F97316";

export function PhoneFrame({
  children,
  scale = 1,
  opacity = 1,
  style = {},
}: {
  children: React.ReactNode;
  scale?: number;
  opacity?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        transform: `scale(${scale})`,
        opacity,
        width: 360,
        height: 740,
        borderRadius: 48,
        background: "#1C1917",
        padding: 10,
        boxShadow: `0 40px 100px -20px rgba(0,0,0,0.6), 0 0 80px ${PRIMARY}22`,
        ...style,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 40,
          overflow: "hidden",
          background: "#FFFAF5",
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
            width: 140,
            height: 30,
            background: "#1C1917",
            borderRadius: "0 0 18px 18px",
            zIndex: 10,
          }}
        />
        {children}
      </div>
    </div>
  );
}
