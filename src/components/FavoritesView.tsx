"use client";

import { useState, useEffect } from "react";
import { Star, FileText, Clock, Search } from "lucide-react";
import dayjs from "dayjs";

type FavDoc = {
  id: string;
  title: string;
  plainText: string;
  wordCount: number;
  isFavorite: boolean;
  lastModifiedAt: string;
  knowledgeBase?: { name: string };
};

type FavoritesViewProps = {
  onSelectDoc: (docId: string) => void;
};

export default function FavoritesView({ onSelectDoc }: FavoritesViewProps) {
  const [docs, setDocs] = useState<FavDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/documents?favorite=true");
      const data = await res.json();
      setDocs(data.data || []);
    } catch (e) {
      console.error("Load favorites error:", e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = docs.filter(
    (d) =>
      !search ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.plainText.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* 头部 */}
      <div className="p-4 border-b border-rule">
        <div className="flex items-center gap-2 mb-3">
          <Star size={20} className="text-yellow-500 fill-yellow-500" />
          <h2 className="font-semibold text-ink">我的收藏</h2>
          <span className="text-sm text-muted">({docs.length})</span>
        </div>
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="在收藏中搜索..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#f2f3f5] rounded text-sm outline-none focus:bg-white focus:ring-1 focus:ring-accent transition-all"
          />
        </div>
      </div>

      {/* 列表 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {loading ? (
            <div className="text-center py-12 text-sm text-muted">
              加载中...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-lg font-medium text-ink mb-2">
                {docs.length === 0 ? "还没有收藏的文档" : "没有匹配的结果"}
              </h3>
              <p className="text-sm text-muted">
                {docs.length === 0
                  ? "在文档详情页点击星标即可收藏"
                  : "试试其他关键词"}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => onSelectDoc(doc.id)}
                  className="p-3 rounded-lg hover:bg-[#f9fafb] cursor-pointer transition-colors border border-transparent hover:border-rule"
                >
                  <div className="flex items-start gap-2">
                    <FileText size={16} className="text-muted mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-medium text-sm text-ink truncate flex-1">
                          {doc.title}
                        </h4>
                        <Star
                          size={14}
                          className="text-yellow-500 fill-yellow-500 flex-shrink-0"
                        />
                      </div>
                      <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">
                        {doc.plainText.slice(0, 100) || "暂无内容"}
                        {doc.plainText.length > 100 ? "..." : ""}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted">
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {dayjs(doc.lastModifiedAt).format("MM-DD HH:mm")}
                        </span>
                        <span>{doc.wordCount} 字</span>
                        {doc.knowledgeBase?.name && (
                          <span className="text-muted">
                            {doc.knowledgeBase.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
