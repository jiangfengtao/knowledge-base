"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // 尝试获取未读通知数
    fetch("/api/community/notifications?unreadOnly=true")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUnreadCount(data.unreadCount || 0);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <Link
      href="/notifications"
      className="relative flex items-center justify-center w-8 h-8 rounded-lg hover:bg-bg transition-colors"
      title="通知"
    >
      <Bell size={18} className="text-muted" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
