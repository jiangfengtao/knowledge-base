"use client";

import { useState } from "react";
import { Heart, Send } from "lucide-react";

export default function CommunityPostClient({
  postId,
  likeCount: initialLikeCount,
}: {
  postId: string;
  likeCount: number;
}) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [replies, setReplies] = useState<{ id: string; authorName: string; content: string; createdAt: string }[]>([]);

  const handleLike = async () => {
    try {
      const res = await fetch("/api/community/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType: "post", targetId: postId }),
      });
      const data = await res.json();
      if (data.success) {
        setLiked(data.liked);
        setLikeCount((c) => c + (data.liked ? 1 : -1));
      }
    } catch {}
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) {
      setReplyError("回复内容不能为空");
      return;
    }
    setSubmitting(true);
    setReplyError("");

    try {
      const res = await fetch(`/api/community/posts/${postId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent }),
      });
      const data = await res.json();
      if (data.success) {
        setReplies([...replies, data.data]);
        setReplyContent("");
      } else {
        if (data.error?.includes("登录")) {
          window.location.href = "/login?redirect=/community/post/" + postId;
        } else {
          setReplyError(data.error || "回复失败");
        }
      }
    } catch {
      setReplyError("网络错误，请重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* 点赞按钮 */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
            liked
              ? "bg-rose-50 text-rose-500"
              : "bg-white border border-rule text-muted hover:border-rose-200"
          }`}
        >
          <Heart size={16} className={liked ? "fill-rose-500" : ""} />
          {likeCount > 0 ? likeCount : "点赞"}
        </button>
      </div>

      {/* 回复表单 */}
      <form onSubmit={handleReply} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            maxLength={2000}
            placeholder="写下你的回复..."
            className="flex-1 px-4 py-2.5 bg-white border border-rule rounded-xl text-sm outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20 transition-all"
          />
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-1 px-4 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-dark transition-colors disabled:opacity-50"
          >
            <Send size={14} />
            回复
          </button>
        </div>
        {replyError && (
          <p className="mt-2 text-xs text-red-500">{replyError}</p>
        )}
      </form>

      {/* 新增的回复（客户端渲染） */}
      {replies.map((reply) => (
        <div key={reply.id} className="bg-white border border-rule rounded-xl p-4 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold">
              {reply.authorName.slice(0, 1)}
            </div>
            <span className="text-sm font-medium text-ink">{reply.authorName}</span>
            <span className="text-xs text-muted">刚刚</span>
          </div>
          <p className="text-sm text-ink leading-relaxed pl-9">{reply.content}</p>
        </div>
      ))}
    </>
  );
}
