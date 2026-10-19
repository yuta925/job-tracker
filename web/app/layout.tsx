import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "Waypoint",
  description:
    "大切な連絡と、次にやることをひと目で。Waypointで就活の締切・予定・選考を管理。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body
        className={notoSansJP.className}
        style={{
          background: "var(--md-background)",
          color: "var(--md-on-background)",
        }}
      >
        {children}
      </body>
    </html>
  );
}
