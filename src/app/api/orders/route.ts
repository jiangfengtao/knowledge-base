import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { MEMBERSHIP_PLANS } from "@/lib/membership-plans";

// 获取方案列表
export async function GET() {
  return NextResponse.json({
    success: true,
    data: MEMBERSHIP_PLANS.map((p) => ({
      ...p,
      priceYuan: (p.price / 100).toFixed(2),
      originalPriceYuan: (p.originalPrice / 100).toFixed(2),
    })),
  });
}

// 创建订单
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
  }

  const body = await request.json();
  const { planId, paymentMethod = "manual" } = body;

  const plan = MEMBERSHIP_PLANS.find((p) => p.id === planId);
  if (!plan) {
    return NextResponse.json({ success: false, error: "方案不存在" }, { status: 400 });
  }

  // 生成唯一订单号
  const orderNo = `XT${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  // 创建订单（有效期30分钟）
  const order = await prisma.memberOrder.create({
    data: {
      orderNo,
      userId: user.id,
      planId: plan.id,
      tier: plan.tier,
      days: plan.days,
      amount: plan.price,
      paymentMethod,
      status: "pending",
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30分钟超时
    },
  });

  // 如果配置了微信支付，生成支付参数
  const wechatAppId = process.env.WECHAT_APP_ID;
  const wechatMchId = process.env.WECHAT_MCH_ID;
  const wechatApiKey = process.env.WECHAT_API_KEY;

  if (paymentMethod === "wechat" && wechatAppId && wechatMchId && wechatApiKey) {
    // 微信支付 - Native 支付（扫码支付）
    const notifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://xiaotaotop.com"}/api/orders/wechat-callback`;
    const nonceStr = crypto.randomBytes(16).toString("hex");

    // 构造统一下单请求参数
    const params: Record<string, string> = {
      appid: wechatAppId,
      mch_id: wechatMchId,
      nonce_str: nonceStr,
      body: `晓桃自学英语 - ${plan.name}`,
      out_trade_no: orderNo,
      total_fee: String(plan.price),
      spbill_create_ip: "127.0.0.1",
      notify_url: notifyUrl,
      trade_type: "NATIVE",
      product_id: plan.id,
    };

    // 生成签名
    const sortedKeys = Object.keys(params).sort();
    const stringA = sortedKeys.map((k) => `${k}=${params[k]}`).join("&");
    const stringSignTemp = stringA + `&key=${wechatApiKey}`;
    const sign = crypto.createHash("md5").update(stringSignTemp, "utf8").digest("hex").toUpperCase();
    params.sign = sign;

    // 构造 XML
    const xml = Object.entries(params)
      .map(([k, v]) => `<${k}><![CDATA[${v}]]></${k}>`)
      .join("");

    // 请求微信统一下单接口
    try {
      const response = await fetch("https://api.mch.weixin.qq.com/pay/unifiedorder", {
        method: "POST",
        headers: { "Content-Type": "application/xml" },
        body: `<xml>${xml}</xml>`,
      });

      const responseText = await response.text();

      // 解析返回的 code_url（二维码链接）
      const codeUrlMatch = responseText.match(/<code_url><!\[CDATA\[(.+?)\]\]><\/code_url>/);
      if (codeUrlMatch) {
        return NextResponse.json({
          success: true,
          data: {
            orderId: order.id,
            orderNo,
            codeUrl: codeUrlMatch[1],
            amount: plan.price,
            amountYuan: (plan.price / 100).toFixed(2),
          },
        });
      } else {
        // 微信支付下单失败，回退到手动支付
        console.error("Wechat pay error:", responseText);
      }
    } catch (err) {
      console.error("Wechat pay request failed:", err);
    }
  }

  // 手动支付模式（未配置微信支付或配置失败时）
  return NextResponse.json({
    success: true,
    data: {
      orderId: order.id,
      orderNo,
      paymentMethod,
      amount: plan.price,
      amountYuan: (plan.price / 100).toFixed(2),
      plan: plan.name,
      tier: plan.tier,
      days: plan.days,
      // 手动支付的说明
      manualPay: true,
      wechatId: process.env.WECHAT_CONTACT_ID || "xiaotao-english",
      tips: "请添加微信好友，发送订单号完成支付后自动开通会员",
    },
  });
}
