import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 简单的内存去重，防止同一用户短时间内重复计数
const viewCache = new Map<string, number>();
const VIEW_COOLDOWN = 60 * 1000; // 1分钟内同一IP同一文章只计一次

function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}

// 记录阅读量（公开接口，任何人都可以调用）
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ip = getClientIP(request);
    const cacheKey = `${ip}:${params.id}`;
    const lastView = viewCache.get(cacheKey);
    const now = Date.now();

    // 冷却期内不重复计数
    if (lastView && now - lastView < VIEW_COOLDOWN) {
      const doc = await prisma.document.findUnique({
        where: { id: params.id },
        select: { viewCount: true },
      });
      return NextResponse.json({
        success: true,
        viewCount: doc?.viewCount || 0,
      });
    }

    viewCache.set(cacheKey, now);

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
