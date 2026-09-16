import prisma from "@/lib/prisma";
import Link from "next/link";
import { Tag, Hash, ArrowLeft, History, Crown } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import MobileBottomNav from "@/components/MobileBottomNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "标签云",
  description: "浏览所有文章标签，发现感兴趣的内容",
};

// 标签颜色方案（基于索引循环使用）
const TAG_COLORS = [
  { bg: "bg-accent-soft", text: "text-accent-deep", hover: "hover:bg-accent hover:text-white" },
  { bg: "bg-blue-50", text: "text-blue-600", hover: "hover:bg-blue-500 hover:text-white" },
  { bg: "bg-purple-50", text: "text-purple-600", hover: "hover:bg-purple-500 hover:text-white" },
  { bg: "bg-amber-50", text: "text-amber-600", hover: "hover:bg-amber-500 hover:text-white" },
  { bg: "bg-rose-50", text: "text-rose-600", hover: "hover:bg-rose-500 hover:text-white" },
  { bg: "bg-cyan-50", text: "text-cyan-600", hover: "hover:bg-cyan-500 hover:text-white" },
  { bg: "bg-emerald-50", text: "text-emerald-600", hover: "hover:bg-emerald-500 hover:text-white" },
  { bg: "bg-indigo-50", text: "text-indigo-600", hover: "hover:bg-indigo-500 hover:text-white" },
];

// 根据文章数量计算标签大小
function getTagSize(count: number, maxCount: number): string {
  const ratio = count / maxCount;
  if (ratio >= 0.8) return "text-2xl font-bold py-2 px-4";
  if (ratio >= 0.6) return "text-xl font-semibold py-2 px-3.5";
  if (ratio >= 0.4) return "text-lg font-medium py-1.5 px-3";
  if (ratio >= 0.2) return "text-base font-medium py-1.5 px-2.5";
  return "text-sm py-1 px-2";
}

// 标签云页面
export default async function BlogTagsPage() {
  // 查询所有标签及其关联的文档（用于统计公开文章数量）
  const allTags = await prisma.tag.findMany({
    include: {
      documents: {
        include: {
          document: {
            select: { visibility: true, isDeleted: true },
          },
        },
      },
    },
  });

  // 在内存中过滤并计算每个标签的公开文章数量
  const tagsWithCount = allTags
    .map((tag) => {
      const publicDocCount = tag.documents.filter(
        (dt) => dt.document.visibility === "public" && !dt.document.isDeleted
      ).length;
      return {
        id: tag.id,
        name: tag.name,
        color: tag.color,
        count: publicDocCount,
      };
    })
    .filter((t) => t.count > 0) // 只保留有公开文章的标签
    .sort((a, b) => b.count - a.count); // 按数量降序排列

  const totalTags = tagsWithCount.length;
  const maxCount = tagsWithCount.length > 0 ? tagsWithCount[0].count : 1;
  const totalArticles = tagsWithCount.reduce((sum, t) => sum + t.count, 0);

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

          <nav className="flex items-center gap-3 text-sm text-muted">
            <Link href="/blog" className="hover:text-accent-deep transition-colors">
              首页
            </Link>
            <Link
              href="/timeline"
              className="hover:text-accent-deep transition-colors flex items-center gap-1"
              title="时间线"
            >
              <History size={16} className="sm:hidden" />
              <span className="hidden sm:inline">时间线</span>
            </Link>
            <Link
              href="/blog/tags"
              className="text-accent-deep transition-colors flex items-center gap-1 font-medium"
              title="标签"
            >
              <Tag size={16} className="sm:hidden" />
              <span className="hidden sm:inline">标签</span>
            </Link>
            <Link
              href="/membership"
              className="hover:text-accent-deep transition-colors flex items-center gap-1"
              title="会员"
            >
              <Crown size={16} className="sm:hidden" />
              <span className="hidden sm:inline">会员</span>
            </Link>
            <Link href="/about" className="hover:text-accent-deep transition-colors hidden sm:inline">
              关于
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Hero 区域 */}
      <section className="bg-gradient-to-b from-accent-soft/50 to-transparent py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent text-white mb-4 shadow-lg shadow-accent/30">
            <Tag size={28} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-ink mb-4">
            标签云
          </h1>
          <p className="text-muted text-base max-w-xl mx-auto">
            通过标签快速发现感兴趣的内容，每个标签对应一类主题文章
          </p>

          {/* 统计 */}
          <div className="flex items-center justify-center gap-8 mt-8 text-sm text-muted">
            <div className="flex items-center gap-2">
              <Hash size={16} className="text-accent" />
              <span>
                <strong className="text-ink">{totalTags}</strong> 个标签
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowLeft size={16} className="text-accent" />
              <span>共 {totalArticles} 篇次关联</span>
            </div>
          </div>
        </div>
      </section>

      {/* 标签云主体 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white border border-rule rounded-2xl p-6 sm:p-10">
          <h2 className="text-lg font-semibold text-ink mb-6 flex items-center gap-2">
            <span className="w-1 h-5 bg-accent rounded-full" />
            全部标签
          </h2>

          {tagsWithCount.length === 0 ? (
            <div className="text-center py-16 text-muted">
              <div className="text-5xl mb-4">🏷️</div>
              <p>还没有标签</p>
              <p className="text-sm mt-1">敬请期待～</p>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {tagsWithCount.map((tag, index) => {
                const colorScheme = TAG_COLORS[index % TAG_COLORS.length];
                const sizeClass = getTagSize(tag.count, maxCount);
                return (
                  <Link
                    key={tag.id}
                    href={`/blog?tag=${encodeURIComponent(tag.name)}`}
                    className={`inline-flex items-center gap-1.5 rounded-full ${colorScheme.bg} ${colorScheme.text} ${colorScheme.hover} ${sizeClass} transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5`}
                    title={`${tag.count} 篇文章`}
                  >
                    <Hash size={12} className="opacity-70" />
                    <span>{tag.name}</span>
                    <span className="text-xs opacity-60 ml-0.5">
                      {tag.count}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* 热门标签说明 */}
        {tagsWithCount.length > 0 && (
          <div className="mt-6 text-center text-xs text-muted">
            <p>标签越大表示相关文章越多，点击标签可查看对应文章列表</p>
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="border-t border-rule bg-white pb-16 md:pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-muted">
          <p>© {new Date().getFullYear()} 晓桃终生成长 · 用知识点亮成长之路</p>
          <p className="mt-2 text-xs">
            Powered by 晓桃知识库系统
          </p>
        </div>
      </footer>

      {/* 移动端底部导航 */}
      <MobileBottomNav />
    </div>
  );
}
