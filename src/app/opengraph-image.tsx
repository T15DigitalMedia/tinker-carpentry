import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px",
          background: "#152230",
          color: "#E7E3D7",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 4, textTransform: "uppercase", color: "#9FB0BF" }}>
          Handmade Carpentry
        </div>
        <div style={{ fontSize: 88, fontWeight: 600, marginTop: 24 }}>{SITE_NAME}</div>
        <div style={{ fontSize: 32, marginTop: 24, color: "#C4CFD8", maxWidth: 820 }}>{SITE_DESCRIPTION}</div>
      </div>
    ),
    { ...size },
  );
}
