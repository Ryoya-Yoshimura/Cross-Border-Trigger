import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #f87c6a, #6a9fd8)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "40px",
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: "94px",
            fontWeight: "bold",
            lineHeight: 1,
          }}
        >
          CB
        </span>
      </div>
    ),
    { ...size }
  );
}
