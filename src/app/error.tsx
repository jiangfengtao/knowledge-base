"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("应用错误:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-semibold text-ink mb-3">出了点问题</h1>
        <p className="text-muted mb-8">
          页面加载时发生错误，请尝试刷新页面。如果问题持续，请稍后再试。
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="px-6 py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent-deep transition-colors"
          >
            重试
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-white border border-rule text-ink rounded-lg font-medium hover:border-accent/30 transition-colors"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
