import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Cross Border Trigger",
  description: "疎遠になった人と、また話すきっかけを",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen" style={{ background: "var(--background)" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
