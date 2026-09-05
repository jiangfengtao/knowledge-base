import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";

// 获取所有会员用户列表
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "未登录" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    const where: any = {
      isMember: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const members = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        isMember: true,
        memberTier: true,
        memberExpiresAt: true,
        createdAt: true,
      },
    });

    // 计算会员状态
    const now = new Date();
    const membersWithStatus = members.map((m) => ({
      ...m,
      status:
        m.memberExpiresAt && m.memberExpiresAt < now ? "expired" : "active",
    }));

    return NextResponse.json({
      success: true,
      members: membersWithStatus,
      total: members.length,
    });
  } catch (error: any) {
    console.error("Get members error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "获取会员列表失败" },
      { status: 500 }
    );
  }
}
