import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import AuthFetchProvider from "@/components/AuthFetchProvider";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import ThemeScript from "@/components/ThemeScript";
import ContentProtection from "@/components/ContentProtection";
import InvisibleWatermark from "@/components/InvisibleWatermark";

const SITE_URL = "https://xiaotaotop.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "晓桃自学英语",
    template: "%s · 晓桃自学英语",
  },
  description: "学会的不只是英语。一个37岁普通人从零自学英语的真实记录，关于英语、关于成长、关于让生活变好的小发现。",
  manifest: "/manifest.json",
  keywords: ["英语学习", "自学英语", "晓桃自学英语", "个人成长", "学习笔记", "晓桃", "37岁学英语", "学会的不只是英语"],
  authors: [{ name: "晓桃" }],
  creator: "晓桃",
  copyright: "© 2026 晓桃自学英语 (xiaotaotop.com). 保留所有权利。未经授权禁止复制、转载或用于AI训练。",
  other: {
    "tdm-reservation": "1",
    "copyright": "© 2026 xiaotaotop.com",
    "author": "晓桃",
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: SITE_URL,
    siteName: "晓桃自学英语",
    title: "晓桃自学英语",
    description: "学会的不只是英语。一个37岁普通人从零自学英语的真实记录，关于英语、关于成长、关于让生活变好的小发现。",
    images: [
      {
        url: "/icon-512.png",
        width: 512,
        height: 512,
        alt: "晓桃自学英语",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "晓桃自学英语",
    description: "学会的不只是英语",
  },
  appleWebApp: {
    capable: true,
    title: "晓桃自学英语",
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
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
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
          <ContentProtection />
          <InvisibleWatermark />
        </AuthFetchProvider>
      </body>
    </html>
  );
}
