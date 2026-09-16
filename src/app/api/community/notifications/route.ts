import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";
import { NextResponse } from "next/server";

// 获取通知列表
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unreadOnly") === "true";
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "30");

  const where: any = { userId: user.id };
  if (unreadOnly) where.isRead = false;

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.notification.count({
      where: { userId: user.id, isRead: false },
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: notifications,
    unreadCount,
    pagination: {
      page,
      pageSize,
      hasMore: notifications.length === pageSize,
    },
  });
}

// 标记通知为已读
export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
  }

  const body = await request.json();
  const { id, all } = body;

  if (all) {
    // 全部标记已读
    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });
  } else if (id) {
    await prisma.notification.update({
      where: { id, userId: user.id },
      data: { isRead: true },
    });
  }

  return NextResponse.json({ success: true });
}
