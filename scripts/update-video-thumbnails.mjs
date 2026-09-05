#!/usr/bin/env node
/**
 * 更新已有视频文章的封面图
 * 运行条件：DATABASE_URL 指向 PostgreSQL
 * 用法：DATABASE_URL=postgres://... node scripts/update-video-thumbnails.mjs
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 标题关键词 → 封面图映射
const THUMBNAIL_MAP = [
  { keywords: ["学习", "vlog", "晨间", "一天"], url: "https://images.unsplash.com/photo-1499750310107-5fef28a65738?w=800&h=450&fit=crop" },
  { keywords: ["读书", "书", "阅读"], url: "https://images.unsplash.com/photo-1544716306-8beeada7d80b?w=800&h=450&fit=crop" },
  { keywords: ["健身", "运动", "打卡"], url: "https://images.unsplash.com/photo-1571019613454-1cb2efda17a4?w=800&h=450&fit=crop" },
  { keywords: ["工具", "教程", "notion", "Notion"], url: "https://images.unsplash.com/photo-1454165804606-c3d57bc9d5b3?w=800&h=450&fit=crop" },
  { keywords: ["英语", "english"], url: "https://images.unsplash.com/photo-1503676260728-c7a41320520f?w=800&h=450&fit=crop" },
  { keywords: ["成长", "记录", "习惯"], url: "https://images.unsplash.com/photo-1488190211105-8b0fc5308247?w=800&h=450&fit=crop" },
];

function getThumbnailForTitle(title) {
  for (const item of THUMBNAIL_MAP) {
    if (item.keywords.some(kw => title.toLowerCase().includes(kw.toLowerCase()))) {
      return item.url;
    }
  }
  // 默认封面
  return "https://images.unsplash.com/photo-1531430111037-2fb6a8a7b1b2?w=800&h=450&fit=crop";
}

async function main() {
  const dbUrl = process.env.DATABASE_URL || '';
  if (!dbUrl.startsWith('postgres')) {
    console.log('[update-thumbnails] Not PostgreSQL, skipping.');
    return;
  }

  console.log('[update-thumbnails] Starting video thumbnail update...');

  // 查找所有没有封面图的视频文章
  const videosWithoutThumbnail = await prisma.document.findMany({
    where: {
      isVideo: true,
      isDeleted: false,
      OR: [
        { videoThumbnail: null },
        { videoThumbnail: "" },
      ],
    },
    select: { id: true, title: true },
  });

  console.log(`[update-thumbnails] Found ${videosWithoutThumbnail.length} videos without thumbnails`);

  let updated = 0;
  for (const video of videosWithoutThumbnail) {
    const thumbnail = getThumbnailForTitle(video.title);
    await prisma.document.update({
      where: { id: video.id },
      data: { videoThumbnail: thumbnail },
    });
    console.log(`[update-thumbnails] Updated: "${video.title}" → ${thumbnail.substring(0, 60)}...`);
    updated++;
  }

  console.log(`[update-thumbnails] ✅ Updated ${updated} video thumbnails!`);
}

main()
  .catch((e) => {
    console.error('[update-thumbnails] Error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
