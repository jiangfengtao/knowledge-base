"use client";

import { useState, useEffect, useCallback } from "react";
import {
  StickyNote,
  Plus,
  Pin,
  Clock,
  Search,
  Tag,
  Trash2,
  Edit3,
  Check,
  X,
  Hash,
  TrendingUp,
  Calendar,
} from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import isToday from "dayjs/plugin/isToday";
import isYesterday from "dayjs/plugin/isYesterday";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import clsx from "clsx";

dayjs.extend(isToday);
dayjs.extend(isYesterday);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.locale("zh-cn");

type Note = {
  id: string;
  content: string;
  plainText: string;
  isPinned: boolean;
  lastModifiedAt: string;
  createdAt: string;
  tags: string[];
};

export default function NotesView() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showTagFilter, setShowTagFilter] = useState(false);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      const res = await fetch(`/api/notes?${params.toString()}`);
      const data = await res.json();
      setNotes(data.data || []);
    } catch (e) {
      console.error("Load notes error:", e);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // 从所有小记中提取标签
  const allTags: { name: string; count: number }[] = [];
  const tagMap = new Map<string, number>();
  notes.forEach((n) => {
    n.tags.forEach((t) => {
      tagMap.set(t, (tagMap.get(t) || 0) + 1);
    });
  });
  tagMap.forEach((count, name) => allTags.push({ name, count }));
  allTags.sort((a, b) => b.count - a.count);

  // 过滤
  let filteredNotes = notes;
  if (activeTag) {
    filteredNotes = filteredNotes.filter((n) => n.tags.includes(activeTag));
  }

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const otherNotes = filteredNotes.filter((n) => !n.isPinned);

  // 按日期分组（时间线）
  const groupedByDate: { date: string; label: string; notes: Note[] }[] = [];
  const dateMap = new Map<string, Note[]>();
  otherNotes.forEach((n) => {
    const dateKey = dayjs(n.lastModifiedAt).format("YYYY-MM-DD");
    if (!dateMap.has(dateKey)) dateMap.set(dateKey, []);
    dateMap.get(dateKey)!.push(n);
  });
  dateMap.forEach((notesArr, date) => {
    const d = dayjs(date);
    let label: string;
    if (d.isToday()) label = "今天";
    else if (d.isYesterday()) label = "昨天";
    else label = d.format("M月D日 dddd");
    groupedByDate.push({ date, label, notes: notesArr });
  });
  groupedByDate.sort((a, b) => b.date.localeCompare(a.date));

  // 统计
  const todayCount = notes.filter((n) =>
    dayjs(n.lastModifiedAt).isToday()
  ).length;
  const weekCount = notes.filter((n) =>
    dayjs(n.lastModifiedAt).isAfter(dayjs().subtract(7, "day"))
  ).length;

  // 添加小记
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote }),
      });
      const data = await res.json();
      if (data.data) {
        setNotes([data.data, ...notes]);
        setNewNote("");
      }
    } catch (e) {
      console.error("Add note error:", e);
      alert("保存失败");
    }
  };

  // 置顶/取消置顶
  const handleTogglePin = async (noteId: string, currentPinned: boolean) => {
    try {
      await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPinned: !currentPinned }),
      });
      setNotes(
        notes.map((n) =>
          n.id === noteId ? { ...n, isPinned: !currentPinned } : n
        )
      );
    } catch (e) {
      console.error("Pin error:", e);
    }
  };

  // 编辑小记
  const handleSaveEdit = async (noteId: string) => {
    if (!editContent.trim()) return;
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });
      const data = await res.json();
      if (data.data) {
        setNotes(notes.map((n) => (n.id === noteId ? data.data : n)));
        setEditingId(null);
        setEditContent("");
      }
    } catch (e) {
      console.error("Edit error:", e);
      alert("保存失败");
    }
  };

  // 删除小记
  const handleDelete = async (noteId: string) => {
    if (!confirm("确定删除这条小记吗？")) return;
    try {
      await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
      setNotes(notes.filter((n) => n.id !== noteId));
    } catch (e) {
      console.error("Delete error:", e);
    }
  };

  // 渲染标签
  const renderTags = (content: string) => {
    // 把 #标签 高亮显示
    const parts = content.split(/(#[^\s#]+)/g);
    return parts.map((part, i) => {
      if (part.match(/^#[^\s#]+$/)) {
        return (
          <span
            key={i}
            className="text-accent-deep bg-accent-soft/50 px-1 rounded cursor-pointer hover:bg-accent-soft"
            onClick={(e) => {
              e.stopPropagation();
              setActiveTag(part.slice(1));
            }}
          >
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const NoteCard = ({ note }: { note: Note }) => {
    const isEditing = editingId === note.id;
    return (
      <div className="bg-white border border-rule rounded-lg p-4 hover:border-accent/30 hover:shadow-sm transition-all group">
        {isEditing ? (
          // 编辑模式
          <>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full resize-none outline-none text-sm text-ink min-h-[80px] mb-2"
              autoFocus
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setEditingId(null);
                  setEditContent("");
                }}
                className="px-2 py-1 text-xs text-muted hover:bg-[#f2f3f5] rounded transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => handleSaveEdit(note.id)}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-accent text-white rounded hover:bg-accent-2 transition-colors"
              >
                <Check size={12} />
                保存
              </button>
            </div>
          </>
        ) : (
          // 查看模式
          <>
            <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">
              {renderTags(note.content)}
            </p>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-rule">
              <div className="flex items-center gap-1.5 flex-wrap">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveTag(tag);
                    }}
                    className="text-xs px-1.5 py-0.5 bg-accent-soft text-accent-deep rounded cursor-pointer hover:bg-accent-soft/70"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-xs text-muted">
                  <Clock size={11} />
                  {dayjs(note.lastModifiedAt).format("MM-DD HH:mm")}
                </span>
                {/* 操作按钮 - hover 显示 */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleTogglePin(note.id, note.isPinned)}
                    className="p-1 hover:bg-[#f2f3f5] rounded transition-colors"
                    title={note.isPinned ? "取消置顶" : "置顶"}
                  >
                    <Pin
                      size={13}
                      className={note.isPinned ? "text-accent fill-accent" : "text-muted"}
                    />
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(note.id);
                      setEditContent(note.content);
                    }}
                    className="p-1 hover:bg-[#f2f3f5] rounded transition-colors"
                    title="编辑"
                  >
                    <Edit3 size={13} className="text-muted" />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-1 hover:bg-red-50 rounded transition-colors"
                    title="删除"
                  >
                    <Trash2 size={13} className="text-muted hover:text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-bg">
      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6">
        {/* 头部统计 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <StickyNote size={22} className="text-accent" />
            <h1 className="text-xl font-semibold text-ink">小记</h1>
            <span className="text-sm text-muted">{notes.length} 条</span>
          </div>
          {/* 统计卡片 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-rule rounded-lg">
              <Calendar size={14} className="text-accent" />
              <span className="text-xs text-muted">今日 {todayCount}</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-rule rounded-lg">
              <TrendingUp size={14} className="text-accent" />
              <span className="text-xs text-muted">本周 {weekCount}</span>
            </div>
          </div>
        </div>

        {/* 输入框 - 浮墨风格 */}
        <div className="bg-white border border-rule rounded-lg p-4 mb-4 shadow-sm">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleAddNote();
              }
            }}
            placeholder="记录一个想法... 用 #标签 来分类，如 #灵感 #读书"
            className="w-full resize-none outline-none text-sm text-ink placeholder:text-muted/60 min-h-[60px]"
            rows={2}
          />
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-rule">
            <div className="flex items-center gap-1.5">
              <Hash size={14} className="text-muted" />
              <span className="text-xs text-muted">用 # 添加标签</span>
            </div>
            <button
              onClick={handleAddNote}
              disabled={!newNote.trim()}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-colors",
                newNote.trim()
                  ? "bg-accent text-white hover:bg-accent-2"
                  : "bg-[#f2f3f5] text-muted cursor-not-allowed"
              )}
            >
              <Plus size={14} />
              <span>保存 (⌘↵)</span>
            </button>
          </div>
        </div>

        {/* 搜索 + 标签筛选 */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索小记..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-rule rounded text-sm outline-none focus:ring-1 focus:ring-accent transition-all"
            />
          </div>
          <button
            onClick={() => setShowTagFilter(!showTagFilter)}
            className={clsx(
              "flex items-center gap-1 px-2.5 py-1.5 text-sm rounded border transition-colors",
              showTagFilter || activeTag
                ? "bg-accent-soft text-accent-deep border-accent/30"
                : "bg-white text-muted border-rule hover:bg-[#f2f3f5]"
            )}
          >
            <Tag size={14} />
            <span>标签</span>
          </button>
        </div>

        {/* 标签筛选栏 */}
        {showTagFilter && allTags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-4 p-2 bg-white border border-rule rounded-lg">
            <button
              onClick={() => setActiveTag(null)}
              className={clsx(
                "text-xs px-2 py-1 rounded transition-colors",
                !activeTag
                  ? "bg-accent text-white"
                  : "text-muted hover:bg-[#f2f3f5]"
              )}
            >
              全部
            </button>
            {allTags.map((t) => (
              <button
                key={t.name}
                onClick={() => setActiveTag(t.name === activeTag ? null : t.name)}
                className={clsx(
                  "text-xs px-2 py-1 rounded transition-colors",
                  activeTag === t.name
                    ? "bg-accent text-white"
                    : "text-muted hover:bg-[#f2f3f5]"
                )}
              >
                #{t.name} ({t.count})
              </button>
            ))}
          </div>
        )}

        {/* 当前筛选标签提示 */}
        {activeTag && (
          <div className="flex items-center gap-2 mb-3 text-sm text-muted">
            <span>筛选标签：</span>
            <span className="px-2 py-0.5 bg-accent-soft text-accent-deep rounded text-xs">
              #{activeTag}
            </span>
            <button
              onClick={() => setActiveTag(null)}
              className="p-0.5 hover:bg-[#f2f3f5] rounded"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* 小记列表 */}
        {loading ? (
          <div className="text-center py-12 text-muted text-sm">加载中...</div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-ink mb-2">
              {notes.length === 0 ? "还没有小记" : "没有匹配的小记"}
            </h3>
            <p className="text-sm text-muted">
              {notes.length === 0
                ? "记下你的第一个想法吧"
                : "试试其他关键词或标签"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 置顶 */}
            {pinnedNotes.length > 0 && (
              <div>
                <div className="flex items-center gap-1 text-xs text-muted font-medium mb-2">
                  <Pin size={12} className="text-accent" />
                  <span>置顶</span>
                </div>
                <div className="space-y-3">
                  {pinnedNotes.map((note) => (
                    <NoteCard key={note.id} note={note} />
                  ))}
                </div>
              </div>
            )}

            {/* 时间线 */}
            {groupedByDate.map((group) => (
              <div key={group.date}>
                <div className="flex items-center gap-2 text-xs text-muted font-medium mb-2 mt-4">
                  <Calendar size={12} />
                  <span>{group.label}</span>
                  <span className="text-muted/50">· {group.notes.length} 条</span>
                </div>
                <div className="space-y-3">
                  {group.notes.map((note) => (
                    <NoteCard key={note.id} note={note} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
