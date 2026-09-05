import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { rateLimit, getClientIP } from "@/lib/rateLimit";

// 记录阅读量（公开接口，任何人都可以调用）
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ip = getClientIP(request);
    const cacheKey = `view:${ip}:${params.id}`;

    // 1分钟内同一IP同一文章只计一次（防止刷量）
    const limit = rateLimit(cacheKey, 1, 60 * 1000);

    if (!limit.allowed) {
      const doc = await prisma.document.findUnique({
        where: { id: params.id },
        select: { viewCount: true },
      });
      return NextResponse.json({
        success: true,
        viewCount: doc?.viewCount || 0,
      });
    }

    // 自增阅读量
    const doc = await prisma.document.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
      select: { viewCount: true },
    });

    return NextResponse.json({
      success: true,
      viewCount: doc.viewCount,
    });
  } catch (error: any) {
    console.error("记录阅读量失败:", error);
    return NextResponse.json(
      { success: false, error: "记录失败" },
      { status: 500 }
    );
  }
}
