import Link from "next/link";
import {
  Crown,
  Lock,
  Check,
  ArrowRight,
  BookOpen,
  Sparkles,
  Heart,
  MessageCircle,
} from "lucide-react";
import type { Metadata } from "next";
import ThemeToggle from "@/components/ThemeToggle";
import MobileBottomNav from "@/components/MobileBottomNav";
import MembershipPlans from "./MembershipPlans";
import { MEMBERSHIP_PLANS } from "@/lib/membership-plans";

export const metadata: Metadata = {
  title: "加入会员 - 晓桃终生成长",
  description: "加入晓桃的会员社区，获取完整的学习笔记、成长方法论、独家内容，和晓桃一起终身成长。",
  alternates: { canonical: "https://xiaotaotop.com/membership" },
};

export default function MembershipPage() {
  const benefits = [
    { icon: <BookOpen size={20} />, title: "全部深度文章", desc: "所有会员专属文章，包含学习方法论、成长复盘、实操教程" },
    { icon: <Sparkles size={20} />, title: "学习过程全记录", desc: "从零基础到进阶的完整学习日记，踩过的坑、用过的方法全部公开" },
    { icon: <MessageCircle size={20} />, title: "社区互动", desc: "加入社区，发帖讨论、提问答疑、和同频成长者一起进步" },
    { icon: <Heart size={20} />, title: "成长社群", desc: "加入同频成长者的社群，互相监督、共同进步" },
    { icon: <Lock size={20} />, title: "私密内容", desc: "不方便公开发布的深度思考、行业洞察、个人感悟" },
    { icon: <Crown size={20} />, title: "优先答疑", desc: "会员提问优先回复，学习路上少走弯路" },
  ];

  const plans = MEMBERSHIP_PLANS.map((p) => ({
    ...p,
    priceYuan: (p.price / 100).toFixed(2),
    originalPriceYuan: (p.originalPrice / 100).toFixed(2),
  }));

  return (
    <div className="min-h-screen bg-bg">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-rule">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold">晓桃</div>
            <span className="font-semibold text-ink">晓桃终生成长</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/blog" className="text-sm text-muted hover:text-accent-deep transition-colors hidden sm:inline">博客</Link>
            <Link href="/community" className="text-sm text-muted hover:text-accent-deep transition-colors hidden sm:inline">社区</Link>
            <Link href="/about" className="text-sm text-muted hover:text-accent-deep transition-colors hidden sm:inline">关于</Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-soft text-accent-deep text-sm font-medium rounded-full mb-6">
          <Crown size={16} />
          <span>晓桃会员</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-ink mb-6 leading-tight">
          和我一起，<span className="text-accent-deep">终身成长</span>
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto mb-12 leading-relaxed">
          这里记录着我从零基础开始学习的全过程。英语、阅读、思考……不只是分享结果，更分享一路走来的每一步。如果你也想成长，欢迎加入。
        </p>

        {/* 价格方案 */}
        <MembershipPlans plans={plans} />
      </section>

      {/* 权益详情 */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        <h2 className="text-2xl font-bold text-ink text-center mb-12">会员能获得什么？</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((item, i) => (
            <div key={i} className="bg-white border border-rule rounded-xl p-6 hover:border-accent/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center text-accent-deep mb-4">
                {item.icon}
              </div>
              <h3 className="font-semibold text-ink mb-2">{item.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 邀请码入口 */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 text-center">
        <div className="bg-bg border border-rule rounded-2xl p-8">
          <h3 className="font-semibold text-ink mb-2">已有邀请码？</h3>
          <p className="text-sm text-muted mb-4">如果你已经通过其他方式获得了邀请码，可以直接在这里兑换</p>
          <Link
            href="/redeem"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-rule rounded-xl text-sm text-ink hover:bg-white transition-colors"
          >
            使用邀请码开通 <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-20">
        <h2 className="text-2xl font-bold text-ink text-center mb-10">常见问题</h2>
        <div className="space-y-4">
          {[
            { q: "怎么开通会员？", a: "选择方案后系统会自动创建订单，添加微信好友发送订单号完成支付后即可开通。配置微信支付后也可以扫码直接支付。" },
            { q: "会员有效期是多久？", a: "月度会员30天，年度会员365天，终身会员永久有效。续费时会在原有到期时间上叠加。" },
            { q: "可以退款吗？", a: "虚拟商品一经开通不支持退款，请先阅读免费文章确认内容是否适合你。" },
            { q: "会员内容多久更新一次？", a: "我会持续更新，至少每周1-2篇深度内容。成长是一辈子的事，我会一直写下去。" },
            { q: "社区和博客有什么区别？", a: "博客是我写的文章，社区是大家一起交流的地方。会员可以发帖、提问、互相回复。" },
          ].map((faq, i) => (
            <div key={i} className="bg-white border border-rule rounded-xl p-6">
              <h4 className="font-medium text-ink mb-2 text-sm">{faq.q}</h4>
              <p className="text-sm text-muted leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <MobileBottomNav />
    </div>
  );
}
