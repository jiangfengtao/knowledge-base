import prisma from "@/lib/prisma";
import { getDefaultUser } from "@/lib/user";
import Link from "next/link";
import type { Metadata } from "next";
import ThemeToggle from "@/components/ThemeToggle";
import MobileBottomNav from "@/components/MobileBottomNav";
import {
  FileText,
  Type,
  Eye,
  Calendar,
  BookOpen,
  Clock,
  Mail,
  Rss,
  ArrowRight,
  Sparkles,
  Award,
  TrendingUp,
  Film,
} from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const user = await getDefaultUser();
  const settings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  const blogTitle = settings?.blogTitle || "晓桃终生成长";
  return {
    title: `关于 - ${blogTitle}`,
    description: settings?.bio || `关于${blogTitle}`,
  };
}

// 数字格式化
function formatNumber(num: number): string {
  if (num >= 10000) return (num / 10000).toFixed(1) + "万";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toString();
}

export const revalidate = 3600; // 关于页每小时重新生成一次

export default async function AboutPage() {
  const user = await getDefaultUser();
  const settings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  const blogTitle = settings?.blogTitle || "晓桃终生成长";
  const blogSubtitle =
    settings?.blogSubtitle ||
    "记录学习、思考与成长的点滴。关于英语学习、个人成长、以及那些让生活更美好的小发现。";
  const bio =
    settings?.bio ||
    "你好，我是晓桃。一个在终生学习路上的普通人。\n这里记录我的学习笔记、思考和成长。关于自媒体运营、个人成长、以及那些让生活更美好的小发现。\n我相信知识的力量，也相信分享的价值。这个博客是我学习和思考的输出窗口，希望这些内容能对你有所帮助。";
  const avatarUrl = settings?.avatarUrl || "";

  // 解析社交链接
  let socialLinks: Record<string, string> = {};
  try {
    if (settings?.socialLinks) {
      socialLinks = JSON.parse(settings.socialLinks);
    }
  } catch (e) {
    console.error("Failed to parse socialLinks", e);
  }

  // 社交链接配置
  const socialConfig = [
    { key: "wechat", label: "微信", icon: "💬" },
    { key: "weibo", label: "微博", icon: "📢" },
    { key: "zhihu", label: "知乎", icon: "💡" },
    { key: "xiaohongshu", label: "小红书", icon: "📕" },
    { key: "github", label: "GitHub", icon: "💻" },
    { key: "email", label: "邮箱", icon: "📧" },
  ];

  const availableSocials = socialConfig.filter(
    (item) => socialLinks[item.key] && socialLinks[item.key].trim() !== ""
  );

  // 将 bio 按换行符分段
  const bioParagraphs = bio.split(/\n+/).filter((p) => p.trim() !== "");

  // 获取统计数据
  const [totalDocs, totalWords, totalViews, publicCount, videoCount, categoriesCount, subscriberCount] = await Promise.all([
    prisma.document.count({ where: { userId: user.id, isDeleted: false } }),
    prisma.document.aggregate({ where: { userId: user.id, isDeleted: false }, _sum: { wordCount: true } }),
    prisma.document.aggregate({ where: { userId: user.id, isDeleted: false }, _sum: { viewCount: true } }),
    prisma.document.count({ where: { userId: user.id, isDeleted: false, visibility: "public" } }),
    prisma.document.count({ where: { userId: user.id, isDeleted: false, isVideo: true } }),
    prisma.knowledgeBase.count({ where: { userId: user.id, categoryCode: { startsWith: "blog-" } } }),
    prisma.subscriber.count(),
  ]);

  // 获取主要分类
  const mainCategories = await prisma.knowledgeBase.findMany({
    where: {
      userId: user.id,
      categoryCode: { startsWith: "blog-" },
      documents: { some: { visibility: "public", isDeleted: false } },
    },
    select: {
      id: true,
      name: true,
      icon: true,
      color: true,
      description: true,
      _count: { select: { documents: { where: { visibility: "public", isDeleted: false } } } },
    },
    orderBy: { sortOrder: "asc" },
    take: 7,
  });

  const stats = [
    { label: "原创文章", value: totalDocs, icon: FileText, color: "text-accent", bg: "bg-accent-soft" },
    { label: "总字数", value: formatNumber(totalWords._sum.wordCount || 0), icon: Type, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "总阅读量", value: formatNumber(totalViews._sum.viewCount || 0), icon: Eye, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "视频内容", value: videoCount, icon: Film, color: "text-rose-500", bg: "bg-rose-50" },
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-rule">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2">
            {avatarUrl ? (
              <img src={avatarUrl} alt={blogTitle} className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold">晓桃</div>
            )}
            <span className="font-semibold text-ink">{blogTitle}</span>
          </Link>
          <div className="flex items-center gap-4 text-sm text-muted">
            <Link href="/blog" className="hover:text-accent-deep transition-colors hidden sm:inline">博客</Link>
            <Link href="/videos" className="hover:text-accent-deep transition-colors hidden sm:inline">视频</Link>
            <Link href="/timeline" className="hover:text-accent-deep transition-colors hidden sm:inline">时间线</Link>
            <Link href="/membership" className="hover:text-accent-deep transition-colors hidden sm:inline">会员</Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero 区域 */}
      <section className="bg-gradient-to-b from-accent-soft/40 to-transparent py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center text-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={blogTitle}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover shadow-xl border-4 border-white mb-6"
              />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-accent to-accent-deep flex items-center justify-center text-white text-5xl font-bold shadow-xl mb-6">
                晓桃
              </div>
            )}
            <h1 className="text-2xl sm:text-4xl font-bold text-ink mb-3">{blogTitle}</h1>
            <p className="text-muted text-sm sm:text-base max-w-xl leading-relaxed">{blogSubtitle}</p>
            {/* 标签 */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <span className="flex items-center gap-1 px-3 py-1.5 bg-white border border-rule rounded-full text-xs text-muted">
                  <Sparkles size={12} className="text-accent" />
                  终生学习者
                </span>
                <span className="flex items-center gap-1 px-3 py-1.5 bg-white border border-rule rounded-full text-xs text-muted">
                  <BookOpen size={12} className="text-accent" />
                  知识分享者
                </span>
                <span className="flex items-center gap-1 px-3 py-1.5 bg-white border border-rule rounded-full text-xs text-muted">
                  <TrendingUp size={12} className="text-accent" />
                  自媒体创作者
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <span className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-full text-xs">
                  零基础学英语
                </span>
                <span className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full text-xs">
                  💡 真实成长记录
                </span>
                <span className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-full text-xs">
                  ✨ 37岁重新开始
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* 统计数据 */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white border border-rule rounded-xl p-4 text-center">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mx-auto mb-2`}>
                  <Icon size={20} className={stat.color} />
                </div>
                <div className="text-xl sm:text-2xl font-bold text-ink">{stat.value}</div>
                <div className="text-xs text-muted mt-1">{stat.label}</div>
              </div>
            );
          })}
        </section>

        {/* 关于我 */}
        <section className="bg-white border border-rule rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-ink mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-accent rounded-full" />
            关于我
          </h2>
          <div className="space-y-4 text-ink leading-relaxed text-sm sm:text-base">
            {bioParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </section>

        {/* 内容分类 */}
        {mainCategories.length > 0 && (
          <section className="bg-white border border-rule rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-ink mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-accent rounded-full" />
              内容分类
            </h2>
            <p className="text-muted text-sm mb-5">探索不同主题的文章和视频内容</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mainCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/blog?cat=${cat.id}`}
                  className="flex items-center gap-3 p-4 bg-bg rounded-xl hover:bg-accent-soft/50 transition-colors group"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: (cat.color || "#00D48F") + "20" }}
                  >
                    {cat.icon || "📁"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-ink group-hover:text-accent-deep transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-muted mt-0.5 line-clamp-1">
                      {cat.description || `${cat._count.documents} 篇文章`}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-bold text-ink">{cat._count.documents}</div>
                    <div className="text-xs text-muted">篇</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 快捷导航 */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/blog"
            className="bg-white border border-rule rounded-xl p-5 hover:border-accent/30 hover:shadow-md transition-all group"
          >
            <FileText size={24} className="text-accent mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-sm font-medium text-ink mb-1">浏览全部文章</h3>
            <p className="text-xs text-muted">查看所有公开文章</p>
          </Link>
          <Link
            href="/timeline"
            className="bg-white border border-rule rounded-xl p-5 hover:border-accent/30 hover:shadow-md transition-all group"
          >
            <Clock size={24} className="text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-sm font-medium text-ink mb-1">成长时间线</h3>
            <p className="text-xs text-muted">按时间浏览文章</p>
          </Link>
          <Link
            href="/feed.xml"
            className="bg-white border border-rule rounded-xl p-5 hover:border-accent/30 hover:shadow-md transition-all group"
          >
            <Rss size={24} className="text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="text-sm font-medium text-ink mb-1">RSS 订阅</h3>
            <p className="text-xs text-muted">用阅读器订阅</p>
          </Link>
        </section>

        {/* 联系方式 */}
        <section className="bg-white border border-rule rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-ink mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-accent rounded-full" />
            联系我
          </h2>
          <p className="text-muted text-sm mb-5">
            如果你喜欢这里的内容，欢迎常来看看。也可以通过以下方式找到我：
          </p>
          {availableSocials.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-3">
                {availableSocials.map((item) => {
                  const link = socialLinks[item.key];
                  const href = item.key === "email" ? `mailto:${link}` : link;
                  const isLink = item.key !== "wechat" && item.key !== "email";
                  return isLink ? (
                    <a
                      key={item.key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-accent-soft text-accent-deep rounded-lg text-sm font-medium hover:bg-accent hover:text-white transition-colors"
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </a>
                  ) : (
                    <div
                      key={item.key}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-accent-soft text-accent-deep rounded-lg text-sm font-medium"
                      title={link}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
              {socialLinks.wechat && (
                <p className="mt-4 text-sm text-muted">
                  微信号：<code className="bg-accent-soft px-2 py-0.5 rounded text-accent-deep">{socialLinks.wechat}</code>
                </p>
              )}
              {socialLinks.email && (
                <p className="mt-2 text-sm text-muted">
                  邮箱：<a href={`mailto:${socialLinks.email}`} className="text-accent-deep hover:underline">{socialLinks.email}</a>
                </p>
              )}
            </>
          ) : (
            <div className="flex gap-4">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent-soft text-accent-deep rounded-lg text-sm font-medium hover:bg-accent hover:text-white transition-colors"
              >
                浏览文章 <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </section>

        {/* 会员引导 */}
        {publicCount > 0 && (
          <section className="bg-gradient-to-br from-accent-soft/50 to-purple-50 border border-accent/20 rounded-2xl p-6 sm:p-8 text-center">
            <Award size={32} className="mx-auto text-accent-deep mb-3" />
            <h2 className="text-xl font-semibold text-ink mb-2">加入会员</h2>
            <p className="text-muted text-sm mb-4 max-w-md mx-auto">
              解锁更多深度教程、私密分享和学习日记，与晓桃一起终生成长
            </p>
            <Link
              href="/membership"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-2 text-white text-sm font-medium rounded-lg transition-colors"
            >
              了解会员权益 <ArrowRight size={14} />
            </Link>
          </section>
        )}
      </main>

      {/* 页脚 */}
      <footer className="border-t border-rule bg-white mt-8 pb-16 md:pb-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-muted">
          <p>© {new Date().getFullYear()} {blogTitle} · 用知识点亮成长之路</p>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs">
            <Link href="/blog" className="hover:text-accent-deep transition-colors">博客</Link>
            <Link href="/videos" className="hover:text-accent-deep transition-colors">视频</Link>
            <Link href="/timeline" className="hover:text-accent-deep transition-colors">时间线</Link>
            <Link href="/membership" className="hover:text-accent-deep transition-colors">会员</Link>
            <Link href="/feed.xml" className="hover:text-accent-deep transition-colors">RSS</Link>
          </div>
        </div>
      </footer>

      {/* 移动端底部导航 */}
      <MobileBottomNav />
    </div>
  );
}
