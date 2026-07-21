import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "WOPC × 福建老酒 AI 调酒实验室",
  description: "WOPC 与福建老酒，用 AI 把你的今天酿成一杯专属酒方。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <Script
          defer
          data-domain="wine.lingszb.cn"
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
