import Link from "next/link";

export const metadata = {
  title: "离线模式 - 晓桃终生成长",
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">📡</div>
        <h1 className="text-2xl font-bold text-ink mb-3">当前处于离线模式</h1>
        <p className="text-sm text-muted leading-relaxed mb-6">
          你目前没有网络连接，但已经浏览过的页面仍然可以访问。
          等网络恢复后，页面会自动更新。
        </p>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-dark transition-colors"
        >
          去博客看看
        </Link>
      </div>
    </div>
  );
}
