import prisma from "@/lib/prisma";
import Link from "next/link";
import { Search, Calendar, Clock, BookOpen } from "lucide-react";

// 前台博客首页 - 公开文章列表
export default async function BlogHome({
  searchParams,
}: {
  searchParams: { s?: string; cat?: string };
}) {
  const search = searchParams?.s || "";
  const category = searchParams?.cat || "";

  // 查询公开文档
  const where: any = {
    isPublic: true,
    isDeleted: false,
  };

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { plainText: { contains: search } },
    ];
  }

  const posts = await prisma.document.findMany({
    where,
    orderBy: { lastModifiedAt: "desc" },
    take: 20,
    select: {
      id: true,
      title: true,
      plainText: true,
      wordCount: true,
      lastModifiedAt: true,
      knowledgeBase: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // 获取所有公开的分类
  const publicKbs = await prisma.knowledgeBase.findMany({
    where: {
      documents: {
        some: {
          isPublic: true,
          isDeleted: false,
        },
      },
    },
    select: {
      id: true,
      name: true,
      icon: true,
      _count: {
        select: {
          documents: {
            where: { isPublic: true, isDeleted: false },
          },
        },
      },
    },
    orderBy: { sortOrder: "asc" },
  });

  const totalPosts = await prisma.document.count({
    where: { isPublic: true, isDeleted: false },
  });

  return (
    <div className="min-h-screen bg-bg">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-rule">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold">
              桃
            </div>
            <span className="font-semibold text-ink">晓桃终生成长</span>
          </Link>

          <nav className="flex items-center gap-4 text-sm text-muted">
            <Link href="/blog" className="hover:text-accent-deep transition-colors">
              首页
            </Link>
            <Link href="/blog?cat=" className="hover:text-accent-deep transition-colors">
              分类
            </Link>
            <Link href="/about" className="hover:text-accent-deep transition-colors">
              关于
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero 区域 */}
      <section className="bg-gradient-to-b from-accent-soft/50 to-transparent py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-ink mb-4">
            晓桃的知识花园
          </h1>
          <p className="text-muted text-base max-w-xl mx-auto mb-8">
            记录学习、思考与成长的点滴。关于英语学习、个人成长、以及那些让生活更美好的小发现。
          </p>

          {/* 搜索框 */}
          <form
            action="/blog"
            method="GET"
            className="max-w-md mx-auto relative"
          >
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              name="s"
              defaultValue={search}
              placeholder="搜索文章..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-rule rounded-full text-sm outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all shadow-sm"
            />
          </form>

          {/* 统计 */}
          <div className="flex items-center justify-center gap-8 mt-8 text-sm text-muted">
            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-accent" />
              <span>
                <strong className="text-ink">{totalPosts}</strong> 篇文章
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-accent" />
              <span>持续更新中</span>
            </div>
          </div>
        </div>
      </section>

      {/* 主体内容 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 文章列表 */}
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-accent rounded-full" />
              {search ? `搜索「${search}」` : "最新文章"}
            </h2>

            {posts.length === 0 ? (
              <div className="text-center py-16 text-muted">
                <div className="text-5xl mb-4">📝</div>
                <p>还没有公开的文章</p>
                <p className="text-sm mt-1">敬请期待～</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/post/${post.id}`}
                    className="block p-5 bg-white border border-rule rounded-xl hover:border-accent/30 hover:shadow-md transition-all group"
                  >
                    <h3 className="text-lg font-semibold text-ink group-hover:text-accent-deep transition-colors mb-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted line-clamp-2 leading-relaxed mb-3">
                      {post.plainText.slice(0, 150) || "暂无内容..."}
                      {post.plainText.length > 150 ? "..." : ""}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(post.lastModifiedAt).toLocaleDateString(
                          "zh-CN",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </span>
                      <span>{post.wordCount} 字</span>
                      {post.knowledgeBase && (
                        <span className="px-2 py-0.5 bg-accent-soft text-accent-deep rounded">
                          {post.knowledgeBase.name}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 侧边栏 - 分类 */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white border border-rule rounded-xl p-5 sticky top-20">
              <h3 className="font-semibold text-ink mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-accent rounded-full" />
                分类
              </h3>
              <div className="space-y-1">
                <Link
                  href="/blog"
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    !category
                      ? "bg-accent-soft text-accent-deep font-medium"
                      : "text-ink hover:bg-[#f9fafb]"
                  }`}
                >
                  <span>全部文章</span>
                  <span className="text-xs">{totalPosts}</span>
                </Link>
                {publicKbs.map((kb) => (
                  <Link
                    key={kb.id}
                    href={`/blog?cat=${kb.id}`}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      category === kb.id
                        ? "bg-accent-soft text-accent-deep font-medium"
                        : "text-ink hover:bg-[#f9fafb]"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{kb.icon || "📁"}</span>
                      <span>{kb.name}</span>
                    </span>
                    <span className="text-xs">
                      {kb._count.documents}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* 关于小卡片 */}
            <div className="bg-gradient-to-br from-accent-soft to-white border border-accent/20 rounded-xl p-5 mt-4">
              <h3 className="font-semibold text-ink mb-2">关于我</h3>
              <p className="text-sm text-muted leading-relaxed">
                一个在终生学习路上的普通人。这里记录我的学习笔记、思考和成长。
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="border-t border-rule bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-muted">
          <p>© {new Date().getFullYear()} 晓桃终生成长 · 用知识点亮成长之路</p>
          <p className="mt-2 text-xs">
            Powered by 晓桃知识库系统
          </p>
        </div>
      </footer>
    </div>
  );
}
