import prisma from "@/lib/prisma";
import { getDefaultUser } from "@/lib/user";
import Link from "next/link";
import { PlayCircle, Calendar, Clock, History, Tag, Crown, Film } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

// 视频专栏页面 - 展示所有公开的视频文章
export default async function VideosPage() {
  const user = await getDefaultUser();
  const settings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  const blogTitle = settings?.blogTitle || "晓桃终生成长";
  const blogSubtitle =
    settings?.blogSubtitle ||
    "记录学习、思考与成长的点滴。关于英语学习、个人成长、以及那些让生活更美好的小发现。";

  // 查询所有公开的视频文章
  const videos = await prisma.document.findMany({
    where: {
      visibility: "public",
      isDeleted: false,
      isVideo: true,
    },
    orderBy: { lastModifiedAt: "desc" },
    select: {
      id: true,
      title: true,
      videoUrl: true,
      videoDuration: true,
      videoThumbnail: true,
      isVideo: true,
      lastModifiedAt: true,
      knowledgeBase: {
        select: {
          id: true,
          name: true,
          icon: true,
        },
      },
    },
  });

  const totalVideos = videos.length;

  return (
    <div className="min-h-screen bg-bg">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-rule">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold">
              桃
            </div>
            <span className="font-semibold text-ink">{blogTitle}</span>
          </Link>

          <nav className="flex items-center gap-3 text-sm text-muted">
            <Link href="/blog" className="hover:text-accent-deep transition-colors">
              首页
            </Link>
            <Link
              href="/videos"
              className="text-accent-deep font-medium flex items-center gap-1"
              title="视频"
            >
              <PlayCircle size={16} className="sm:hidden" />
              <span className="hidden sm:inline">视频</span>
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
              className="hover:text-accent-deep transition-colors flex items-center gap-1"
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent text-white mb-4">
            <Film size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-ink mb-4">
            视频
          </h1>
          <p className="text-muted text-base max-w-xl mx-auto mb-8">
            用视频记录成长，分享学习路上的点滴感悟与实用技巧
          </p>

          {/* 统计 */}
          <div className="flex items-center justify-center gap-8 text-sm text-muted">
            <div className="flex items-center gap-2">
              <PlayCircle size={16} className="text-accent" />
              <span>
                <strong className="text-ink">{totalVideos}</strong> 个视频
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-accent" />
              <span>持续更新中</span>
            </div>
          </div>
        </div>
      </section>

      {/* 视频网格 */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {videos.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <div className="text-5xl mb-4">🎬</div>
            <p>还没有视频内容</p>
            <p className="text-sm mt-1">敬请期待～</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Link
                key={video.id}
                href={`/blog/post/${video.id}`}
                className="group bg-white border border-rule rounded-xl overflow-hidden hover:border-accent/30 hover:shadow-lg transition-all"
              >
                {/* 视频封面 */}
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                  {video.videoThumbnail ? (
                    <img
                      src={video.videoThumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-accent-soft to-accent/20">
                      <Film size={48} className="text-accent/40" />
                    </div>
                  )}
                  {/* 播放按钮 */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                    <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <PlayCircle size={32} className="text-accent-deep ml-1" />
                    </div>
                  </div>
                  {/* 视频时长 */}
                  {video.videoDuration && (
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded font-medium">
                      {video.videoDuration}
                    </div>
                  )}
                </div>

                {/* 视频信息 */}
                <div className="p-4">
                  <h3 className="text-base font-semibold text-ink group-hover:text-accent-deep transition-colors line-clamp-2 mb-2 leading-snug">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(video.lastModifiedAt).toLocaleDateString(
                        "zh-CN",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>
                    {video.knowledgeBase && (
                      <span className="px-2 py-0.5 bg-accent-soft text-accent-deep rounded">
                        {video.knowledgeBase.name}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* 页脚 */}
      <footer className="border-t border-rule bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-muted">
          <p>© {new Date().getFullYear()} {blogTitle} · 用知识点亮成长之路</p>
          <p className="mt-2 text-xs">
            Powered by 晓桃知识库系统
          </p>
        </div>
      </footer>
    </div>
  );
}
