import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, Clock, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";
import type { Metadata } from "next";

// 动态生成文章元数据
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const post = await prisma.document.findUnique({
    where: {
      id: params.id,
      isPublic: true,
      isDeleted: false,
    },
    select: { title: true, plainText: true, lastModifiedAt: true },
  });

  if (!post) {
    return {
      title: "文章不存在",
    };
  }

  const description = post.plainText.slice(0, 150) || "晓桃终生成长";

  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: "article",
      publishedTime: post.lastModifiedAt.toISOString(),
      url: `https://xiaotaotop.com/blog/post/${params.id}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
    },
  };
}

// 文章详情页
export default async function BlogPostPage({
  params,
}: {
  params: { id: string };
}) {
  const post = await prisma.document.findUnique({
    where: {
      id: params.id,
      isPublic: true,
      isDeleted: false,
    },
    include: {
      knowledgeBase: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  // 上一篇 / 下一篇
  const [prevPost, nextPost] = await Promise.all([
    prisma.document.findFirst({
      where: {
        isPublic: true,
        isDeleted: false,
        lastModifiedAt: { gt: post.lastModifiedAt },
      },
      orderBy: { lastModifiedAt: "asc" },
      select: { id: true, title: true },
    }),
    prisma.document.findFirst({
      where: {
        isPublic: true,
        isDeleted: false,
        lastModifiedAt: { lt: post.lastModifiedAt },
      },
      orderBy: { lastModifiedAt: "desc" },
      select: { id: true, title: true },
    }),
  ]);

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
    },
    publisher: {
      "@type": "Organization",
      name: "晓桃终生成长",
    },
    description: post.plainText.slice(0, 200),
    wordCount: post.wordCount,
  };

  return (
    <div className="min-h-screen bg-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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

          <Link
            href="/blog"
            className="text-sm text-muted hover:text-accent-deep transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={14} />
            返回首页
          </Link>
        </div>
      </header>

      {/* 文章内容 */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* 文章标题区 */}
        <article className="bg-white border border-rule rounded-2xl p-6 sm:p-10 mb-8">
          <header className="mb-8 pb-6 border-b border-rule">
            {post.knowledgeBase && (
              <Link
                href={`/blog?cat=${post.knowledgeBase.id}`}
                className="inline-block px-3 py-1 bg-accent-soft text-accent-deep text-xs font-medium rounded-full mb-4 hover:bg-accent hover:text-white transition-colors"
              >
                {post.knowledgeBase.name}
              </Link>
            )}
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
              <span>阅读约 {Math.ceil(post.wordCount / 400)} 分钟</span>
            </div>
          </header>

          {/* 正文 */}
          <div
            className="doc-content text-ink"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
          />
        </article>

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
        </div>
      </footer>
    </div>
  );
}
