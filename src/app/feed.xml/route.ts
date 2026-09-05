import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const siteUrl = "https://xiaotaotop.com";

  const posts = await prisma.document.findMany({
    where: { visibility: "public", isDeleted: false },
    orderBy: { lastModifiedAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      plainText: true,
      lastModifiedAt: true,
      createdAt: true,
      knowledgeBase: {
        select: { name: true },
      },
    },
  });

  const feedItems = posts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/blog/post/${post.id}</link>
      <guid isPermaLink="true">${siteUrl}/blog/post/${post.id}</guid>
      <pubDate>${new Date(post.lastModifiedAt).toUTCString()}</pubDate>
      ${post.knowledgeBase ? `<category><![CDATA[${post.knowledgeBase.name}]]></category>` : ""}
      <description><![CDATA[${post.plainText.slice(0, 300)}${post.plainText.length > 300 ? "..." : ""}]]></description>
    </item>`
    )
    .join("");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>晓桃终生成长</title>
    <link>${siteUrl}/blog</link>
    <description>记录学习、思考与成长的点滴。关于自媒体运营、个人成长、以及那些让生活更美好的小发现。</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
    <generator>晓桃知识库</generator>
    ${feedItems}
  </channel>
</rss>`;

  return new NextResponse(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
