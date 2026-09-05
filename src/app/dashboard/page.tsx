import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Type,
  Eye,
  Tags,
  Crown,
  Globe,
  Lock,
  TrendingUp,
  Calendar,
  ArrowLeft,
  Clock,
  BarChart3,
  User,
  Video,
  Mail,
  Users,
  PenLine,
  Settings,
  Ticket,
  Flame,
  Film,
  ChevronRight,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "数据看板",
  description: "个人写作数据统计与分析",
};

// 数字格式化
function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + "万";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "k";
  }
  return num.toString();
}

// 数据看板页面
export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const userId = user.id;
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // 并行查询所有统计数据
  const [
    totalDocsResult,
    totalWordCount,
    totalViewCount,
    totalTagsCount,
    memberDocsCount,
    publicDocsCount,
    privateDocsCount,
    last7DaysCount,
    recentPosts,
    topViewedPosts,
    videoCount,
    subscriberCount,
    confirmedSubscriberCount,
    categoryStats,
    inviteCodeCount,
    usedInviteCodeCount,
  ] = await Promise.all([
    prisma.document.count({ where: { userId, isDeleted: false } }),
    prisma.document.aggregate({ where: { userId, isDeleted: false }, _sum: { wordCount: true } }),
    prisma.document.aggregate({ where: { userId, isDeleted: false }, _sum: { viewCount: true } }),
    prisma.tag.count({ where: { userId } }),
    prisma.document.count({ where: { userId, isDeleted: false, visibility: "members" } }),
    prisma.document.count({ where: { userId, isDeleted: false, visibility: "public" } }),
    prisma.document.count({ where: { userId, isDeleted: false, visibility: "private" } }),
    prisma.document.count({ where: { userId, isDeleted: false, lastModifiedAt: { gte: sevenDaysAgo } } }),
    prisma.document.findMany({
      where: { userId, isDeleted: false },
      orderBy: { lastModifiedAt: "desc" },
      take: 5,
      select: { id: true, title: true, wordCount: true, viewCount: true, visibility: true, lastModifiedAt: true },
    }),
    // 热门文章 TOP10
    prisma.document.findMany({
      where: { userId, isDeleted: false, visibility: "public" },
      orderBy: { viewCount: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        viewCount: true,
        wordCount: true,
        isVideo: true,
        lastModifiedAt: true,
        knowledgeBase: { select: { id: true, name: true, icon: true } },
      },
    }),
    // 视频文章数
    prisma.document.count({ where: { userId, isDeleted: false, isVideo: true } }),
    // 订阅者总数
    prisma.subscriber.count(),
    // 已确认订阅者数
    prisma.subscriber.count({ where: { confirmed: true } }),
    // 分类分布
    prisma.knowledgeBase.findMany({
      where: {
        userId,
        documents: { some: { isDeleted: false } },
        categoryCode: { startsWith: "blog-" },
      },
      select: {
        id: true,
        name: true,
        icon: true,
        color: true,
        _count: { select: { documents: { where: { isDeleted: false } } } },
      },
      orderBy: { sortOrder: "asc" },
    }),
    // 邀请码总数
    prisma.inviteCode.count(),
    // 已使用邀请码数
    prisma.inviteCode.count({ where: { isUsed: true } }),
  ]);

  // 最近7天每天的发布数量
  const last7DaysData: { date: string; label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayStart = new Date(day);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(day);
    dayEnd.setHours(23, 59, 59, 999);

    const count = await prisma.document.count({
      where: { userId, isDeleted: false, lastModifiedAt: { gte: dayStart, lte: dayEnd } },
    });

    last7DaysData.push({
      date: day.toISOString().split("T")[0],
      label: `${day.getMonth() + 1}/${day.getDate()}`,
      count,
    });
  }

  const maxDailyCount = Math.max(...last7DaysData.map((d) => d.count), 1);
  const totalWords = totalWordCount._sum.wordCount || 0;
  const totalViews = totalViewCount._sum.viewCount || 0;

  // 分类分布计算百分比
  const totalCategoryDocs = categoryStats.reduce((acc, c) => acc + c._count.documents, 0);

  const statCards = [
    { label: "总文章数", value: totalDocsResult, icon: FileText, color: "text-accent", bg: "bg-accent-soft" },
    { label: "总字数", value: formatNumber(totalWords), icon: Type, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "总阅读量", value: formatNumber(totalViews), icon: Eye, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "视频内容", value: videoCount, icon: Film, color: "text-rose-500", bg: "bg-rose-50" },
    { label: "公开文章", value: publicDocsCount, icon: Globe, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "会员文章", value: memberDocsCount, icon: Crown, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "订阅粉丝", value: subscriberCount, icon: Users, color: "text-cyan-500", bg: "bg-cyan-50" },
    { label: "邀请码", value: `${usedInviteCodeCount}/${inviteCodeCount}`, icon: Ticket, color: "text-indigo-500", bg: "bg-indigo-50" },
  ];

  const visibilityBadge: Record<string, { label: string; className: string }> = {
    public: { label: "公开", className: "bg-emerald-50 text-emerald-600" },
    members: { label: "会员", className: "bg-amber-50 text-amber-600" },
    private: { label: "私密", className: "bg-gray-100 text-gray-500" },
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-rule">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold">
              桃
            </div>
            <span className="font-semibold text-ink">晓桃终生成长</span>
          </Link>
          <nav className="flex items-center gap-3 text-sm text-muted">
            <Link href="/blog" className="hover:text-accent-deep transition-colors">博客</Link>
            <Link href="/videos" className="hover:text-accent-deep transition-colors hidden sm:inline">视频</Link>
            <Link href="/" className="hover:text-accent-deep transition-colors">工作台</Link>
            <Link href="/settings" className="hover:text-accent-deep transition-colors hidden sm:inline">设置</Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* 页面头部 */}
      <section className="bg-gradient-to-b from-accent-soft/50 to-transparent py-8 sm:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/30">
              <BarChart3 size={28} />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-ink">数据看板</h1>
              <p className="text-sm text-muted mt-1">你的写作数据统计与成长记录</p>
            </div>
            {/* 快捷操作 */}
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/admin/members" className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-rule rounded-lg hover:border-accent/30 hover:text-accent-deep transition-colors">
                <Users size={15} /> 会员管理
              </Link>
              <Link href="/admin/subscribers" className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-rule rounded-lg hover:border-accent/30 hover:text-accent-deep transition-colors">
                <Mail size={15} /> 订阅者
              </Link>
              <Link href="/settings" className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-rule rounded-lg hover:border-accent/30 hover:text-accent-deep transition-colors">
                <Settings size={15} /> 设置
              </Link>
            </div>
          </div>

          {/* 用户信息 */}
          <div className="mt-6 flex items-center gap-3 text-sm text-muted flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-rule rounded-full">
              <User size={14} className="text-accent" />
              <span>{user.name}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-rule rounded-full">
              <Calendar size={14} className="text-accent" />
              <span>{now.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}</span>
            </div>
            {confirmedSubscriberCount > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-50 border border-cyan-200 rounded-full text-cyan-600">
                <Mail size={14} />
                <span>{confirmedSubscriberCount} 位活跃订阅者</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* 统计卡片网格 */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-accent rounded-full" />
            数据概览
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="bg-white border border-rule rounded-xl p-4 sm:p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                      <Icon size={20} className={card.color} />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-ink">{card.value}</div>
                  <div className="text-xs sm:text-sm text-muted mt-1">{card.label}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 最近7天发布趋势 + 分类分布 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* 发布趋势 */}
          <section>
            <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-accent rounded-full" />
              最近 7 天发布趋势
            </h2>
            <div className="bg-white border border-rule rounded-xl p-5 sm:p-6">
              <div className="flex items-end justify-between gap-2 sm:gap-4 h-48 sm:h-56 pt-4">
                {last7DaysData.map((day, index) => {
                  const heightPercent = (day.count / maxDailyCount) * 100;
                  const isToday = index === last7DaysData.length - 1;
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center justify-end gap-2">
                      <div className="w-full flex flex-col items-center justify-end flex-1">
                        <span className={`text-xs font-medium mb-1 ${day.count > 0 ? "text-ink" : "text-transparent"}`}>
                          {day.count}
                        </span>
                        <div
                          className={`w-full max-w-[32px] sm:max-w-[40px] rounded-t-lg transition-all duration-300 ${
                            isToday ? "bg-gradient-to-t from-accent to-accent-2" : "bg-gradient-to-t from-accent/60 to-accent-soft"
                          } ${day.count === 0 ? "opacity-30 min-h-[4px]" : ""}`}
                          style={{ height: `${Math.max(heightPercent, 2)}%` }}
                        />
                      </div>
                      <span className={`text-xs ${isToday ? "text-accent-deep font-medium" : "text-muted"}`}>
                        {day.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 pt-4 border-t border-rule flex items-center justify-between text-xs text-muted">
                <span>共发布 {last7DaysCount} 篇</span>
                <span>日均 {last7DaysCount > 0 ? (last7DaysCount / 7).toFixed(1) : 0} 篇</span>
              </div>
            </div>
          </section>

          {/* 分类分布 */}
          <section>
            <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-accent rounded-full" />
              分类分布
            </h2>
            <div className="bg-white border border-rule rounded-xl p-5 sm:p-6">
              {categoryStats.length === 0 ? (
                <div className="text-center py-8 text-muted text-sm">暂无分类数据</div>
              ) : (
                <div className="space-y-3">
                  {categoryStats.map((cat) => {
                    const percent = totalCategoryDocs > 0 ? (cat._count.documents / totalCategoryDocs) * 100 : 0;
                    return (
                      <div key={cat.id}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="flex items-center gap-2 text-ink">
                            <span>{cat.icon || "📁"}</span>
                            {cat.name}
                          </span>
                          <span className="text-muted text-xs">{cat._count.documents} 篇 · {percent.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%`, backgroundColor: cat.color || "#00D48F" }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-rule text-xs text-muted flex justify-between">
                <span>共 {categoryStats.length} 个分类</span>
                <span>{totalCategoryDocs} 篇文章</span>
              </div>
            </div>
          </section>
        </div>

        {/* 热门文章 TOP10 */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-accent rounded-full" />
            热门文章 TOP 10
          </h2>
          <div className="bg-white border border-rule rounded-xl overflow-hidden">
            {topViewedPosts.length === 0 ? (
              <div className="text-center py-12 text-muted">
                <div className="text-4xl mb-3">📊</div>
                <p>暂无公开文章数据</p>
                <p className="text-sm mt-1">发布公开文章后，这里会显示热门排行</p>
              </div>
            ) : (
              <div className="divide-y divide-rule">
                {topViewedPosts.map((post, index) => (
                  <Link
                    key={post.id}
                    href={`/blog/post/${post.id}`}
                    className="flex items-center gap-3 px-5 py-4 hover:bg-bg transition-colors group"
                  >
                    {/* 排名 */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      index === 0 ? "bg-red-50 text-red-500" :
                      index === 1 ? "bg-orange-50 text-orange-500" :
                      index === 2 ? "bg-amber-50 text-amber-500" :
                      "bg-gray-50 text-gray-400"
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {post.isVideo && (
                          <span className="flex-shrink-0 flex items-center gap-0.5 px-1.5 py-0.5 bg-rose-50 text-rose-500 text-xs rounded">
                            <Video size={10} /> 视频
                          </span>
                        )}
                        <h3 className="text-sm font-medium text-ink group-hover:text-accent-deep transition-colors truncate">
                          {post.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted">
                        {post.knowledgeBase && (
                          <span className="flex items-center gap-1">
                            <span>{post.knowledgeBase.icon || "📁"}</span>
                            {post.knowledgeBase.name}
                          </span>
                        )}
                        <span>{post.wordCount} 字</span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(post.lastModifiedAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                    {/* 阅读量 */}
                    <div className="flex-shrink-0 text-right">
                      <div className="flex items-center gap-1 text-accent-deep">
                        <Eye size={14} />
                        <span className="font-bold">{post.viewCount}</span>
                      </div>
                      <div className="text-xs text-muted">次阅读</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 最近发布的文章 */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-accent rounded-full" />
            最近发布
          </h2>
          <div className="bg-white border border-rule rounded-xl overflow-hidden">
            {recentPosts.length === 0 ? (
              <div className="text-center py-12 text-muted">
                <div className="text-4xl mb-3">📝</div>
                <p>还没有文章</p>
                <p className="text-sm mt-1">开始你的第一篇创作吧～</p>
              </div>
            ) : (
              <div className="divide-y divide-rule">
                {recentPosts.map((post) => {
                  const badge = visibilityBadge[post.visibility] || visibilityBadge.private;
                  return (
                    <Link
                      key={post.id}
                      href={`/blog/post/${post.id}`}
                      className="flex items-center justify-between px-5 py-4 hover:bg-bg transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-medium text-ink group-hover:text-accent-deep transition-colors truncate">
                            {post.title}
                          </h3>
                          <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded ${badge.className}`}>
                            {badge.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(post.lastModifiedAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
                          </span>
                          <span>{post.wordCount} 字</span>
                          <span className="flex items-center gap-1">
                            <Eye size={12} />
                            {post.viewCount}
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-muted group-hover:text-accent-deep transition-colors flex-shrink-0 ml-4" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* 快捷操作 */}
        <section>
          <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-accent rounded-full" />
            快捷操作
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Link href="/" className="bg-white border border-rule rounded-xl p-5 hover:border-accent/30 hover:shadow-md transition-all group text-center">
              <PenLine size={24} className="mx-auto text-accent mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-medium text-ink">写文章</div>
            </Link>
            <Link href="/blog" className="bg-white border border-rule rounded-xl p-5 hover:border-accent/30 hover:shadow-md transition-all group text-center">
              <Globe size={24} className="mx-auto text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-medium text-ink">查看博客</div>
            </Link>
            <Link href="/admin/members" className="bg-white border border-rule rounded-xl p-5 hover:border-accent/30 hover:shadow-md transition-all group text-center">
              <Ticket size={24} className="mx-auto text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-medium text-ink">邀请码</div>
            </Link>
            <Link href="/settings" className="bg-white border border-rule rounded-xl p-5 hover:border-accent/30 hover:shadow-md transition-all group text-center">
              <Settings size={24} className="mx-auto text-gray-500 mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-medium text-ink">站点设置</div>
            </Link>
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="border-t border-rule bg-white mt-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-muted">
          <p>© {new Date().getFullYear()} 晓桃终生成长 · 用知识点亮成长之路</p>
          <p className="mt-2 text-xs">Powered by 晓桃知识库系统</p>
        </div>
      </footer>
    </div>
  );
}
