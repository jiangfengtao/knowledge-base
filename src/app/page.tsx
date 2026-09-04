"use client";

import { useEffect, useState } from "react";
import KnowledgeBaseApp from "@/components/KnowledgeBaseApp";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    // 验证 token 是否仍然有效
    fetch("/api/knowledge-bases", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res.status === 401) {
          // token 失效，清除并跳转登录
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_info");
          window.location.href = "/login";
        } else {
          setChecking(false);
        }
      })
      .catch(() => {
        // 网络错误也放行，避免完全卡住
        setChecking(false);
      });
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f6f7]">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-accent mx-auto mb-2" />
          <p className="text-sm text-muted">加载中...</p>
        </div>
      </div>
    );
  }

  return <KnowledgeBaseApp />;
}
