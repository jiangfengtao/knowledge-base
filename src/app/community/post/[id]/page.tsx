import prisma from "@/lib/prisma";
import { getDefaultUser } from "@/lib/user";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Eye, Heart, MessageCircle, Pin, Award } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import MobileBottomNav from "@/components/MobileBottomNav";
import CommunityPostClient from "./CommunityPostClient";
import { formatDistanceToNow } from "@/lib/format-date";

export const dynamic = "force-dynamic";

export default async function CommunityPostPage({
  params,
}: {
  params: { id: string };
}) {
  const defaultUser = await getDefaultUser();
  const settings = await prisma.userSettings.findUnique({
    where: { userId: defaultUser.id },
  });

  const blogTitle = settings?.blogTitle || "晓桃终生成长";

  const post = await prisma.communityPost.findUnique({
    where: { id: params.id },
    include: {
      replies: {
        where: { status: "active", parentId: null },
        orderBy: { createdAt: "asc" },
        include: {
          replies: {
            where: { status: "active" },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!post || post.status !== "active") {
    notFound();
  }

  // 增加浏览量
  await prisma.communityPost.update({
    where: { id: params.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => {});

  return (
    <div className="min-h-screen bg-bg">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-rule">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/community" className="flex items-center gap-2 text-sm text-muted hover:text-accent-deep transition-colors">
            <ArrowLeft size={16} /> 返回社区
          </Link>
          <span className="font-semibold text-ink text-sm">{blogTitle}</span>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        {/* 帖子内容 */}
        <article className="bg-white border border-rule rounded-2xl p-6 mb-6">
          {post.isPinned && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 text-xs rounded-full mb-3">
              <Pin size={10} /> 置顶
            </span>
          )}
          {post.isEssence && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-600 text-xs rounded-full mb-3 ml-1">
              <Award size={10} /> 精华
            </span>
          )}
          <h1 className="text-xl sm:text-2xl font-bold text-ink mb-3">{post.title}</h1>
          <div className="flex items-center gap-3 text-xs text-muted mb-4 pb-4 border-b border-rule">
            <span className="font-medium text-ink">{post.authorName}</span>
            <span>{formatDistanceToNow(post.createdAt)}</span>
            {post.category && (
              <span className="px-2 py-0.5 bg-accent-soft text-accent-deep text-xs rounded-full">
                {post.category}
              </span>
            )}
          </div>
          <div
            className="prose prose-sm max-w-none text-ink leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          <div className="flex items-center gap-4 mt-6 pt-4 border-t border-rule text-xs text-muted">
            <span className="flex items-center gap-1">
              <Eye size={14} /> {post.viewCount} 浏览
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle size={14} /> {post.replyCount} 回复
            </span>
          </div>
        </article>

        {/* 客户端交互组件（点赞 + 回复） */}
        <CommunityPostClient postId={post.id} likeCount={post.likeCount} />

        {/* 回复列表 */}
        <div className="space-y-3 mt-6">
          <h3 className="text-sm font-semibold text-ink mb-3">
            {post.replyCount > 0 ? `${post.replyCount} 条回复` : "暂无回复，来说点什么吧"}
          </h3>

          {post.replies.map((reply) => (
            <div key={reply.id} className="bg-white border border-rule rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold">
                  {reply.authorName.slice(0, 1)}
                </div>
                <span className="text-sm font-medium text-ink">{reply.authorName}</span>
                <span className="text-xs text-muted">{formatDistanceToNow(reply.createdAt)}</span>
              </div>
              <p className="text-sm text-ink leading-relaxed mb-2 pl-9">{reply.content}</p>

              {/* 楼中楼回复 */}
              {reply.replies.length > 0 && (
                <div className="pl-9 mt-3 space-y-2 border-l-2 border-rule pl-4">
                  {reply.replies.map((subReply) => (
                    <div key={subReply.id} className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-ink text-xs">{subReply.authorName}</span>
                        <span className="text-xs text-muted">{formatDistanceToNow(subReply.createdAt)}</span>
                      </div>
                      <p className="text-ink leading-relaxed">{subReply.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
