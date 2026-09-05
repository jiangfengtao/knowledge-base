import prisma from "@/lib/prisma";
import Link from "next/link";
import { Calendar, BookOpen, Clock } from "lucide-react";
import type { Metadata } from "next";
import ThemeToggle from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "成长时间线 - 晓桃终生成长",
  description: "记录晓桃从零基础开始的成长历程，一步一个脚印。",
  alternates: { canonical: "https://xiaotaotop.com/timeline" },
};

export default async function TimelinePage() {
  // 获取所有公开的文档，按时间分组
  const posts = await prisma.document.findMany({
    where: {
      visibility: "public",
      isDeleted: false,
    },
    orderBy: { lastModifiedAt: "desc" },
    select: {
      id: true,
      title: true,
      lastModifiedAt: true,
      wordCount: true,
      knowledgeBase: { select: { name: true } },
    },
  });

  // 按年份和月份分组
  const grouped: Record<string, Record<string, typeof posts>> = {};
  for (const post of posts) {
    const date = new Date(post.lastModifiedAt);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    if (!grouped[year]) grouped[year] = {};
    if (!grouped[year][month]) grouped[year][month] = [];
    grouped[year][month].push(post);
  }

  const years = Object.keys(grouped).sort((a, b) => parseInt(b) - parseInt(a));

  const monthNames = [
    "一月", "二月", "三月", "四月", "五月", "六月",
    "七月", "八月", "九月", "十月", "十一月", "十二月",
  ];

  return (
    <div className="min-h-screen bg-bg">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-rule">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold">
              桃
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* 标题 */}
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold text-ink mb-3">成长时间线</h1>
          <p className="text-muted">
            一步一个脚印，记录成长的每一刻
          </p>
        </div>

        {/* 时间线 */}
        <div className="relative">
          {/* 时间轴线 */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-rule" />

          {years.map((year) => (
            <div key={year} className="mb-12">
              {/* 年份标记 */}
              <div className="relative flex items-center mb-6">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold z-10 flex-shrink-0">
                  {year.slice(2)}
                </div>
                <h2 className="ml-4 text-xl font-bold text-ink">{year}年</h2>
              </div>

              {/* 各月 */}
              {Object.keys(grouped[year])
                .sort((a, b) => parseInt(b) - parseInt(a))
                .map((month) => (
                  <div key={`${year}-${month}`} className="mb-8 ml-4">
                    <div className="relative">
                      <div className="absolute -left-4 top-2 w-3 h-3 rounded-full bg-white border-2 border-accent" />
                      <h3 className="text-sm font-medium text-muted mb-3 ml-4">
                        {monthNames[parseInt(month) - 1]}
                      </h3>

                      <div className="space-y-2 ml-4">
                        {grouped[year][month].map((post) => (
                          <Link
                            key={post.id}
                            href={`/blog/post/${post.id}`}
                            className="block p-4 bg-white border border-rule rounded-xl hover:border-accent/30 transition-all group"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-ink font-medium group-hover:text-accent-deep transition-colors line-clamp-1">
                                  {post.title}
                                </h4>
                                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted">
                                  <span className="flex items-center gap-1">
                                    <Calendar size={12} />
                                    {new Date(
                                      post.lastModifiedAt
                                    ).toLocaleDateString("zh-CN", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <BookOpen size={12} />
                                    {post.wordCount} 字
                                  </span>
                                  {post.knowledgeBase && (
                                    <span className="px-1.5 py-0.5 bg-accent-soft text-accent-deep text-[10px] rounded">
                                      {post.knowledgeBase.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ))}

          {years.length === 0 && (
            <div className="text-center py-20 text-muted">
              <Clock size={48} className="mx-auto mb-4 opacity-30" />
              <p>时间线还是空的</p>
              <p className="text-sm mt-1">成长从第一步开始</p>
            </div>
          )}
        </div>
      </main>

      {/* 页脚 */}
      <footer className="border-t border-rule bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-muted">
          <p>© {new Date().getFullYear()} 晓桃终生成长 · 用知识点亮成长之路</p>
        </div>
      </footer>
    </div>
  );
}
