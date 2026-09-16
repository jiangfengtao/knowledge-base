"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Send, User, Mail, ChevronDown, ChevronUp } from "lucide-react";

interface Comment {
  id: string;
  nickname: string;
  email: string | null;
  content: string;
  parentId: string | null;
  createdAt: string;
  replies?: Comment[];
}

export default function CommentSection({ documentId }: { documentId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [replyTo, setReplyTo] = useState<{ id: string; nickname: string } | null>(null);
  const [showEmailField, setShowEmailField] = useState(false);

  // 加载评论
  useEffect(() => {
    loadComments();
  }, [documentId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/comments?documentId=${documentId}`);
      const data = await res.json();
      if (data.success) {
        setComments(data.data);
        setTotalCount(data.totalCount);
      }
    } catch (e) {
      console.error("加载评论失败", e);
    }
    setLoading(false);
  };

  // 提交评论
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !content.trim()) {
      setMessage({ type: "error", text: "请填写昵称和评论内容" });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          nickname: nickname.trim(),
          email: email.trim() || undefined,
          content: content.trim(),
          parentId: replyTo?.id || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: data.message || "评论发表成功！" });
        setContent("");
        setReplyTo(null);
        loadComments(); // 重新加载评论列表
      } else {
        setMessage({ type: "error", text: data.error || "评论发表失败" });
      }
    } catch (e) {
      setMessage({ type: "error", text: "网络错误，请稍后再试" });
    }

    setSubmitting(false);
  };

  // 格式化时间
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "刚刚";
    if (minutes < 60) return `${minutes} 分钟前`;
    if (hours < 24) return `${hours} 小时前`;
    if (days < 7) return `${days} 天前`;
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 生成头像首字母
  const getAvatarChar = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // 生成头像颜色（根据昵称 hash）
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-pink-100 text-pink-600",
      "bg-purple-100 text-purple-600",
      "bg-blue-100 text-blue-600",
      "bg-green-100 text-green-600",
      "bg-yellow-100 text-yellow-600",
      "bg-orange-100 text-orange-600",
      "bg-teal-100 text-teal-600",
      "bg-red-100 text-red-600",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="bg-white border border-rule rounded-2xl p-6 sm:p-8 mb-8">
      <h2 className="text-lg font-semibold text-ink mb-6 flex items-center gap-2">
        <span className="w-1 h-5 bg-accent rounded-full" />
        评论
        {totalCount > 0 && (
          <span className="text-sm font-normal text-muted">
            ({totalCount} 条)
          </span>
        )}
      </h2>

      {/* 发表评论表单 */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="你的昵称 *"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
                className="w-full pl-10 pr-4 py-2.5 border border-rule rounded-xl text-sm bg-bg/50 focus:bg-white focus:border-accent/50 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {showEmailField && (
          <div className="mb-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
              <input
                type="email"
                placeholder="你的邮箱（选填，有回复会通知你）"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-rule rounded-xl text-sm bg-bg/50 focus:bg-white focus:border-accent/50 focus:outline-none transition-colors"
              />
            </div>
          </div>
        )}

        <div className="mb-3">
          <textarea
            placeholder={replyTo ? `回复 @${replyTo.nickname}...` : "说点什么吧..."}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
            rows={4}
            className="w-full px-4 py-3 border border-rule rounded-xl text-sm bg-bg/50 focus:bg-white focus:border-accent/50 focus:outline-none transition-colors resize-none"
          />
          <div className="flex justify-between items-center mt-1.5">
            <span className="text-xs text-muted">{content.length}/500</span>
            {!showEmailField && (
              <button
                type="button"
                onClick={() => setShowEmailField(true)}
                className="text-xs text-muted hover:text-accent transition-colors"
              >
                需要回复通知？填写邮箱
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          {replyTo && (
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="text-sm text-muted hover:text-accent transition-colors"
            >
              取消回复
            </button>
          )}
          <div className={replyTo ? "" : "ml-auto"}>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-xl text-sm font-medium hover:bg-accent-dark transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? "发送中..." : "发表评论"}
            </button>
          </div>
        </div>

        {/* 消息提示 */}
        {message && (
          <div
            className={`mt-3 text-sm ${
              message.type === "success" ? "text-green-600" : "text-red-500"
            }`}
          >
            {message.text}
          </div>
        )}
      </form>

      {/* 评论列表 */}
      {loading ? (
        <div className="text-center py-8 text-muted text-sm">加载中...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10">
          <MessageCircle className="w-12 h-12 mx-auto text-rule mb-3" />
          <p className="text-muted text-sm">还没有评论，来抢个沙发吧～</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="group">
              {/* 主评论 */}
              <div className="flex gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${getAvatarColor(
                    comment.nickname
                  )}`}
                >
                  {getAvatarChar(comment.nickname)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-ink text-sm">
                      {comment.nickname}
                    </span>
                    <span className="text-xs text-muted">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-ink text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {comment.content}
                  </p>
                  <button
                    onClick={() =>
                      setReplyTo({ id: comment.id, nickname: comment.nickname })
                    }
                    className="mt-1.5 text-xs text-muted hover:text-accent transition-colors"
                  >
                    回复
                  </button>
                </div>
              </div>

              {/* 回复列表 */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-12 mt-4 space-y-4 pl-4 border-l-2 border-rule/50">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${getAvatarColor(
                          reply.nickname
                        )}`}
                      >
                        {getAvatarChar(reply.nickname)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-ink text-xs">
                            {reply.nickname}
                          </span>
                          <span className="text-xs text-muted">
                            {formatDate(reply.createdAt)}
                          </span>
                        </div>
                        <p className="text-ink text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {reply.content}
                        </p>
                        <button
                          onClick={() =>
                            setReplyTo({
                              id: comment.id,
                              nickname: reply.nickname,
                            })
                          }
                          className="mt-1 text-xs text-muted hover:text-accent transition-colors"
                        >
                          回复
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
