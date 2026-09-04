"use client";

import { useState, useEffect, useRef } from "react";
import { Search, FileText, StickyNote, Hash, X, Clock } from "lucide-react";
import dayjs from "dayjs";
import clsx from "clsx";

type SearchResult = {
  id: string;
  title: string;
  plainText: string;
  wordCount: number;
  lastModifiedAt: string;
  isFavorite: boolean;
  knowledgeBase?: { name: string };
  type: "document";
};

type NoteResult = {
  id: string;
  plainText: string;
  lastModifiedAt: string;
  type: "note";
};

type SearchViewProps = {
  onSelectDoc: (docId: string) => void;
};

export default function SearchView({ onSelectDoc }: SearchViewProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [noteResults, setNoteResults] = useState<NoteResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 防抖搜索
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setNoteResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        // 搜索文档
        const docRes = await fetch(
          `/api/documents?search=${encodeURIComponent(query)}`
        );
        const docData = await docRes.json();
        const docs = (docData.data || []).map((d: any) => ({
          ...d,
          type: "document" as const,
        }));
        setResults(docs);

        // 搜索小记
        const noteRes = await fetch(
          `/api/notes?search=${encodeURIComponent(query)}`
        );
        const noteData = await noteRes.json();
        const notes = (noteData.data || []).map((n: any) => ({
          ...n,
          type: "note" as const,
        }));
        setNoteResults(notes);
      } catch (e) {
        console.error("Search error:", e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const highlightText = (text: string, keyword: string) => {
    if (!keyword || !text) return text;
    const index = text.toLowerCase().indexOf(keyword.toLowerCase());
    if (index === -1) return text.slice(0, 100);

    const start = Math.max(0, index - 30);
    const end = Math.min(text.length, index + keyword.length + 70);
    const prefix = start > 0 ? "..." : "";
    const suffix = end < text.length ? "..." : "";

    const before = text.slice(start, index);
    const match = text.slice(index, index + keyword.length);
    const after = text.slice(index + keyword.length, end);

    return (
      <>
        {prefix}
        {before}
        <mark className="bg-yellow-200 text-ink rounded px-0.5">{match}</mark>
        {after}
        {suffix}
      </>
    );
  };

  const hasResults = results.length > 0 || noteResults.length > 0;

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* 搜索栏 */}
      <div className="p-4 border-b border-rule">
        <div className="max-w-2xl mx-auto relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索文档和小记..."
            className="w-full pl-10 pr-10 py-2.5 bg-[#f2f3f5] rounded-lg text-sm outline-none focus:bg-white focus:ring-2 focus:ring-accent/30 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-[#e8eaed] rounded transition-colors"
            >
              <X size={14} className="text-muted" />
            </button>
          )}
        </div>
      </div>

      {/* 结果区 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-4">
          {!query.trim() ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-ink mb-2">
                全局搜索
              </h3>
              <p className="text-sm text-muted">
                输入关键词，搜索所有文档和小记
              </p>
            </div>
          ) : loading ? (
            <div className="text-center py-12 text-sm text-muted">
              搜索中...
            </div>
          ) : !hasResults ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted">
                没有找到与「{query}」相关的内容
              </p>
            </div>
          ) : (
            <>
              {/* 文档结果 */}
              {results.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted">
                    <FileText size={16} />
                    <span>文档 ({results.length})</span>
                  </div>
                  <div className="space-y-1">
                    {results.map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() => onSelectDoc(doc.id)}
                        className="p-3 rounded-lg hover:bg-[#f9fafb] cursor-pointer transition-colors border border-transparent hover:border-rule"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <FileText size={14} className="text-muted flex-shrink-0" />
                          <h4 className="font-medium text-sm text-ink truncate flex-1">
                            {doc.title}
                          </h4>
                          {doc.knowledgeBase?.name && (
                            <span className="text-xs text-muted bg-[#f2f3f5] px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Hash size={10} />
                              {doc.knowledgeBase.name}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                          {highlightText(doc.plainText || "暂无内容", query)}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {dayjs(doc.lastModifiedAt).format("MM-DD HH:mm")}
                          </span>
                          <span>{doc.wordCount} 字</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 小记结果 */}
              {noteResults.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3 text-sm font-medium text-muted">
                    <StickyNote size={16} />
                    <span>小记 ({noteResults.length})</span>
                  </div>
                  <div className="space-y-1">
                    {noteResults.map((note) => (
                      <div
                        key={note.id}
                        className="p-3 rounded-lg hover:bg-[#f9fafb] cursor-pointer transition-colors border border-transparent hover:border-rule"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <StickyNote size={14} className="text-muted flex-shrink-0" />
                          <span className="text-xs text-muted">
                            {dayjs(note.lastModifiedAt).format("MM-DD HH:mm")}
                          </span>
                        </div>
                        <p className="text-sm text-ink line-clamp-3 leading-relaxed">
                          {highlightText(note.plainText, query)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
