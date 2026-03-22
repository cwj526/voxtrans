import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VoxTrans",
  description: "VoxTrans 专业翻译与语音工作台：中文文案到英文脚本与配音输出。",
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
