import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VoxTrans",
  description: "Chinese script to English translation and speech demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-full bg-white text-zinc-900 antialiased">{children}</body>
    </html>
  );
}
