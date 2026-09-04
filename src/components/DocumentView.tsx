"use client";

import { useState, useEffect } from "react";
import {
  Star,
  Share2,
  MoreHorizontal,
  Clock,
  User,
  Edit3,
  Eye,
  ArrowLeft,
  Save,
  Globe,
  Lock,
  Trash2,
} from "lucide-react";
import dynamic from "next/dynamic";
import dayjs from "dayjs";
import { sanitizeHtml } from "@/lib/sanitize";

const TiptapEditor = dynamic(() => import("./TiptapEditor"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse">
      <div className="h-8 bg-[#f2f3f5] rounded w-1/3 mb-4" />
      <div className="h-4 bg-[#f2f3f5] rounded w-full mb-2" />
      <div className="h-4 bg-[#f2f3f5] rounded w-5/6 mb-2" />
      <div className="h-4 bg-[#f2f3f5] rounded w-4/6 mb-2" />
    </div>
  ),
});

type DocViewProps = {
  docId?: string;
  onBack?: () => void;
  isNew?: boolean;
  kbId?: string;
};

export default function DocumentView({ docId, onBack, isNew, kbId }: DocViewProps) {
  const [mode, setMode] = useState<"view" | "edit">(isNew ? "edit" : "view");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 加载文档内容
  useEffect(() => {
    if (isNew) {
      setTitle("无标题文档");
      setContent("");
      setLoading(false);
      return;
    }

    if (!docId) return;

    const loadDoc = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/documents/${docId}`);
        const data = await res.json();
        if (data.data) {
          setTitle(data.data.title);
          setContent(data.data.content);
          setIsFavorite(data.data.isFavorite);
          setIsPublic(data.data.isPublic || false);
          setWordCount(data.data.wordCount);
          setUpdatedAt(new Date(data.data.lastModifiedAt));
        }
      } catch (e) {
        console.error("Load doc error:", e);
      } finally {
        setLoading(false);
      }
    };

    loadDoc();
  }, [docId, isNew]);

  const handleContentChange = (html: string, text: string) => {
    setContent(html);
    setWordCount(text.length);
  };

  // 保存文档
  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    try {
      // 提取纯文本
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = content;
      const plainText = tempDiv.textContent || tempDiv.innerText || "";

      if (isNew && kbId) {
        // 新建文档
        const res = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title || "无标题文档",
            content,
            plainText,
            knowledgeBaseId: kbId,
          }),
        });
        const data = await res.json();
        if (data.data) {
          // 切换到查看模式
          setMode("view");
          setUpdatedAt(new Date(data.data.lastModifiedAt));
        }
      } else if (docId) {
        // 更新文档
        const res = await fetch(`/api/documents/${docId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content,
            plainText,
          }),
        });
        const data = await res.json();
        if (data.data) {
          setMode("view");
          setUpdatedAt(new Date(data.data.lastModifiedAt));
        }
      }
    } catch (e) {
      console.error("Save doc error:", e);
    } finally {
      setSaving(false);
    }
  };

  // 切换收藏
  const toggleFavorite = async () => {
    if (!docId) return;

    try {
      await fetch(`/api/documents/${docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !isFavorite }),
      });
      setIsFavorite(!isFavorite);
    } catch (e) {
      console.error("Toggle favorite error:", e);
    }
  };

  // 切换公开/私密
  const togglePublic = async () => {
    if (!docId) return;

    try {
      await fetch(`/api/documents/${docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !isPublic }),
      });
      setIsPublic(!isPublic);
    } catch (e) {
      console.error("Toggle public error:", e);
    }
  };

  // 删除文档
  const handleDelete = async () => {
    if (!docId) return;

    if (!confirm("确定要删除这篇文档吗？删除后可在回收站找到。")) return;

    try {
      await fetch(`/api/documents/${docId}`, { method: "DELETE" });
      onBack?.();
    } catch (e) {
      console.error("Delete doc error:", e);
      alert("删除失败");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-muted text-sm">加载中...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-rule">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 hover:bg-[#f2f3f5] rounded transition-colors"
            >
              <ArrowLeft size={18} className="text-muted" />
            </button>
          )}
          <div className="text-sm text-muted">
            {mode === "view" ? "阅读模式" : "编辑模式"}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {mode === "edit" ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-accent text-white hover:bg-accent-2 rounded transition-colors disabled:opacity-50"
            >
              <Save size={15} />
              <span>{saving ? "保存中..." : "保存"}</span>
            </button>
          ) : (
            <button
              onClick={() => setMode("edit")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-ink hover:bg-[#f2f3f5] rounded transition-colors"
            >
              <Edit3 size={15} />
              <span>编辑</span>
            </button>
          )}

          {!isNew && (
            <>
              <button
                onClick={togglePublic}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-sm rounded transition-colors ${
                  isPublic
                    ? "bg-accent-soft text-accent-deep"
                    : "text-muted hover:bg-[#f2f3f5]"
                }`}
                title={isPublic ? "已公开，点击设为私密" : "点击公开文章"}
              >
                {isPublic ? <Globe size={15} /> : <Lock size={15} />}
                <span className="hidden sm:inline">
                  {isPublic ? "公开" : "私密"}
                </span>
              </button>

              <button
                onClick={toggleFavorite}
                className={`p-1.5 rounded transition-colors ${
                  isFavorite ? "text-yellow-500" : "text-muted hover:bg-[#f2f3f5]"
                }`}
              >
                <Star size={18} className={isFavorite ? "fill-current" : ""} />
              </button>
            </>
          )}

          <button className="p-1.5 text-muted hover:bg-[#f2f3f5] rounded transition-colors">
            <Share2 size={18} />
          </button>

          {!isNew && (
            <button
              onClick={handleDelete}
              className="p-1.5 text-muted hover:bg-red-50 hover:text-red-500 rounded transition-colors"
              title="删除文档"
            >
              <Trash2 size={18} />
            </button>
          )}

          <button className="p-1.5 text-muted hover:bg-[#f2f3f5] rounded transition-colors">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
          {/* 标题 */}
          {mode === "edit" ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入文档标题..."
              className="w-full text-3xl font-semibold text-ink outline-none border-none bg-transparent mb-4 placeholder:text-muted/50"
            />
          ) : (
            <h1 className="text-3xl font-semibold text-ink mb-3">{title}</h1>
          )}

          {/* 元信息 */}
          <div className="flex items-center gap-4 text-sm text-muted mb-8 pb-4 border-b border-rule">
            <span className="flex items-center gap-1">
              <User size={14} />
              我
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              最后更新于 {dayjs(updatedAt).format("YYYY-MM-DD HH:mm")}
            </span>
            <span>{wordCount} 字</span>
          </div>

          {/* 正文内容 */}
          {mode === "edit" ? (
            <TiptapEditor
              content={content}
              placeholder="开始写作，按 / 唤起更多功能..."
              onChange={handleContentChange}
              editable
              docTitle={title}
            />
          ) : (
            <div
              className="doc-content text-ink"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
