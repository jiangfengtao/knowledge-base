"use client";

import { useState, useEffect } from "react";
import { FileText, Plus, Clock, Star, Search, ArrowUpDown } from "lucide-react";
import dayjs from "dayjs";
import clsx from "clsx";

type Document = {
  id: string;
  title: string;
  plainText: string;
  wordCount: number;
  isFavorite: boolean;
  lastModifiedAt: string;
};

type DocListProps = {
  kbName?: string;
  kbId?: string;
  onSelectDoc: (docId: string) => void;
  onNewDoc: () => void;
  selectedDocId?: string;
};

export default function DocumentList({
  kbName = "文档",
  kbId,
  onSelectDoc,
  onNewDoc,
  selectedDocId,
}: DocListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"time" | "title" | "words">("time");

  useEffect(() => {
    loadDocuments();
  }, [kbId, searchQuery]);

  const loadDocuments = async () => {
    if (!kbId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("knowledgeBaseId", kbId);
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(`/api/documents?${params.toString()}`);
      const data = await res.json();
      setDocuments(data.data || []);
    } catch (e) {
      console.error("Load documents error:", e);
    } finally {
      setLoading(false);
    }
  };

  // 排序
  const sortedDocs = [...documents].sort((a, b) => {
    if (sortBy === "title") return a.title.localeCompare(b.title);
    if (sortBy === "words") return b.wordCount - a.wordCount;
    return new Date(b.lastModifiedAt).getTime() - new Date(a.lastModifiedAt).getTime();
  });

  const sortOptions = [
    { id: "time", label: "按时间" },
    { id: "title", label: "按标题" },
    { id: "words", label: "按字数" },
  ] as const;

  return (
    <div className="w-72 border-r border-rule bg-white flex flex-col flex-shrink-0">
      {/* 头部 */}
      <div className="p-4 border-b border-rule">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-ink truncate">{kbName}</h2>
          <button
            onClick={onNewDoc}
            className="flex items-center gap-1 px-2 py-1 text-sm text-accent-deep hover:bg-accent-soft rounded transition-colors flex-shrink-0"
          >
            <Plus size={16} />
            <span>新建</span>
          </button>
        </div>
        {/* 搜索 */}
        <div className="relative mb-2">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索文档..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#f2f3f5] rounded text-sm outline-none focus:bg-white focus:ring-1 focus:ring-accent transition-all"
          />
        </div>
        {/* 排序 */}
        <div className="flex items-center gap-1">
          <ArrowUpDown size={12} className="text-muted" />
          {sortOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setSortBy(opt.id)}
              className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
                sortBy === opt.id
                  ? "text-accent-deep font-medium"
                  : "text-muted hover:text-ink"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 文档列表 */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-muted text-sm">加载中...</div>
        ) : documents.length === 0 ? (
          <div className="p-8 text-center text-muted text-sm">
            暂无文档，点击「新建」开始写作
          </div>
        ) : (
          sortedDocs.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onSelectDoc(doc.id)}
              className={clsx(
                "p-3 border-b border-rule cursor-pointer transition-colors",
                selectedDocId === doc.id
                  ? "bg-accent-soft/50"
                  : "hover:bg-[#f9fafb]"
              )}
            >
              <div className="flex items-start gap-2">
                <FileText size={16} className="text-muted mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-medium text-sm text-ink truncate flex-1">
                      {doc.title}
                    </h3>
                    {doc.isFavorite && (
                      <Star
                        size={12}
                        className="text-yellow-500 fill-yellow-500 flex-shrink-0"
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">
                    {doc.plainText.slice(0, 80) || "暂无内容"}
                    {doc.plainText.length > 80 ? "..." : ""}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {dayjs(doc.lastModifiedAt).format("MM-DD")}
                    </span>
                    <span>{doc.wordCount} 字</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
