import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://xiaotaotop.com";

  // 静态页面
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  // 公开博客文章
  try {
    const posts = await prisma.document.findMany({
      where: { isPublic: true, isDeleted: false },
      select: { id: true, lastModifiedAt: true },
      orderBy: { lastModifiedAt: "desc" },
      take: 100,
    });

    const postUrls: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${baseUrl}/blog/post/${post.id}`,
      lastModified: post.lastModifiedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

    return [...staticPages, ...postUrls];
  } catch {
    return staticPages;
  }
}
