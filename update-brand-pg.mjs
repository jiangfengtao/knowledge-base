import { Client } from 'pg';

const client = new Client({
  connectionString: 'postgres://fc3594a5600795117f24565eb9925fcfe233ed362edff090cef99de0cc89a536:sk_7gJdWxU1wkWCOpavWI_VB@db.prisma.io:5432/postgres?sslmode=require',
  ssl: { rejectUnauthorized: false },
});

async function main() {
  console.log('=== 更新网站品牌名称 ===\n');
  
  await client.connect();
  console.log('✅ 数据库连接成功');

  // 查看当前设置
  const result = await client.query('SELECT "id", "userId", "blogTitle", "blogSubtitle", "bio" FROM "UserSettings"');
  console.log(`找到 ${result.rows.length} 条记录`);
  result.rows.forEach((s, i) => {
    console.log(`\n--- 记录 ${i + 1} ---`);
    console.log(`  userId: ${s.userId}`);
    console.log(`  当前 blogTitle: ${s.blogTitle}`);
    console.log(`  当前 blogSubtitle: ${s.blogSubtitle}`);
    console.log(`  当前 bio: ${s.bio?.slice(0, 50)}...`);
  });

  // 更新所有记录
  await client.query(`
    UPDATE "UserSettings" 
    SET "blogTitle" = $1, 
        "blogSubtitle" = $2, 
        "bio" = $3
  `, [
    '晓桃自学英语',
    '学会的不只是英语',
    '你好，我是晓桃。37岁，从零开始学英语。这里记录我不完美的每一步——计划、卡壳、着急、进步。没有逆袭神话，只有一个普通人真实地在走。'
  ]);
  
  console.log('\n✅ 数据库更新完成！');

  // 验证
  const verify = await client.query('SELECT "blogTitle", "blogSubtitle", "bio" FROM "UserSettings"');
  console.log('\n=== 验证结果 ===');
  verify.rows.forEach((s, i) => {
    console.log(`记录 ${i + 1}: ${s.blogTitle} | ${s.blogSubtitle}`);
    console.log(`  bio: ${s.bio?.slice(0, 50)}...`);
  });

  await client.end();
  console.log('\n✅ 全部完成！');
}

main().catch(e => {
  console.error('❌ 失败:', e.message);
  process.exit(1);
});
