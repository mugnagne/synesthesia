import { ImageResponse } from "next/og";
import { PERFUME_COUNT, BRAND_COUNT } from "@/lib/catalogue";

export const alt = "Synesthésie, traducteur de situations en notes de parfum";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          color: "#0a0a0a",
          padding: 64,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 4 }}>
          <span>SYNESTHÉSIE</span>
          <span>TRADUCTION SENSORIELLE</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  width: 28,
                  height: 28,
                  background: i < 3 ? "#1200e8" : "#ffffff",
                  border: "2px solid #1200e8",
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: 72, lineHeight: 1.05, maxWidth: 900 }}>
            Une situation précise entre. Des notes de parfumerie et des parfums réels sortent.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 4, color: "#1200e8" }}>
          <span>{PERFUME_COUNT} PARFUMS</span>
          <span>{BRAND_COUNT} MAISONS</span>
        </div>
      </div>
    ),
    size,
  );
}
