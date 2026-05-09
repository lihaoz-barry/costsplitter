import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          background: "#fbf8f1",
          color: "#1a1a1a",
        }}
      >
        <svg width="180" height="180" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="20" fill="#fbf8f1" stroke="#2a2a2a" strokeWidth="2.5" />
          <path d="M12 32C18 27 20 21 24 16C28 11 33 13 36 18" stroke="#C74E36" strokeWidth="3" strokeLinecap="round" />
          <path d="M12 18C16 14 21 15 24 19C27 23 30 30 36 32" stroke="#4C91A9" strokeWidth="3" strokeLinecap="round" />
          <circle cx="16" cy="16" r="2.3" fill="#C74E36" />
          <circle cx="32" cy="32" r="2.3" fill="#4C91A9" />
        </svg>
        <div style={{ display: "flex", fontSize: 104, fontFamily: "cursive", fontWeight: 700 }}>
          Cost
          <span style={{ color: "#C74E36" }}>Splitter</span>
        </div>
      </div>
    ),
    size,
  );
}
