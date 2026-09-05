import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";
import { rateLimit, getClientIP } from "@/lib/rateLimit";

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

    // 速率限制：每个IP每分钟最多10次尝试（防止暴力破解邀请码）
    const ip = getClientIP(request);
    const rateKey = `redeem:${ip}`;
    const limit = rateLimit(rateKey, 10, 60 * 1000);

    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: "尝试次数过多，请稍后再试" },
        { status: 429 }
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
    console.error("兑换邀请码失败:", error);
    return NextResponse.json(
      { success: false, error: "兑换失败，请稍后重试" },
      { status: 500 }
    );
  }
}
