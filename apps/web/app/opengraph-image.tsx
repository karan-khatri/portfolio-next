import { ImageResponse } from "next/og";
import { getSiteSettings } from "@portfolio/db/server";

export const alt = "Site preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const settings = await getSiteSettings();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0b0f14",
          color: "#f1f5f9",
          fontFamily: "monospace",
        }}
      >
        <div style={{ display: "flex", color: "#2dd4bf", fontSize: 28, letterSpacing: 4 }}>
          $ whoami
        </div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 72, fontWeight: 700 }}>
          {settings.title}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 30,
            color: "#94a3b8",
            maxWidth: 900,
          }}
        >
          {settings.description}
        </div>
      </div>
    ),
    { ...size },
  );
}
