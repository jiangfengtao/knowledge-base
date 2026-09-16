import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log('=== 更新网站品牌名称 ===\n');

  // 查找所有 UserSettings 记录
  const allSettings = await prisma.userSettings.findMany({
    select: { id: true, userId: true, blogTitle: true, blogSubtitle: true, bio: true },
  });

  console.log(`找到 ${allSettings.length} 条设置记录`);
  allSettings.forEach((s, i) => {
    console.log(`\n--- 记录 ${i + 1} ---`);
    console.log(`  userId: ${s.userId}`);
    console.log(`  当前 blogTitle: ${s.blogTitle}`);
    console.log(`  当前 blogSubtitle: ${s.blogSubtitle}`);
    console.log(`  当前 bio: ${s.bio?.slice(0, 50)}...`);
  });

  // 批量更新所有记录
  for (const s of allSettings) {
    await prisma.userSettings.update({
      where: { id: s.id },
      data: {
        blogTitle: '晓桃自学英语',
        blogSubtitle: '学会的不只是英语',
        bio: '你好，我是晓桃。37岁，从零开始学英语。这里记录我不完美的每一步——计划、卡壳、着急、进步。没有逆袭神话，只有一个普通人真实地在走。',
      },
    });
    console.log(`\n✅ 已更新 userId=${s.userId} 的设置`);
  }

  // 验证更新结果
  const updated = await prisma.userSettings.findMany({
    select: { blogTitle: true, blogSubtitle: true, bio: true },
  });
  console.log('\n=== 验证结果 ===');
  updated.forEach((s, i) => {
    console.log(`记录 ${i + 1}: ${s.blogTitle} | ${s.blogSubtitle}`);
    console.log(`  bio: ${s.bio?.slice(0, 50)}...`);
  });

  console.log('\n✅ 数据库更新完成！');
}

main()
  .catch((e) => {
    console.error('❌ 更新失败:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
