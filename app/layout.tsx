import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "超级合子 × 福建老酒 AI 调酒实验室",
  description: "超级合子与福建老酒，用 AI 把你的今天酿成一杯专属酒方。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
