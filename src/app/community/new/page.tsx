"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const CATEGORIES = [
  { id: "discussion", label: "讨论", icon: "💬" },
  { id: "question", label: "问答", icon: "❓" },
  { id: "share", label: "分享", icon: "🔗" },
  { id: "english", label: "英语学习", icon: "📚" },
  { id: "growth", label: "个人成长", icon: "🌱" },
];

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("discussion");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("标题和内容不能为空");
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, type: category, category }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/community");
      } else {
        setError(data.error || "发布失败");
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-rule">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/community" className="flex items-center gap-2 text-sm text-muted hover:text-accent-deep transition-colors">
            <ArrowLeft size={16} /> 返回社区
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <h1 className="text-xl font-bold text-ink mb-6">发布帖子</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 分类选择 */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">选择分类</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                    category === cat.id
                      ? "bg-accent text-white"
                      : "bg-white border border-rule text-muted hover:border-accent/30"
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="一句话说清楚你想聊什么"
              className="w-full px-4 py-3 bg-white border border-rule rounded-xl text-sm outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all"
            />
            <p className="text-xs text-muted mt-1 text-right">{title.length}/100</p>
          </div>

          {/* 内容 */}
          <div>
            <label className="block text-sm font-medium text-ink mb-2">内容</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={10000}
              rows={10}
              placeholder="详细写下你的想法、问题或分享..."
              className="w-full px-4 py-3 bg-white border border-rule rounded-xl text-sm outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all resize-none"
            />
            <p className="text-xs text-muted mt-1 text-right">{content.length}/10000</p>
          </div>

          {error && (
            <div className="px-4 py-2 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
          )}

          {/* 提交 */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-dark transition-colors disabled:opacity-50"
          >
            <Send size={16} />
            {submitting ? "发布中..." : "发布帖子"}
          </button>
        </form>
      </main>
    </div>
  );
}
