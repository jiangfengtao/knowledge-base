import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-accent mb-4">404</div>
        <h1 className="text-2xl font-semibold text-ink mb-3">页面不存在</h1>
        <p className="text-muted mb-8">
          你访问的页面可能已被移动或删除，请返回首页继续浏览。
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent-deep transition-colors"
          >
            返回首页
          </Link>
          <Link
            href="/blog"
            className="px-6 py-3 bg-white border border-rule text-ink rounded-lg font-medium hover:border-accent/30 transition-colors"
          >
            浏览博客
          </Link>
        </div>
      </div>
    </div>
  );
}
