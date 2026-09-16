import prisma from "@/lib/prisma";
import { getDefaultUser } from "@/lib/user";
import Link from "next/link";
import { PlayCircle, Calendar, Clock, History, Tag, Crown, Film, TrendingUp } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import MobileBottomNav from "@/components/MobileBottomNav";

export const revalidate = 300; // 每5分钟重新生成

// 视频专栏页面 - 展示所有公开的视频文章
export default async function VideosPage({
  searchParams,
}: {
  searchParams: { cat?: string };
}) {
  const category = searchParams?.cat || "";
  const user = await getDefaultUser();
  const settings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  const blogTitle = settings?.blogTitle || "晓桃终生成长";
  const blogSubtitle =
    settings?.blogSubtitle ||
    "记录学习、思考与成长的点滴。关于英语学习、个人成长、以及那些让生活更美好的小发现。";

  // 获取视频分类
  const videoKbs = await prisma.knowledgeBase.findMany({
    where: {
      userId: user.id,
      documents: {
        some: {
          visibility: "public",
          isDeleted: false,
          isVideo: true,
        },
      },
    },
    select: {
      id: true,
      name: true,
      icon: true,
    },
    orderBy: { sortOrder: "asc" },
  });

  // 查询所有公开的视频文章
  const where: any = {
    visibility: "public",
    isDeleted: false,
    isVideo: true,
  };

  if (category) {
    where.knowledgeBaseId = category;
  }

  const videos = await prisma.document.findMany({
    where,
    orderBy: { lastModifiedAt: "desc" },
    select: {
      id: true,
      title: true,
      plainText: true,
      videoUrl: true,
      videoDuration: true,
      videoThumbnail: true,
      isVideo: true,
      viewCount: true,
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
  const totalDuration = videos.reduce((acc, v) => {
    if (!v.videoDuration) return acc;
    const parts = v.videoDuration.split(":").map(Number);
    if (parts.length === 2) return acc + parts[0] * 60 + parts[1];
    if (parts.length === 3) return acc + parts[0] * 3600 + parts[1] * 60 + parts[2];
    return acc;
  }, 0);
  const totalHours = Math.floor(totalDuration / 3600);
  const totalMins = Math.floor((totalDuration % 3600) / 60);

  return (
    <div className="min-h-screen bg-bg">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-rule">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold">
              晓桃
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
      <section className="bg-gradient-to-b from-accent-soft/50 to-transparent py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center text-white shadow-lg">
              <Film size={32} className="sm:hidden" />
              <Film size={40} className="hidden sm:block" />
            </div>
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-2">
                视频内容
              </h1>
              <p className="text-muted text-sm sm:text-base max-w-xl">
                用视频记录成长，分享学习路上的点滴感悟与实用技巧
              </p>
            </div>
            {/* 统计卡片 */}
            <div className="flex items-center gap-4 sm:gap-6 bg-white rounded-2xl border border-rule px-5 py-3 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-deep">{totalVideos}</div>
                <div className="text-xs text-muted">个视频</div>
              </div>
              <div className="w-px h-10 bg-rule" />
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-deep">
                  {totalHours > 0 ? `${totalHours}h` : ""}{totalMins}m
                </div>
                <div className="text-xs text-muted">总时长</div>
              </div>
              <div className="w-px h-10 bg-rule" />
              <div className="text-center">
                <div className="text-2xl font-bold text-accent-deep">
                  <TrendingUp size={20} className="inline" />
                </div>
                <div className="text-xs text-muted">持续更新</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 分类筛选栏 */}
      {videoKbs.length > 0 && (
        <div className="border-b border-rule bg-white/60 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <Link
                href="/videos"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                  !category
                    ? "bg-accent text-white font-medium shadow-sm"
                    : "bg-white text-ink border border-rule hover:border-accent/30"
                }`}
              >
                <Film size={14} />
                全部视频
              </Link>
              {videoKbs.map((kb) => (
                <Link
                  key={kb.id}
                  href={`/videos?cat=${kb.id}`}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                    category === kb.id
                      ? "bg-accent text-white font-medium shadow-sm"
                      : "bg-white text-ink border border-rule hover:border-accent/30"
                  }`}
                >
                  <span>{kb.icon || "📁"}</span>
                  {kb.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 视频网格 */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {videos.length === 0 ? (
          <div className="text-center py-20 text-muted">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent-soft flex items-center justify-center">
              <Film size={40} className="text-accent/50" />
            </div>
            <p className="text-lg font-medium">还没有视频内容</p>
            <p className="text-sm mt-2">视频内容正在筹备中，敬请期待～</p>
          </div>
        ) : (
          <>
            {/* 视频卡片网格 - 响应式自适应 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {videos.map((video, index) => (
                <Link
                  key={video.id}
                  href={`/blog/post/${video.id}`}
                  className="group bg-white border border-rule rounded-2xl overflow-hidden hover:border-accent/40 hover:shadow-xl transition-all duration-300"
                >
                  {/* 视频封面 - 16:9 比例 */}
                  <div className="relative aspect-video bg-gradient-to-br from-[#f0f7ff] to-accent-soft overflow-hidden">
                    {video.videoThumbnail ? (
                      <img
                        src={video.videoThumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/60 backdrop-blur-sm flex items-center justify-center">
                          <Film size={28} className="text-accent/40" />
                        </div>
                      </div>
                    )}
                    {/* 渐变遮罩 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {/* 播放按钮 */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300">
                        <PlayCircle size={32} className="text-accent-deep ml-1" fill="currentColor" />
                      </div>
                    </div>
                    {/* 视频时长 */}
                    {video.videoDuration && (
                      <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/75 text-white text-xs rounded font-medium backdrop-blur-sm">
                        {video.videoDuration}
                      </div>
                    )}
                    {/* 置顶标识 */}
                    {index === 0 && !category && (
                      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-accent text-white text-xs rounded-full font-medium flex items-center gap-1">
                        <TrendingUp size={10} />
                        最新
                      </div>
                    )}
                  </div>

                  {/* 视频信息 */}
                  <div className="p-4 sm:p-5">
                    <h3 className="text-base font-semibold text-ink group-hover:text-accent-deep transition-colors line-clamp-2 mb-2.5 leading-snug min-h-[2.8em]">
                      {video.title}
                    </h3>
                    {/* 纯文本预览 */}
                    {video.plainText && (
                      <p className="text-sm text-muted line-clamp-2 mb-3 leading-relaxed">
                        {video.plainText.slice(0, 80)}
                        {video.plainText.length > 80 ? "..." : ""}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(video.lastModifiedAt).toLocaleDateString("zh-CN", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      {video.knowledgeBase && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-accent-soft text-accent-deep rounded-full text-xs font-medium">
                          <span>{video.knowledgeBase.icon || "📁"}</span>
                          {video.knowledgeBase.name}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* 底部提示 */}
            <div className="text-center mt-10 text-sm text-muted">
              <p>共 {totalVideos} 个视频 · 持续更新中</p>
            </div>
          </>
        )}
      </main>

      {/* 页脚 */}
      <footer className="border-t border-rule bg-white pb-16 md:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-muted">
          <p>© {new Date().getFullYear()} {blogTitle} · 用知识点亮成长之路</p>
          <p className="mt-2 text-xs">Powered by 晓桃知识库系统</p>
        </div>
      </footer>

      {/* 移动端底部导航 */}
      <MobileBottomNav />
    </div>
  );
}
