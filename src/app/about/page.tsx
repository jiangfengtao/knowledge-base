import prisma from "@/lib/prisma";
import { getDefaultUser } from "@/lib/user";
import Link from "next/link";
import type { Metadata } from "next";
import ThemeToggle from "@/components/ThemeToggle";

export async function generateMetadata(): Promise<Metadata> {
  const user = await getDefaultUser();
  const settings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  const blogTitle = settings?.blogTitle || "晓桃终生成长";
  return {
    title: `关于 - ${blogTitle}`,
    description: settings?.bio || `关于${blogTitle}`,
  };
}

export default async function AboutPage() {
  const user = await getDefaultUser();
  const settings = await prisma.userSettings.findUnique({
    where: { userId: user.id },
  });

  const blogTitle = settings?.blogTitle || "晓桃终生成长";
  const blogSubtitle =
    settings?.blogSubtitle ||
    "记录学习、思考与成长的点滴。关于英语学习、个人成长、以及那些让生活更美好的小发现。";
  const bio =
    settings?.bio ||
    "你好，我是晓桃。一个在终生学习路上的普通人。\n这里记录我的学习笔记、思考和成长。关于自媒体运营、个人成长、以及那些让生活更美好的小发现。\n我相信知识的力量，也相信分享的价值。这个博客是我学习和思考的输出窗口，希望这些内容能对你有所帮助。";
  const avatarUrl = settings?.avatarUrl || "";

  // 解析社交链接
  let socialLinks: Record<string, string> = {};
  try {
    if (settings?.socialLinks) {
      socialLinks = JSON.parse(settings.socialLinks);
    }
  } catch (e) {
    console.error("Failed to parse socialLinks", e);
  }

  // 社交链接配置
  const socialConfig = [
    { key: "wechat", label: "微信", icon: "💬" },
    { key: "weibo", label: "微博", icon: "📢" },
    { key: "zhihu", label: "知乎", icon: "💡" },
    { key: "xiaohongshu", label: "小红书", icon: "📕" },
    { key: "github", label: "GitHub", icon: "💻" },
    { key: "email", label: "邮箱", icon: "📧" },
  ];

  // 过滤出有值的社交链接
  const availableSocials = socialConfig.filter(
    (item) => socialLinks[item.key] && socialLinks[item.key].trim() !== ""
  );

  // 将 bio 按换行符分段
  const bioParagraphs = bio.split(/\n+/).filter((p) => p.trim() !== "");

  return (
    <div className="min-h-screen bg-bg">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-rule">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={blogTitle}
                className="w-8 h-8 rounded-lg object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold">
                桃
              </div>
            )}
            <span className="font-semibold text-ink">{blogTitle}</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              className="text-sm text-muted hover:text-accent-deep transition-colors"
            >
              返回博客
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* 内容 */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white border border-rule rounded-2xl p-8 sm:p-12">
          {/* 头像和标题 */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={blogTitle}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shadow-lg border-4 border-white"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-accent to-accent-deep flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                桃
              </div>
            )}
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-ink mb-2">
                {blogTitle}
              </h1>
              <p className="text-muted text-sm sm:text-base">
                {blogSubtitle}
              </p>
            </div>
          </div>

          {/* 个人简介 */}
          <div className="space-y-4 text-ink leading-relaxed">
            {bioParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* 社交链接 */}
          {availableSocials.length > 0 && (
            <div className="mt-8 pt-8 border-t border-rule">
              <h2 className="text-xl font-semibold text-ink mb-4">联系我</h2>
              <p className="text-muted mb-4">
                如果你喜欢这里的内容，欢迎常来看看。也可以通过以下方式找到我：
              </p>
              <div className="flex flex-wrap gap-3 mt-4">
                {availableSocials.map((item) => {
                  const link = socialLinks[item.key];
                  // 如果是邮箱，用 mailto
                  const href =
                    item.key === "email" ? `mailto:${link}` : link;
                  const isLink =
                    item.key !== "wechat" && item.key !== "email";
                  return isLink ? (
                    <a
                      key={item.key}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-accent-soft text-accent-deep rounded-lg text-sm font-medium hover:bg-accent hover:text-white transition-colors"
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </a>
                  ) : (
                    <div
                      key={item.key}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-accent-soft text-accent-deep rounded-lg text-sm font-medium"
                      title={link}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
              {/* 显示微信/邮箱的具体值 */}
              {socialLinks.wechat && (
                <p className="mt-4 text-sm text-muted">
                  微信号：<code className="bg-accent-soft px-2 py-0.5 rounded text-accent-deep">{socialLinks.wechat}</code>
                </p>
              )}
              {socialLinks.email && (
                <p className="mt-2 text-sm text-muted">
                  邮箱：<a href={`mailto:${socialLinks.email}`} className="text-accent-deep hover:underline">{socialLinks.email}</a>
                </p>
              )}
            </div>
          )}

          {/* 如果没有社交链接，显示默认的浏览文章按钮 */}
          {availableSocials.length === 0 && (
            <div className="mt-8 pt-8 border-t border-rule">
              <h2 className="text-xl font-semibold text-ink mb-4">联系我</h2>
              <p className="text-muted">
                如果你喜欢这里的内容，欢迎常来看看。
              </p>
              <div className="flex gap-4 mt-4">
                <Link
                  href="/blog"
                  className="px-4 py-2 bg-accent-soft text-accent-deep rounded-lg text-sm font-medium hover:bg-accent hover:text-white transition-colors"
                >
                  浏览文章
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 页脚 */}
      <footer className="border-t border-rule bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 text-center text-sm text-muted">
          <p>© {new Date().getFullYear()} {blogTitle} · 用知识点亮成长之路</p>
        </div>
      </footer>
    </div>
  );
}
