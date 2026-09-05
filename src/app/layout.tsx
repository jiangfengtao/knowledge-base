import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import AuthFetchProvider from "@/components/AuthFetchProvider";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import ThemeScript from "@/components/ThemeScript";

const SITE_URL = "https://xiaotaotop.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "晓桃终生成长",
    template: "%s · 晓桃终生成长",
  },
  description: "个人知识管理与成长系统 - 记录学习、思考与成长的点滴",
  manifest: "/manifest.json",
  keywords: ["知识管理", "个人成长", "自媒体", "学习笔记", "晓桃"],
  authors: [{ name: "晓桃" }],
  creator: "晓桃",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: SITE_URL,
    siteName: "晓桃终生成长",
    title: "晓桃终生成长",
    description: "个人知识管理与成长系统 - 记录学习、思考与成长的点滴",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "晓桃终生成长",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "晓桃终生成长",
    description: "个人知识管理与成长系统",
  },
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
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
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
        <ThemeScript />
        <AuthFetchProvider>
          {children}
          <ServiceWorkerRegister />
        </AuthFetchProvider>
      </body>
    </html>
  );
}
