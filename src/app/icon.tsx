import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: "42px",
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: "100px",
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
