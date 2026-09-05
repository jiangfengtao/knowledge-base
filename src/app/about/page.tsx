import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于",
  description: "关于晓桃终生成长",
};

export default function AboutPage() {
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
          <Link
            href="/blog"
            className="text-sm text-muted hover:text-accent-deep transition-colors"
          >
            返回博客
          </Link>
        </div>
      </header>

      {/* 内容 */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white border border-rule rounded-2xl p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-ink mb-6">关于我</h1>
          
          <div className="space-y-4 text-ink leading-relaxed">
            <p>
              你好，我是晓桃。一个在终生学习路上的普通人。
            </p>
            <p>
              这里记录我的学习笔记、思考和成长。关于自媒体运营、个人成长、以及那些让生活更美好的小发现。
            </p>
            <p>
              我相信知识的力量，也相信分享的价值。这个博客是我学习和思考的输出窗口，希望这些内容能对你有所帮助。
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-rule">
            <h2 className="text-xl font-semibold text-ink mb-4">联系我</h2>
            <p className="text-muted">
              如果你喜欢这里的内容，欢迎常来看看。也可以通过以下方式找到我：
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
