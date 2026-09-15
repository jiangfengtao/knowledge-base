"use client";

import { useState, useEffect, useRef } from "react";
import { FileText, Plus, Clock, Star, Search, ArrowUpDown, Video, Mic, ChevronDown } from "lucide-react";
import dayjs from "dayjs";
import clsx from "clsx";

type Document = {
  id: string;
  title: string;
  plainText: string;
  wordCount: number;
  isFavorite: boolean;
  lastModifiedAt: string;
  isVideo?: boolean;
  isAudio?: boolean;
};

type DocListProps = {
  kbName?: string;
  kbId?: string;
  onSelectDoc: (docId: string) => void;
  onNewDoc: (type?: "article" | "video" | "audio") => void;
  selectedDocId?: string;
  initialFilterType?: "all" | "article" | "video" | "audio";
};

export default function DocumentList({
  kbName = "文档",
  kbId,
  onSelectDoc,
  onNewDoc,
  selectedDocId,
  initialFilterType = "all",
}: DocListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"time" | "title" | "words">("time");
  const [filterType, setFilterType] = useState<"all" | "article" | "video" | "audio">(initialFilterType);
  const [showNewMenu, setShowNewMenu] = useState(false);
  const newMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDocuments();
  }, [kbId, searchQuery]);

  // 点击外部关闭新建菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (newMenuRef.current && !newMenuRef.current.contains(e.target as Node)) {
        setShowNewMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  // 筛选
  const filteredDocs = documents.filter((doc) => {
    if (filterType === "article") return !doc.isVideo && !doc.isAudio;
    if (filterType === "video") return doc.isVideo;
    if (filterType === "audio") return doc.isAudio;
    return true;
  });

  // 排序
  const sortedDocs = [...filteredDocs].sort((a, b) => {
    if (sortBy === "title") return a.title.localeCompare(b.title);
    if (sortBy === "words") return b.wordCount - a.wordCount;
    return new Date(b.lastModifiedAt).getTime() - new Date(a.lastModifiedAt).getTime();
  });

  const sortOptions = [
    { id: "time", label: "按时间" },
    { id: "title", label: "按标题" },
    { id: "words", label: "按字数" },
  ] as const;

  const filterOptions: { id: "all" | "article" | "video" | "audio"; label: string; icon?: typeof FileText }[] = [
    { id: "all", label: "全部" },
    { id: "article", label: "文章", icon: FileText },
    { id: "video", label: "视频", icon: Video },
    { id: "audio", label: "音频", icon: Mic },
  ];

  return (
    <div className="w-72 border-r border-rule bg-white flex flex-col flex-shrink-0">
      {/* 头部 */}
      <div className="p-4 border-b border-rule">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-ink truncate">{kbName}</h2>
          <div className="relative flex-shrink-0" ref={newMenuRef}>
            <div className="flex items-center">
              <button
                onClick={() => onNewDoc("article")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-base text-white bg-accent hover:bg-accent-2 rounded-l-lg transition-colors font-medium shadow-sm"
              >
                <Plus size={18} />
                <span>新建</span>
              </button>
              <button
                onClick={() => setShowNewMenu(!showNewMenu)}
                className="flex items-center justify-center w-8 py-1.5 text-white bg-accent hover:bg-accent-2 rounded-r-lg transition-colors border-l border-white/20 shadow-sm"
                aria-label="更多类型"
              >
                <ChevronDown size={16} className={showNewMenu ? "rotate-180 transition-transform" : "transition-transform"} />
              </button>
            </div>
            {/* 下拉菜单 */}
            {showNewMenu && (
              <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-rule z-20 overflow-hidden">
                <button
                  onClick={() => {
                    onNewDoc("article");
                    setShowNewMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-ink hover:bg-[#f9fafb] transition-colors text-left"
                >
                  <FileText size={16} className="text-muted" />
                  <span>新建文章</span>
                </button>
                <button
                  onClick={() => {
                    onNewDoc("video");
                    setShowNewMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-ink hover:bg-[#f9fafb] transition-colors text-left"
                >
                  <Video size={16} className="text-accent" />
                  <span>新建视频</span>
                </button>
                <button
                  onClick={() => {
                    onNewDoc("audio");
                    setShowNewMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-ink hover:bg-[#f9fafb] transition-colors text-left"
                >
                  <Mic size={16} className="text-purple-500" />
                  <span>新建音频</span>
                </button>
              </div>
            )}
          </div>
        </div>
        {/* 搜索 */}
        <div className="relative mb-2">
          <Search
            size={15}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索文档..."
            className="w-full pl-9 pr-3 py-2 bg-[#f2f3f5] rounded-lg text-sm outline-none focus:bg-white focus:ring-1 focus:ring-accent transition-all"
          />
        </div>
        {/* 类型筛选 */}
        <div className="flex items-center gap-1 mb-2">
          {filterOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => setFilterType(opt.id as typeof filterType)}
                className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
                  filterType === opt.id
                    ? "bg-accent-soft text-accent-deep font-medium"
                    : "text-muted hover:bg-[#f2f3f5] hover:text-ink"
                }`}
              >
                {Icon && <Icon size={12} />}
                <span>{opt.label}</span>
              </button>
            );
          })}
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
                {doc.isAudio ? (
                  <Mic size={16} className="text-purple-500 mt-0.5 flex-shrink-0" />
                ) : doc.isVideo ? (
                  <Video size={16} className="text-accent mt-0.5 flex-shrink-0" />
                ) : (
                  <FileText size={16} className="text-muted mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-medium text-base text-ink truncate flex-1">
                      {doc.title}
                    </h3>
                    {doc.isFavorite && (
                      <Star
                        size={14}
                        className="text-yellow-500 fill-yellow-500 flex-shrink-0"
                      />
                    )}
                  </div>
                  <p className="text-sm text-muted mt-1 line-clamp-2 leading-relaxed">
                    {doc.plainText.slice(0, 80) || "暂无内容"}
                    {doc.plainText.length > 80 ? "..." : ""}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-sm text-muted">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
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
