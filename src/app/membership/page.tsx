import Link from "next/link";
import {
  Crown,
  Lock,
  Check,
  ArrowRight,
  BookOpen,
  Sparkles,
  Heart,
} from "lucide-react";
import type { Metadata } from "next";
import ThemeToggle from "@/components/ThemeToggle";
import MobileBottomNav from "@/components/MobileBottomNav";

export const metadata: Metadata = {
  title: "加入会员 - 晓桃终生成长",
  description:
    "加入晓桃的会员社区，获取完整的学习笔记、成长方法论、独家内容，和晓桃一起终身成长。",
  alternates: {
    canonical: "https://xiaotaotop.com/membership",
  },
};

export default function MembershipPage() {
  const benefits = [
    {
      icon: <BookOpen size={20} />,
      title: "全部深度文章",
      desc: "所有会员专属文章，包含学习方法论、成长复盘、实操教程",
    },
    {
      icon: <Sparkles size={20} />,
      title: "学习过程全记录",
      desc: "从零基础到进阶的完整学习日记，踩过的坑、用过的方法全部公开",
    },
    {
      icon: <Heart size={20} />,
      title: "成长社群",
      desc: "加入同频成长者的社群，互相监督、共同进步",
    },
    {
      icon: <Lock size={20} />,
      title: "私密内容",
      desc: "不方便公开发布的深度思考、行业洞察、个人感悟",
    },
    {
      icon: <Crown size={20} />,
      title: "优先答疑",
      desc: "会员提问优先回复，学习路上少走弯路",
    },
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-rule">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold">
              晓桃
            </div>
            <span className="font-semibold text-ink">晓桃终生成长</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              className="text-sm text-muted hover:text-accent-deep transition-colors"
            >
              博客
            </Link>
            <Link
              href="/about"
              className="text-sm text-muted hover:text-accent-deep transition-colors"
            >
              关于
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent-soft text-accent-deep text-sm font-medium rounded-full mb-6">
          <Crown size={16} />
          <span>晓桃会员</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-ink mb-6 leading-tight">
          和我一起，
          <span className="text-accent-deep">终身成长</span>
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
          这里记录着我从零基础开始学习的全过程。
          英语、阅读、健身、思考……
          不只是分享结果，更分享一路走来的每一步。
          如果你也想成长，欢迎加入。
        </p>

        {/* 价格卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-16">
          {/* 免费 */}
          <div className="bg-white border border-rule rounded-2xl p-8 text-left">
            <div className="text-sm font-medium text-muted mb-2">免费</div>
            <div className="text-3xl font-bold text-ink mb-1">¥0</div>
            <div className="text-sm text-muted mb-6">永久免费</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2 text-sm text-ink">
                <Check size={18} className="text-accent-deep flex-shrink-0 mt-0.5" />
                <span>公开文章全部免费阅读</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-ink">
                <Check size={18} className="text-accent-deep flex-shrink-0 mt-0.5" />
                <span>RSS / 邮件订阅更新</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-ink">
                <Check size={18} className="text-accent-deep flex-shrink-0 mt-0.5" />
                <span>文章评论互动</span>
              </li>
            </ul>
            <Link
              href="/blog"
              className="block w-full py-2.5 text-center border border-rule rounded-xl text-ink hover:bg-bg transition-colors text-sm font-medium"
            >
              开始阅读
            </Link>
          </div>

          {/* 会员 */}
          <div className="bg-gradient-to-br from-accent/5 to-accent-soft border-2 border-accent rounded-2xl p-8 text-left relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="px-2 py-0.5 bg-accent text-white text-xs font-medium rounded-full">
                推荐
              </span>
            </div>
            <div className="text-sm font-medium text-accent-deep mb-2">
              年度会员
            </div>
            <div className="text-3xl font-bold text-ink mb-1">¥199</div>
            <div className="text-sm text-muted mb-6">
              / 年 （约 ¥16.6/月）
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start gap-2 text-sm text-ink">
                <Check size={18} className="text-accent-deep flex-shrink-0 mt-0.5" />
                <span>所有免费权益</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-ink">
                <Check size={18} className="text-accent-deep flex-shrink-0 mt-0.5" />
                <span>全部会员专属深度文章</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-ink">
                <Check size={18} className="text-accent-deep flex-shrink-0 mt-0.5" />
                <span>完整学习日记和成长记录</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-ink">
                <Check size={18} className="text-accent-deep flex-shrink-0 mt-0.5" />
                <span>私密思考和行业洞察</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-ink">
                <Check size={18} className="text-accent-deep flex-shrink-0 mt-0.5" />
                <span>会员专属社群</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-ink">
                <Check size={18} className="text-accent-deep flex-shrink-0 mt-0.5" />
                <span>优先答疑</span>
              </li>
            </ul>
            <Link
              href="/redeem"
              className="block w-full py-2.5 text-center bg-accent hover:bg-accent-2 text-white rounded-xl transition-colors text-sm font-medium flex items-center justify-center gap-1"
            >
              使用邀请码开通
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* 权益详情 */}
        <div className="text-left">
          <h2 className="text-2xl font-bold text-ink text-center mb-12">
            会员能获得什么？
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((item, i) => (
              <div
                key={i}
                className="bg-white border border-rule rounded-xl p-6 hover:border-accent/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center text-accent-deep mb-4">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-ink mb-2">{item.title}</h3>
                <p className="text-sm text-muted leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20 text-left">
          <h2 className="text-2xl font-bold text-ink text-center mb-10">
            常见问题
          </h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            {[
              {
                q: "怎么开通会员？",
                a: "添加我的微信（xiaotaotop），转账后我会给你一个邀请码，在网站输入邀请码即可开通。",
              },
              {
                q: "会员有效期是多久？",
                a: "年度会员自开通之日起一年内有效。到期前会提醒续费。",
              },
              {
                q: "可以退款吗？",
                a: "虚拟商品一经开通不支持退款，请先阅读免费文章确认内容是否适合你。",
              },
              {
                q: "会员内容多久更新一次？",
                a: "我会持续更新，至少每周1-2篇深度内容。成长是一辈子的事，我会一直写下去。",
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="bg-white border border-rule rounded-xl p-6"
              >
                <h3 className="font-semibold text-ink mb-2">{faq.q}</h3>
                <p className="text-sm text-muted leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="border-t border-rule bg-white pb-16 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-muted">
          <p>© {new Date().getFullYear()} 晓桃终生成长 · 用知识点亮成长之路</p>
          <p className="mt-2 text-xs">
            <Link
              href="/feed.xml"
              className="hover:text-accent-deep transition-colors"
            >
              RSS 订阅
            </Link>
          </p>
        </div>
      </footer>

      {/* 移动端底部导航 */}
      <MobileBottomNav />
    </div>
  );
}
