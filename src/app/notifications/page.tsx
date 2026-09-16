"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Bell, Reply, Heart, Crown, Info, Check, ArrowLeft } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import MobileBottomNav from "@/components/MobileBottomNav";
import { formatDistanceToNow } from "@/lib/format-date";

type Notification = {
  id: string;
  type: string;
  title: string;
  content: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

const ICON_MAP: Record<string, { icon: typeof Reply; color: string; bg: string }> = {
  reply: { icon: Reply, color: "text-blue-500", bg: "bg-blue-50" },
  like: { icon: Heart, color: "text-rose-500", bg: "bg-rose-50" },
  membership: { icon: Crown, color: "text-amber-500", bg: "bg-amber-50" },
  system: { icon: Info, color: "text-gray-500", bg: "bg-gray-50" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggedIn, setLoggedIn] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/community/notifications");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
        setUnreadCount(data.unreadCount);
      } else {
        if (data.error?.includes("登录")) {
          setLoggedIn(false);
        } else {
          setError(data.error || "加载失败");
        }
      }
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/community/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleMarkRead = async (id: string) => {
    try {
      await fetch("/api/community/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-ink mb-2">请先登录</h1>
          <p className="text-sm text-muted mb-6">登录后才能查看通知</p>
          <Link
            href="/login?redirect=/notifications"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-dark transition-colors"
          >
            去登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-rule">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/community" className="flex items-center gap-2 text-sm text-muted hover:text-accent-deep transition-colors">
            <ArrowLeft size={16} /> 返回社区
          </Link>
          <span className="font-semibold text-ink text-sm">通知</span>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        {/* 操作栏 */}
        {unreadCount > 0 && (
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted">
              {unreadCount} 条未读
            </span>
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 text-sm text-accent-deep hover:underline"
            >
              <Check size={14} /> 全部已读
            </button>
          </div>
        )}

        {/* 通知列表 */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-sm text-red-500">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🔔</div>
            <p className="text-muted text-sm">暂无通知</p>
            <p className="text-muted text-xs mt-1">有人回复或点赞你时会在这里提醒</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => {
              const config = ICON_MAP[n.type] || ICON_MAP.system;
              const Icon = config.icon;
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
                    n.isRead
                      ? "bg-white border-rule"
                      : "bg-accent-soft/30 border-accent/20"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={18} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${n.isRead ? "text-ink" : "text-ink font-semibold"}`}>
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    {n.content && (
                      <p className="text-xs text-muted mt-0.5 truncate">{n.content}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-muted">{formatDistanceToNow(n.createdAt)}</span>
                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkRead(n.id)}
                          className="text-xs text-accent-deep hover:underline"
                        >
                          标为已读
                        </button>
                      )}
                      {n.link && (
                        <Link
                          href={n.link}
                          onClick={() => !n.isRead && handleMarkRead(n.id)}
                          className="text-xs text-accent-deep hover:underline"
                        >
                          查看 →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
}
