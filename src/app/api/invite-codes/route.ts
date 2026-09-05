import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";

// 生成邀请码（仅管理员/作者自己）
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "未登录" },
        { status: 401 }
      );
    }

    const { days = 365, tier = "premium", count = 1 } = await request.json();

    const codes = [];
    for (let i = 0; i < count; i++) {
      // 生成8位随机邀请码
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      const inviteCode = await prisma.inviteCode.create({
        data: {
          code,
          days,
          tier,
          createdBy: user.id,
        },
      });
      codes.push(inviteCode);
    }

    return NextResponse.json({ success: true, codes });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 获取邀请码列表（包含使用情况）
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "未登录" },
        { status: 401 }
      );
    }

    const codes = await prisma.inviteCode.findMany({
      where: { createdBy: user.id },
      orderBy: { createdAt: "desc" },
    });

    // 查询使用者信息
    const usedByUserIds = codes
      .filter((c) => c.usedBy)
      .map((c) => c.usedBy as string);

    let usedByUsers: Record<string, { name: string; email: string }> = {};
    if (usedByUserIds.length > 0) {
      const users = await prisma.user.findMany({
        where: { id: { in: usedByUserIds } },
        select: { id: true, name: true, email: true },
      });
      users.forEach((u) => {
        usedByUsers[u.id] = { name: u.name, email: u.email };
      });
    }

    // 格式化返回
    const formattedCodes = codes.map((code) => ({
      id: code.id,
      code: code.code,
      tier: code.tier,
      days: code.days,
      isUsed: code.isUsed,
      usedBy: code.usedBy,
      usedByName: code.usedBy ? usedByUsers[code.usedBy]?.name || null : null,
      usedByEmail: code.usedBy ? usedByUsers[code.usedBy]?.email || null : null,
      createdAt: code.createdAt,
      usedAt: code.usedAt,
    }));

    return NextResponse.json({ success: true, codes: formattedCodes });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
