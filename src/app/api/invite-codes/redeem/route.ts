import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";

// 兑换邀请码
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "未登录" },
        { status: 401 }
      );
    }

    const { code } = await request.json();
    if (!code) {
      return NextResponse.json(
        { success: false, error: "请输入邀请码" },
        { status: 400 }
      );
    }

    // 查找邀请码
    const inviteCode = await prisma.inviteCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!inviteCode) {
      return NextResponse.json(
        { success: false, error: "邀请码无效" },
        { status: 400 }
      );
    }

    if (inviteCode.isUsed) {
      return NextResponse.json(
        { success: false, error: "邀请码已被使用" },
        { status: 400 }
      );
    }

    // 计算会员到期时间
    let expiresAt = null;
    if (inviteCode.days > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + inviteCode.days);
    }

    // 更新用户会员状态
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isMember: true,
        memberExpiresAt: expiresAt,
        memberTier: inviteCode.tier,
        usedInviteCodeId: inviteCode.id,
      },
    });

    // 标记邀请码已使用
    await prisma.inviteCode.update({
      where: { id: inviteCode.id },
      data: {
        isUsed: true,
        usedBy: user.id,
        usedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "会员激活成功！",
      tier: inviteCode.tier,
      expiresAt,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
