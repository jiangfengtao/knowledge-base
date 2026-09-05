import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/blog",
      disallow: ["/api", "/login", "/_next"],
    },
    sitemap: "https://xiaotaotop.com/sitemap.xml",
  };
}
