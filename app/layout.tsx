import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CostSplitter",
  description: "Split costs from PDF statements with AI-assisted parsing",
};

// All eight handwritten fonts (plus JetBrains Mono) are loaded once here so the
// Settings font picker can switch between them by rewriting --font-hand.
const FONTS_HREF =
  "https://fonts.googleapis.com/css2?" +
  [
    "family=Architects+Daughter",
    "family=Caveat:wght@400;600;700",
    "family=Gochi+Hand",
    "family=Homemade+Apple",
    "family=Indie+Flower",
    "family=JetBrains+Mono:wght@400;500;600",
    "family=Kalam:wght@300;400;700",
    "family=Patrick+Hand",
    "family=Shadows+Into+Light",
    "display=swap",
  ].join("&");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={FONTS_HREF} rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
