#!/usr/bin/env node
/**
 * 自动根据 DATABASE_URL 切换 Prisma 数据库 provider
 * - file: 开头 → sqlite（本地开发）
 * - postgres: / postgresql: 开头 → postgresql（生产/Vercel）
 *
 * 运行时机：prebuild / predev / postinstall 之前
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, "..", "prisma", "schema.prisma");

const dbUrl = process.env.DATABASE_URL || "file:./dev.db";
const isPostgres = dbUrl.startsWith("postgres");
const provider = isPostgres ? "postgresql" : "sqlite";

if (!existsSync(schemaPath)) {
  console.error("schema.prisma not found at", schemaPath);
  process.exit(1);
}

let schema = readFileSync(schemaPath, "utf-8");

// 替换 provider 行
const providerRegex = /(\s*provider\s*=\s*)"(sqlite|postgresql)"/;
if (!providerRegex.test(schema)) {
  console.error("Could not find provider in schema.prisma");
  process.exit(1);
}

schema = schema.replace(providerRegex, `$1"${provider}"`);
writeFileSync(schemaPath, schema);

console.log(`[setup-prisma] DATABASE_URL=${dbUrl.substring(0, 30)}... → provider=${provider}`);
