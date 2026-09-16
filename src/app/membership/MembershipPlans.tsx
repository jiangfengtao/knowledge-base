"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Crown, Sparkles, Heart, BookOpen, Lock, ArrowRight, Loader2, MessageCircle } from "lucide-react";

type Plan = {
  id: string;
  name: string;
  tier: string;
  days: number;
  price: number;
  priceYuan: string;
  originalPriceYuan: string;
  badge: string;
};

export default function MembershipPlans({ plans }: { plans: Plan[] }) {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderInfo, setOrderInfo] = useState<{ orderNo: string; tips?: string; wechatId?: string } | null>(null);
  const [error, setError] = useState("");

  const handlePurchase = async (planId: string) => {
    setLoading(true);
    setError("");
    setSelectedPlan(planId);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, paymentMethod: "manual" }),
      });
      const data = await res.json();

      if (data.success) {
        setOrderInfo({
          orderNo: data.data.orderNo,
          tips: data.data.tips,
          wechatId: data.data.wechatId,
        });
      } else {
        if (data.error?.includes("登录")) {
          router.push("/login?redirect=/membership");
        } else {
          setError(data.error || "创建订单失败");
        }
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  if (orderInfo) {
    return (
      <div className="max-w-md mx-auto bg-white border border-rule rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-green-500" />
        </div>
        <h3 className="text-lg font-bold text-ink mb-2">订单已创建</h3>
        <p className="text-sm text-muted mb-4">{orderInfo.tips}</p>
        <div className="bg-bg rounded-xl p-4 mb-4">
          <p className="text-xs text-muted mb-1">订单号</p>
          <p className="font-mono text-sm text-ink font-medium break-all">{orderInfo.orderNo}</p>
        </div>
        {orderInfo.wechatId && (
          <div className="bg-accent-soft rounded-xl p-4 mb-6">
            <p className="text-sm text-accent-deep font-medium">微信号：{orderInfo.wechatId}</p>
            <p className="text-xs text-muted mt-1">添加微信好友，发送订单号完成支付</p>
          </div>
        )}
        <button
          onClick={() => setOrderInfo(null)}
          className="w-full py-2.5 border border-rule rounded-xl text-sm text-muted hover:bg-bg transition-colors"
        >
          选择其他方案
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-16">
      {plans.map((plan) => {
        const isRecommended = plan.badge === "推荐";
        const isLifetime = plan.id === "lifetime";

        return (
          <div
            key={plan.id}
            className={`rounded-2xl p-6 text-left relative transition-all ${
              isRecommended
                ? "bg-gradient-to-br from-accent/5 to-accent-soft border-2 border-accent"
                : "bg-white border border-rule"
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className={`px-3 py-1 text-xs font-medium rounded-full text-white ${
                  isLifetime ? "bg-purple-500" : "bg-accent"
                }`}>
                  {plan.badge}
                </span>
              </div>
            )}
            <div className="text-sm font-medium text-accent-deep mb-1">{plan.name}</div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-3xl font-bold text-ink">¥{plan.priceYuan}</span>
              {plan.originalPriceYuan !== plan.priceYuan && (
                <span className="text-sm text-muted line-through">¥{plan.originalPriceYuan}</span>
              )}
            </div>
            <div className="text-sm text-muted mb-5">
              {isLifetime ? "一次付费，永久有效" : `约 ¥${(parseFloat(plan.priceYuan) / (plan.days / 30)).toFixed(1)}/月`}
            </div>
            <ul className="space-y-2.5 mb-6">
              <li className="flex items-start gap-2 text-sm text-ink">
                <Check size={16} className="text-accent-deep flex-shrink-0 mt-0.5" />
                <span>所有公开文章免费阅读</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-ink">
                <Check size={16} className="text-accent-deep flex-shrink-0 mt-0.5" />
                <span>会员专属深度内容</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-ink">
                <Check size={16} className="text-accent-deep flex-shrink-0 mt-0.5" />
                <span>社区发帖和问答</span>
              </li>
              {isLifetime && (
                <li className="flex items-start gap-2 text-sm text-ink">
                  <Check size={16} className="text-purple-500 flex-shrink-0 mt-0.5" />
                  <span>终身有效，无需续费</span>
                </li>
              )}
              {isLifetime && (
                <li className="flex items-start gap-2 text-sm text-ink">
                  <Check size={16} className="text-purple-500 flex-shrink-0 mt-0.5" />
                  <span>VIP 专属标识</span>
                </li>
              )}
            </ul>
            <button
              onClick={() => handlePurchase(plan.id)}
              disabled={loading && selectedPlan === plan.id}
              className={`w-full py-2.5 text-center rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
                isRecommended
                  ? "bg-accent hover:bg-accent-2 text-white"
                  : "border border-rule text-ink hover:bg-bg"
              } disabled:opacity-50`}
            >
              {loading && selectedPlan === plan.id ? (
                <><Loader2 size={14} className="animate-spin" /> 创建订单中...</>
              ) : (
                <>立即开通 <ArrowRight size={14} /></>
              )}
            </button>
          </div>
        );
      })}
      {error && (
        <div className="md:col-span-3 text-center text-sm text-red-500">{error}</div>
      )}
    </div>
  );
}
