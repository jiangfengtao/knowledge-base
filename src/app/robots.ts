import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // === 拦截 AI 训练爬虫（禁止抓取用于 AI 模型训练） ===
      // OpenAI / ChatGPT
      {
        userAgent: "GPTBot",
        disallow: "/",
      },
      // Google AI 训练
      {
        userAgent: "Google-Extended",
        disallow: "/",
      },
      // Anthropic / Claude
      {
        userAgent: "ClaudeBot",
        disallow: "/",
      },
      {
        userAgent: "anthropic-ai",
        disallow: "/",
      },
      // Common Crawl（被多个 AI 公司用于训练数据）
      {
        userAgent: "CCBot",
        disallow: "/",
      },
      // Perplexity AI
      {
        userAgent: "PerplexityBot",
        disallow: "/",
      },
      // ByteDance / 豆包
      {
        userAgent: "Bytespider",
        disallow: "/",
      },
      // Amazon AI
      {
        userAgent: "Amazonbot",
        disallow: "/",
      },
      // Meta AI
      {
        userAgent: "Meta-ExternalAgent",
        disallow: "/",
      },
      {
        userAgent: "Meta-ExternalFetcher",
        disallow: "/",
      },
      // Diffbot
      {
        userAgent: "Diffbot",
        disallow: "/",
      },
      // Imagesift
      {
        userAgent: "ImagesiftBot",
        disallow: "/",
      },
      // VelenPublicWeb
      {
        userAgent: "VelenPublicWeb",
        disallow: "/",
      },
      // Omgili / Webz.io
      {
        userAgent: "OmgiliBot",
        disallow: "/",
      },
      // FacebookBot
      {
        userAgent: "FacebookBot",
        disallow: "/",
      },
      // AppleBot-Extended (Apple AI training)
      {
        userAgent: "AppleBot-Extended",
        disallow: "/",
      },
      // 被标记为 AI 爬虫的通用 UA
      {
        userAgent: "AI2Bot",
        disallow: "/",
      },
      {
        userAgent: "Ai2bot-Dolma",
        disallow: "/",
      },
      {
        userAgent: "cohere-ai",
        disallow: "/",
      },
      // === 允许搜索引擎正常索引 ===
      {
        userAgent: "*",
        allow: ["/blog", "/about", "/videos", "/community", "/membership", "/timeline", "/offline"],
        disallow: ["/api", "/login", "/_next", "/admin", "/redeem", "/knowledge"],
      },
    ],
    sitemap: "https://xiaotaotop.com/sitemap.xml",
    host: "https://xiaotaotop.com",
  };
}
