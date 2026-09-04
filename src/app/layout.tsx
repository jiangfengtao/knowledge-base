import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import AuthFetchProvider from "@/components/AuthFetchProvider";

export const metadata: Metadata = {
  title: "晓桃终生成长",
  description: "个人知识管理与成长系统",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "晓桃终生成长",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#00d48f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <AuthFetchProvider>{children}</AuthFetchProvider>
      </body>
    </html>
  );
}
