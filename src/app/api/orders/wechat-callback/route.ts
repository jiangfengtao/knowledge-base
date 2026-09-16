import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

// 微信支付回调（异步通知）
export async function POST(request: Request) {
  const body = await request.text();

  try {
    // 解析 XML
    const getData = (tag: string): string => {
      const match = body.match(new RegExp(`<${tag}><!\\[CDATA\\[(.+?)\\]\\]></${tag}>`));
      return match ? match[1] : "";
    };

    const returnCode = getData("return_code");
    const resultCode = getData("result_code");
    const outTradeNo = getData("out_trade_no");
    const transactionId = getData("transaction_id");
    const totalFee = getData("total_fee");
    const sign = getData("sign");

    // 验签
    const wechatApiKey = process.env.WECHAT_API_KEY;
    if (!wechatApiKey) {
      return NextResponse.json(
        `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[未配置API密钥]]></return_msg></xml>`,
        { headers: { "Content-Type": "application/xml" } }
      );
    }

    // 重新组装参数验签
    const params: Record<string, string> = {};
    const tagRegex = /<(\w+)><!\[CDATA\[(.+?)\]\]><\/\1>/g;
    let match;
    while ((match = tagRegex.exec(body)) !== null) {
      if (match[1] !== "sign") {
        params[match[1]] = match[2];
      }
    }
    const sortedKeys = Object.keys(params).sort();
    const stringA = sortedKeys.map((k) => `${k}=${params[k]}`).join("&");
    const stringSignTemp = stringA + `&key=${wechatApiKey}`;
    const expectedSign = crypto.createHash("md5").update(stringSignTemp, "utf8").digest("hex").toUpperCase();

    if (sign !== expectedSign) {
      return NextResponse.json(
        `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[签名验证失败]]></return_msg></xml>`,
        { headers: { "Content-Type": "application/xml" } }
      );
    }

    if (returnCode !== "SUCCESS" || resultCode !== "SUCCESS") {
      return NextResponse.json(
        `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[支付失败]]></return_msg></xml>`,
        { headers: { "Content-Type": "application/xml" } }
      );
    }

    // 查找订单
    const order = await prisma.memberOrder.findUnique({
      where: { orderNo: outTradeNo },
    });

    if (!order) {
      return NextResponse.json(
        `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[订单不存在]]></return_msg></xml>`,
        { headers: { "Content-Type": "application/xml" } }
      );
    }

    // 已支付，不重复处理
    if (order.status === "paid") {
      return NextResponse.json(
        `<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>`,
        { headers: { "Content-Type": "application/xml" } }
      );
    }

    // 验证金额
    if (parseInt(totalFee) !== order.amount) {
      return NextResponse.json(
        `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[金额不匹配]]></return_msg></xml>`,
        { headers: { "Content-Type": "application/xml" } }
      );
    }

    // 更新订单状态
    await prisma.memberOrder.update({
      where: { id: order.id },
      data: {
        status: "paid",
        transactionId,
        paidAt: new Date(),
      },
    });

    // 自动开通会员
    const now = new Date();
    let memberExpiresAt: Date | null = null;

    if (order.days === 0) {
      // 终身会员
      memberExpiresAt = null;
    } else {
      // 在现有到期时间基础上加天数（续费场景）
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

    // 发送站内通知
    await prisma.notification.create({
      data: {
        userId: order.userId,
        type: "membership",
        title: "会员开通成功",
        content: `恭喜你成为${order.tier === "vip" ? "VIP" : "高级"}会员！${order.days === 0 ? "终身有效" : `有效期至 ${memberExpiresAt?.toLocaleDateString("zh-CN")}`}`,
        link: "/membership",
      },
    });

    return NextResponse.json(
      `<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>`,
      { headers: { "Content-Type": "application/xml" } }
    );
  } catch (err) {
    console.error("Wechat callback error:", err);
    return NextResponse.json(
      `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[服务器异常]]></return_msg></xml>`,
      { headers: { "Content-Type": "application/xml" } }
    );
  }
}
