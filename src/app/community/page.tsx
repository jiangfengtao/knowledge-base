import prisma from "@/lib/prisma";
import { getDefaultUser } from "@/lib/user";
import Link from "next/link";
import { MessageCircle, Heart, Eye, Pin, Award, Plus, Search } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import MobileBottomNav from "@/components/MobileBottomNav";
import NotificationBell from "@/components/NotificationBell";
import { formatDistanceToNow } from "@/lib/format-date";

export const revalidate = 60; // 每分钟刷新

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: { type?: string; category?: string };
}) {
  const user = await getDefaultUser();
  const settings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  const blogTitle = settings?.blogTitle || "晓桃自学英语";
  const avatarUrl = settings?.avatarUrl || "";

  const type = searchParams?.type || "";
  const category = searchParams?.category || "";

  const where: any = { status: "active" };
  if (type) where.type = type;
  if (category) where.category = category;

  const posts = await prisma.communityPost.findMany({
    where,
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    take: 30,
    include: {
      _count: {
        select: { replies: { where: { status: "active" } } },
      },
    },
  });

  const categories = [
    { id: "", label: "全部", icon: "📋" },
    { id: "discussion", label: "讨论", icon: "💬" },
    { id: "question", label: "问答", icon: "❓" },
    { id: "share", label: "分享", icon: "🔗" },
    { id: "english", label: "英语学习", icon: "📚" },
    { id: "growth", label: "个人成长", icon: "🌱" },
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
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm">晓桃</div>
            )}
            <span className="font-semibold text-ink">{blogTitle}</span>
          </Link>
          <div className="flex items-center gap-3 text-sm text-muted">
            <Link href="/blog" className="hover:text-accent-deep transition-colors hidden sm:inline">博客</Link>
            <Link href="/community" className="text-accent-deep font-medium">社区</Link>
            <Link href="/about" className="hover:text-accent-deep transition-colors hidden sm:inline">关于</Link>
            <NotificationBell />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {/* 社区标题 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink mb-1">社区</h1>
          <p className="text-sm text-muted">和晓桃一起学习、交流、成长</p>
        </div>

        {/* 分类标签 */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.id ? `/community?category=${cat.id}` : "/community"}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                (category || "") === cat.id
                  ? "bg-accent text-white"
                  : "bg-white border border-rule text-muted hover:border-accent/30"
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </Link>
          ))}
        </div>

        {/* 发帖按钮 */}
        <Link
          href="/community/new"
          className="flex items-center gap-2 w-full mb-6 px-4 py-3 bg-white border border-rule rounded-xl hover:border-accent/30 transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center">
            <Plus size={16} className="text-accent-deep" />
          </div>
          <span className="text-muted text-sm group-hover:text-accent-deep transition-colors">发一条帖子，分享你的想法...</span>
        </Link>

        {/* 帖子列表 */}
        <div className="space-y-3">
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">🌱</div>
              <p className="text-muted text-sm">社区还没有帖子，来发第一条吧！</p>
            </div>
          ) : (
            posts.map((post) => (
              <Link
                key={post.id}
                href={`/community/post/${post.id}`}
                className="block bg-white border border-rule rounded-xl p-5 hover:border-accent/30 hover:shadow-sm transition-all"
              >
                {post.isPinned && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 text-xs rounded-full mb-2">
                    <Pin size={10} /> 置顶
                  </span>
                )}
                {post.isEssence && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-full mb-2 ml-1">
                    <Award size={10} /> 精华
                  </span>
                )}
                <h2 className="text-base font-semibold text-ink mb-2 line-clamp-2">{post.title}</h2>
                {post.plainText && (
                  <p className="text-sm text-muted line-clamp-2 mb-3">{post.plainText}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted">
                  <span className="font-medium text-ink">{post.authorName}</span>
                  <span>{formatDistanceToNow(post.createdAt)}</span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={12} /> {post._count.replies}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart size={12} /> {post.likeCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={12} /> {post.viewCount}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
