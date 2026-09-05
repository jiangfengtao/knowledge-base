import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 一次性迁移脚本：将 isPublic 字段迁移到 visibility
// isPublic=true -> visibility="public"
// isPublic=false -> visibility="private"
export async function POST() {
  try {
    // 更新所有文档的 visibility 字段
    const result = await prisma.$executeRaw`
      UPDATE "Document" 
      SET "visibility" = CASE WHEN "isPublic" = true THEN 'public' ELSE 'private' END
      WHERE "visibility" = 'private' AND "isPublic" = true
    `;

    return NextResponse.json({
      success: true,
      message: `已迁移 ${result} 篇文档`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
