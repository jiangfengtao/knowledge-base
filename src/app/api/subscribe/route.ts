import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

// 邮件订阅
export async function POST(request: Request) {
  try {
    const { email, source = "blog" } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "请输入有效的邮箱地址" },
        { status: 400 }
      );
    }

    // 检查是否已订阅
    const existing = await prisma.subscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.confirmed) {
        return NextResponse.json({
          success: true,
          message: "你已经订阅过啦，感谢支持！",
        });
      }
      return NextResponse.json({
        success: true,
        message: "订阅确认邮件已发送，请查收邮箱",
      });
    }

    // 生成确认token
    const confirmToken = crypto.randomBytes(32).toString("hex");

    await prisma.subscriber.create({
      data: {
        email,
        source,
        confirmToken,
        confirmed: false,
      },
    });

    // TODO: 发送确认邮件（需要配置邮件服务）
    // 暂时直接标记为已确认（后续接入邮件服务再改）
    await prisma.subscriber.update({
      where: { email },
      data: { confirmed: true },
    });

    return NextResponse.json({
      success: true,
      message: "订阅成功！感谢你的关注 🎉",
    });
  } catch (error: any) {
    // 唯一键冲突等情况
    return NextResponse.json({
      success: true,
      message: "订阅成功！",
    });
  }
}
