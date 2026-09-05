import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, ArrowLeft, ChevronLeft, ChevronRight, Eye, Lock, Shield, Share2, BookOpen, Check } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";
import type { Metadata } from "next";
import BlogPostClient from "./BlogPostClient";
import ThemeToggle from "@/components/ThemeToggle";
import ShareButtons from "@/components/ShareButtons";
import { getCurrentUser } from "@/lib/auth-server";
import SubscribeBox from "@/components/SubscribeBox";

// 动态生成文章元数据
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const post = await prisma.document.findUnique({
    where: {
      id: params.id,
      isDeleted: false,
    },
    select: { title: true, plainText: true, lastModifiedAt: true, visibility: true },
  });

  if (!post || post.visibility === "private") {
    return {
      title: "文章不存在",
    };
  }

  // 微信分享卡片描述控制在 120 字以内
  const description = post.plainText.slice(0, 120) || "晓桃终生成长";
  const articleUrl = `https://xiaotaotop.com/blog/post/${params.id}`;
  const shareImage = "/icon-512.png";

  return {
    title: post.title,
    description,
    alternates: {
      canonical: articleUrl,
    },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.lastModifiedAt.toISOString(),
      url: articleUrl,
      siteName: "晓桃终生成长",
      authors: ["晓桃"],
      images: [
        {
          url: shareImage,
          width: 512,
          height: 512,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [shareImage],
      site: "@xiaotaotop",
      creator: "@xiaotaotop",
    },
    // 微信分享增强标签
    other: {
      "wechat:title": post.title,
      "wechat:description": description,
      "wechat:image": shareImage,
      "wechat:url": articleUrl,
      "wechat:type": "article",
    },
  };
}

const LICENSE_MAP: Record<string, { name: string; url: string }> = {
  "all-rights": {
    name: "保留所有权利",
    url: "https://xiaotaotop.com/copyright",
  },
  "cc-by": {
    name: "CC BY 4.0",
    url: "https://creativecommons.org/licenses/by/4.0/deed.zh-hans",
  },
  "cc-by-nc": {
    name: "CC BY-NC 4.0",
    url: "https://creativecommons.org/licenses/by-nc/4.0/deed.zh-hans",
  },
  "cc-by-nc-sa": {
    name: "CC BY-NC-SA 4.0",
    url: "https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans",
  },
};

// 文章详情页
export default async function BlogPostPage({
  params,
}: {
  params: { id: string };
}) {
  const user = await getCurrentUser();

  const post = await prisma.document.findUnique({
    where: {
      id: params.id,
      isDeleted: false,
    },
    include: {
      knowledgeBase: {
        select: {
          id: true,
          name: true,
        },
      },
      tags: {
        include: {
          tag: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  // 判断是否为 mp4 视频
  const isMp4Video = post?.videoUrl?.toLowerCase().endsWith(".mp4") ?? false;

  if (!post || post.visibility === "private") {
    notFound();
  }

  // 会员文章检查
  const isMemberOnly = post.visibility === "members";
  const canViewFull =
    post.visibility === "public" ||
    (isMemberOnly && user?.isMember) ||
    user?.id === post.userId;

  // 上一篇 / 下一篇（只找公开和会员可见的）
  const visibilityFilter = user?.isMember
    ? { in: ["public", "members"] }
    : "public";

  const [prevPost, nextPost] = await Promise.all([
    prisma.document.findFirst({
      where: {
        visibility: visibilityFilter as any,
        isDeleted: false,
        lastModifiedAt: { gt: post.lastModifiedAt },
      },
      orderBy: { lastModifiedAt: "asc" },
      select: { id: true, title: true },
    }),
    prisma.document.findFirst({
      where: {
        visibility: visibilityFilter as any,
        isDeleted: false,
        lastModifiedAt: { lt: post.lastModifiedAt },
      },
      orderBy: { lastModifiedAt: "desc" },
      select: { id: true, title: true },
    }),
  ]);

  // 相关文章（同分类下的其他文章）
  const relatedPosts = post.knowledgeBaseId
    ? await prisma.document.findMany({
        where: {
          visibility: visibilityFilter as any,
          isDeleted: false,
          knowledgeBaseId: post.knowledgeBaseId,
          id: { not: post.id },
        },
        orderBy: { lastModifiedAt: "desc" },
        take: 5,
        select: { id: true, title: true, lastModifiedAt: true },
      })
    : [];

  // 系列文章（如果当前文章属于某个系列）
  let seriesPosts: { id: string; title: string; seriesOrder: number; visibility: string }[] = [];
  let seriesInfo: { id: string; title: string } | null = null;
  let currentSeriesIndex = 0;

  if (post.seriesId) {
    // 查询系列信息（系列本身是一个 isSeries=true 的文档）
    const seriesDoc = await prisma.document.findUnique({
      where: { id: post.seriesId, isDeleted: false },
      select: { id: true, title: true, visibility: true },
    });

    if (seriesDoc && (seriesDoc.visibility === "public" || (user?.isMember && seriesDoc.visibility === "members") || user?.id === post.userId)) {
      seriesInfo = { id: seriesDoc.id, title: seriesDoc.title };

      // 查询同一系列的所有文章
      seriesPosts = await prisma.document.findMany({
        where: {
          seriesId: post.seriesId,
          isDeleted: false,
          visibility: visibilityFilter as any,
        },
        orderBy: { seriesOrder: "asc" },
        select: { id: true, title: true, seriesOrder: true, visibility: true },
      });

      // 计算当前文章在系列中的位置（从 1 开始）
      currentSeriesIndex =
        seriesPosts.findIndex((p) => p.id === post.id) + 1;
    }
  }

  // 结构化数据
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    datePublished: post.lastModifiedAt.toISOString(),
    dateModified: post.lastModifiedAt.toISOString(),
    author: {
      "@type": "Person",
      name: "晓桃",
      url: "https://xiaotaotop.com/about",
    },
    publisher: {
      "@type": "Organization",
      name: "晓桃终生成长",
    },
    description: post.plainText.slice(0, 200),
    wordCount: post.wordCount,
    license: LICENSE_MAP[post.license]?.url,
  };

  const readingTime = Math.ceil(post.wordCount / 400);

  // 会员文章只显示前 200 字
  const displayContent =
    !canViewFull && isMemberOnly
      ? sanitizeHtml(
          post.content.replace(/<[^>]*>/g, " ").slice(0, 200) + "..."
        )
      : sanitizeHtml(post.content);

  const licenseInfo = LICENSE_MAP[post.license] || LICENSE_MAP["all-rights"];

  return (
    <div className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* 客户端组件：记录阅读量 + 评论 + 复制保护 */}
      <BlogPostClient
        postId={post.id}
        allowCopy={post.allowCopy}
        isMemberOnly={isMemberOnly && !canViewFull}
      />

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
              className="text-sm text-muted hover:text-accent-deep transition-colors flex items-center gap-1"
            >
              <ArrowLeft size={14} />
              返回首页
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* 文章内容 */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* 系列文章导航 */}
        {seriesInfo && seriesPosts.length > 0 && (
          <div className="bg-white border border-rule rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-accent-deep" />
                <Link
                  href={`/blog/post/${seriesInfo.id}`}
                  className="font-semibold text-ink hover:text-accent-deep transition-colors"
                >
                  {seriesInfo.title}
                </Link>
              </div>
              <span className="text-xs text-muted bg-bg px-2 py-1 rounded-full">
                第 {currentSeriesIndex} 篇 / 共 {seriesPosts.length} 篇
              </span>
            </div>
            <div className="space-y-1">
              {seriesPosts.map((sp, index) => (
                <Link
                  key={sp.id}
                  href={`/blog/post/${sp.id}`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    sp.id === post.id
                      ? "bg-accent-soft text-accent-deep"
                      : "hover:bg-bg text-ink"
                  }`}
                >
                  <span
                    className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      sp.id === post.id
                        ? "bg-accent text-white"
                        : "bg-bg text-muted"
                    }`}
                  >
                    {sp.id === post.id ? (
                      <Check size={12} />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span className="text-sm line-clamp-1 flex-1">
                    {sp.title}
                  </span>
                  {sp.visibility === "members" && (
                    <Lock size={12} className="text-amber-500 flex-shrink-0" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 文章标题区 */}
        <article className="bg-white border border-rule rounded-2xl p-6 sm:p-10 mb-8">
          <header className="mb-8 pb-6 border-b border-rule">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {post.knowledgeBase && (
                <Link
                  href={`/blog?cat=${post.knowledgeBase.id}`}
                  className="inline-block px-3 py-1 bg-accent-soft text-accent-deep text-xs font-medium rounded-full hover:bg-accent hover:text-white transition-colors"
                >
                  {post.knowledgeBase.name}
                </Link>
              )}
              {isMemberOnly && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  <Lock size={12} />
                  会员专属
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                {new Date(post.lastModifiedAt).toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {post.wordCount} 字
              </span>
              <span>阅读约 {readingTime} 分钟</span>
              <span className="flex items-center gap-1.5" id="view-count">
                <Eye size={14} />
                {post.viewCount} 阅读
              </span>
            </div>

            {/* 标签 */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map((dt) => (
                  <span
                    key={dt.tag.id}
                    className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    #{dt.tag.name}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* 视频播放器 */}
          {post.isVideo && post.videoUrl && (
            <div className="mb-8">
              {isMp4Video ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg bg-black">
                  <video
                    src={post.videoUrl}
                    poster={post.videoThumbnail || undefined}
                    controls
                    className="w-full h-full object-contain"
                    preload="metadata"
                  >
                    您的浏览器不支持视频播放。
                  </video>
                </div>
              ) : (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg bg-gray-100 border border-rule">
                  {post.videoThumbnail ? (
                    <img
                      src={post.videoThumbnail}
                      alt={post.title}
                      className="w-full h-full object-cover opacity-60"
                    />
                  ) : null}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-6 text-center shadow-xl max-w-sm mx-4">
                      <p className="text-ink font-medium mb-2">视频链接</p>
                      <p className="text-sm text-muted mb-4">
                        该视频暂不支持内嵌播放，请点击下方链接观看
                      </p>
                      <a
                        href={post.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-2 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        前往观看 →
                      </a>
                    </div>
                  </div>
                </div>
              )}
              {post.videoDuration && (
                <p className="text-xs text-muted mt-2 text-right">
                  时长：{post.videoDuration}
                </p>
              )}
            </div>
          )}

          {/* 正文 */}
          <div
            className={`doc-content text-ink ${
              !post.allowCopy ? "select-none" : ""
            }`}
            onContextMenu={(e) => !post.allowCopy && e.preventDefault()}
            dangerouslySetInnerHTML={{ __html: displayContent }}
          />

          {/* 会员专属遮挡 */}
          {isMemberOnly && !canViewFull && (
            <div className="mt-8 p-6 bg-gradient-to-b from-transparent to-white/90 border border-accent/20 rounded-xl text-center">
              <Lock size={32} className="mx-auto mb-3 text-accent-deep" />
              <h3 className="text-lg font-semibold text-ink mb-2">
                这是会员专属内容
              </h3>
              <p className="text-sm text-muted mb-4">
                加入会员，解锁全部深度文章和完整学习记录
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/membership"
                  className="px-4 py-2 bg-accent hover:bg-accent-2 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  了解会员权益
                </Link>
                <Link
                  href="/redeem"
                  className="px-4 py-2 border border-rule hover:bg-bg text-ink text-sm font-medium rounded-lg transition-colors"
                >
                  已有邀请码
                </Link>
              </div>
            </div>
          )}

          {/* 版权声明 */}
          {canViewFull && (
            <div className="mt-8 pt-6 border-t border-rule">
              <div className="flex items-start gap-3 p-4 bg-bg rounded-xl">
                <Shield size={18} className="text-muted flex-shrink-0 mt-0.5" />
                <div className="text-xs text-muted leading-relaxed">
                  <p className="font-medium text-ink mb-1">版权声明</p>
                  <p>
                    本文采用
                    <a
                      href={licenseInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent-deep hover:underline mx-1"
                    >
                      {licenseInfo.name}
                    </a>
                    协议。
                    {post.allowCopy
                      ? "转载请注明出处和作者。"
                      : "未经授权，禁止转载、复制。"}
                  </p>
                  {post.allowShare !== false && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-muted">分享：</span>
                      <div className="relative inline-block">
                        <ShareButtons
                          url={`/blog/post/${post.id}`}
                          title={post.title}
                          description={post.plainText.slice(0, 120)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </article>

        {/* 相关文章 */}
        {relatedPosts.length > 0 && (
          <div className="bg-white border border-rule rounded-2xl p-6 sm:p-8 mb-8">
            <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-accent rounded-full" />
              相关文章
            </h2>
            <div className="grid gap-3">
              {relatedPosts.map((rp) => (
                <Link
                  key={rp.id}
                  href={`/blog/post/${rp.id}`}
                  className="flex items-center justify-between py-2 border-b border-rule last:border-0 hover:text-accent-deep transition-colors group"
                >
                  <span className="text-sm text-ink group-hover:text-accent-deep line-clamp-1">
                    {rp.title}
                  </span>
                  <span className="text-xs text-muted flex-shrink-0 ml-4">
                    {new Date(rp.lastModifiedAt).toLocaleDateString("zh-CN", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 评论区 */}
        {canViewFull && (
          <div className="bg-white border border-rule rounded-2xl p-6 sm:p-8 mb-8">
            <h2 className="text-lg font-semibold text-ink mb-4 flex items-center gap-2">
              <span className="w-1 h-5 bg-accent rounded-full" />
              评论
            </h2>
            <div id="comments-container">
              <p className="text-sm text-muted text-center py-8">
                评论加载中...
              </p>
            </div>
          </div>
        )}

        {/* 邮件订阅 */}
        {canViewFull && (
          <div className="mb-8">
            <SubscribeBox source={`post_${params.id}`} variant="bottom" />
          </div>
        )}

        {/* 上一篇 / 下一篇 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {prevPost ? (
            <Link
              href={`/blog/post/${prevPost.id}`}
              className="p-4 bg-white border border-rule rounded-xl hover:border-accent/30 transition-all group"
            >
              <div className="flex items-center gap-1 text-xs text-muted mb-2">
                <ChevronLeft size={12} />
                <span>上一篇</span>
              </div>
              <div className="text-sm text-ink font-medium group-hover:text-accent-deep transition-colors line-clamp-2">
                {prevPost.title}
              </div>
            </Link>
          ) : (
            <div />
          )}
          {nextPost ? (
            <Link
              href={`/blog/post/${nextPost.id}`}
              className="p-4 bg-white border border-rule rounded-xl hover:border-accent/30 transition-all group text-right"
            >
              <div className="flex items-center justify-end gap-1 text-xs text-muted mb-2">
                <span>下一篇</span>
                <ChevronRight size={12} />
              </div>
              <div className="text-sm text-ink font-medium group-hover:text-accent-deep transition-colors line-clamp-2">
                {nextPost.title}
              </div>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </main>

      {/* 页脚 */}
      <footer className="border-t border-rule bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-muted">
          <p>© {new Date().getFullYear()} 晓桃终生成长 · 用知识点亮成长之路</p>
          <p className="mt-2 text-xs">
            <Link
              href="/feed.xml"
              className="hover:text-accent-deep transition-colors"
            >
              RSS 订阅
            </Link>
            {" · "}
            <Link
              href="/copyright"
              className="hover:text-accent-deep transition-colors"
            >
              版权声明
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
