import { Client } from 'pg';
import net from 'net';
import http from 'http';

const PROXY_HOST = '127.0.0.1';
const PROXY_PORT = 18080;
const DB_HOST = 'db.prisma.io';
const DB_PORT = 5432;

// 通过 HTTP CONNECT 代理建立 TCP 隧道
function createTunnel() {
  return new Promise((resolve, reject) => {
    const socket = net.connect(PROXY_PORT, PROXY_HOST, () => {
      const connectReq = http.request({
        host: PROXY_HOST,
        port: PROXY_PORT,
        method: 'CONNECT',
        path: `${DB_HOST}:${DB_PORT}`,
        headers: { Host: `${DB_HOST}:${DB_PORT}` },
      });

      connectReq.on('connect', (res, socket2) => {
        if (res.statusCode === 200) {
          resolve(socket2);
        } else {
          reject(new Error(`CONNECT failed: ${res.statusCode}`));
        }
      });

      connectReq.on('error', reject);
      connectReq.end();
    });

    socket.on('error', reject);
  });
}

async function main() {
  console.log('=== 通过代理隧道连接数据库 ===\n');

  try {
    const tunnelSocket = await createTunnel();
    console.log('✅ 代理隧道建立成功');

    const client = new Client({
      host: DB_HOST,
      port: DB_PORT,
      user: 'fc3594a5600795117f24565eb9925fcfe233ed362edff090cef99de0cc89a536',
      password: 'sk_7gJdWxU1wkWCOpavWI_VB',
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      stream: tunnelSocket,
    });

    await client.connect();
    console.log('✅ 数据库连接成功');

    // 查看当前设置
    const result = await client.query('SELECT "id", "userId", "blogTitle", "blogSubtitle", "bio" FROM "UserSettings"');
    console.log(`找到 ${result.rows.length} 条记录`);
    result.rows.forEach((s, i) => {
      console.log(`\n--- 记录 ${i + 1} ---`);
      console.log(`  userId: ${s.userId}`);
      console.log(`  blogTitle: ${s.blogTitle}`);
      console.log(`  blogSubtitle: ${s.blogSubtitle}`);
      console.log(`  bio: ${s.bio?.slice(0, 50)}...`);
    });

    // 更新
    await client.query(`
      UPDATE "UserSettings" 
      SET "blogTitle" = $1, 
          "blogSubtitle" = $2, 
          "bio" = $3,
          "updatedAt" = NOW()
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
    });

    await client.end();
    console.log('\n✅ 全部完成！');
  } catch (e) {
    console.error('❌ 失败:', e.message);
    process.exit(1);
  }
}

main();
