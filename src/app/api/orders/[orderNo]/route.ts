import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";
import { NextResponse } from "next/server";

// 手动确认支付（管理员后台手动确认）
export async function PATCH(
  request: Request,
  { params }: { params: { orderNo: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
  }

  // 检查是否是管理员
  const adminUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { email: true },
  });
  if (adminUser?.email !== "admin@xiaotao.com") {
    return NextResponse.json({ success: false, error: "无权操作" }, { status: 403 });
  }

  const order = await prisma.memberOrder.findUnique({
    where: { orderNo: params.orderNo },
  });

  if (!order) {
    return NextResponse.json({ success: false, error: "订单不存在" }, { status: 404 });
  }

  if (order.status === "paid") {
    return NextResponse.json({ success: false, error: "订单已支付" }, { status: 400 });
  }

  // 更新订单状态
  await prisma.memberOrder.update({
    where: { id: order.id },
    data: {
      status: "paid",
      paidAt: new Date(),
      paymentMethod: "manual",
    },
  });

  // 自动开通会员
  const now = new Date();
  let memberExpiresAt: Date | null = null;

  if (order.days === 0) {
    memberExpiresAt = null;
  } else {
    const currentUser = await prisma.user.findUnique({
      where: { id: order.userId },
      select: { memberExpiresAt: true },
    });
    const base = currentUser?.memberExpiresAt && currentUser.memberExpiresAt > now
      ? currentUser.memberExpiresAt
      : now;
    memberExpiresAt = new Date(base.getTime() + order.days * 24 * 60 * 60 * 1000);
  }

  await prisma.user.update({
    where: { id: order.userId },
    data: {
      isMember: true,
      memberTier: order.tier,
      memberExpiresAt,
    },
  });

  // 发送通知
  await prisma.notification.create({
    data: {
      userId: order.userId,
      type: "membership",
      title: "会员开通成功",
      content: `管理员已确认你的会员支付。${order.days === 0 ? "终身有效" : `有效期至 ${memberExpiresAt?.toLocaleDateString("zh-CN")}`}`,
      link: "/membership",
    },
  });

  return NextResponse.json({ success: true });
}

// 查询订单状态
export async function GET(
  request: Request,
  { params }: { params: { orderNo: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
  }

  const order = await prisma.memberOrder.findUnique({
    where: { orderNo: params.orderNo },
    select: {
      id: true,
      orderNo: true,
      planId: true,
      tier: true,
      days: true,
      amount: true,
      status: true,
      paymentMethod: true,
      paidAt: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  if (!order) {
    return NextResponse.json({ success: false, error: "订单不存在" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: order });
}
