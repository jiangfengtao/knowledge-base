"use client";

import { useState } from "react";
import Link from "next/link";
import { Gift, Check, X, ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function RedeemPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/invite-codes/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      setResult({ success: data.success, message: data.message || data.error });
    } catch {
      setResult({ success: false, message: "网络错误，请稍后重试" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-rule">
        <div className="max-w-lg mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold">
              晓桃
            </div>
            <span className="font-semibold text-ink">晓桃自学英语</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 sm:px-6 py-16 pb-28 md:pb-16">
        <Link
          href="/membership"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent-deep transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          返回会员介绍
        </Link>

        <div className="bg-white border border-rule rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center mx-auto mb-4">
              <Gift size={32} className="text-accent-deep" />
            </div>
            <h1 className="text-2xl font-bold text-ink mb-2">兑换会员</h1>
            <p className="text-sm text-muted">
              输入你的邀请码，立即开通会员权限
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">
                邀请码
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="请输入8位邀请码"
                className="w-full px-4 py-3 border border-rule rounded-xl bg-bg text-ink placeholder:text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all uppercase tracking-wider font-mono text-center text-lg"
                maxLength={12}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full py-3 bg-accent hover:bg-accent-2 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  兑换中...
                </>
              ) : (
                <>立即开通会员</>
              )}
            </button>
          </form>

          {result && (
            <div
              className={`mt-6 p-4 rounded-xl flex items-start gap-3 ${
                result.success
                  ? "bg-accent-soft text-accent-deep"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {result.success ? (
                <Check size={20} className="flex-shrink-0 mt-0.5" />
              ) : (
                <X size={20} className="flex-shrink-0 mt-0.5" />
              )}
              <span className="text-sm">{result.message}</span>
            </div>
          )}

          {result?.success && (
            <Link
              href="/blog"
              className="block w-full mt-4 py-2.5 text-center border border-rule rounded-xl text-ink hover:bg-bg transition-colors text-sm font-medium"
            >
              去阅读会员内容
            </Link>
          )}
        </div>

        <p className="text-center text-xs text-muted mt-6">
          还没有邀请码？
          <Link
            href="/membership"
            className="text-accent-deep hover:underline ml-1"
          >
            了解会员权益
          </Link>
        </p>
      </main>

      {/* 移动端底部导航 */}
      <MobileBottomNav />
    </div>
  );
}
