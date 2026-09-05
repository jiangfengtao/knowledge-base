import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";

// 获取订阅者列表（需要登录）
export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: "未登录" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "50", 10);

  const where: any = {};

  if (search) {
    where.email = {
      contains: search,
      mode: "insensitive",
    };
  }

  // 统计数据
  const [total, confirmedCount, subscribers] = await Promise.all([
    prisma.subscriber.count(),
    prisma.subscriber.count({ where: { confirmed: true } }),
    prisma.subscriber.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        email: true,
        source: true,
        confirmed: true,
        createdAt: true,
        lastSentAt: true,
      },
    }),
  ]);

  const filteredTotal = search
    ? await prisma.subscriber.count({ where })
    : total;

  return NextResponse.json({
    success: true,
    data: {
      subscribers,
      total,
      confirmedCount,
      filteredTotal,
      page,
      pageSize,
    },
  });
}
