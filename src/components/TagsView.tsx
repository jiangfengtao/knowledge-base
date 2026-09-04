"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "@/lib/api-fetch";
import {
  Tag as TagIcon,
  Plus,
  ChevronDown,
  ChevronRight,
  Edit3,
  Trash2,
  Check,
  X,
  Hash,
  AlertCircle,
  Folder,
  FolderOpen,
  MoreHorizontal,
  MoveUp,
  MoveDown,
  Palette,
  FileText,
  StickyNote,
} from "lucide-react";
import clsx from "clsx";

type TagNode = {
  id: string;
  name: string;
  color: string | null;
  parentId?: string | null;
  sortOrder: number;
  count: number;
  children?: TagNode[];
};

const TAG_COLORS = [
  { name: "默认", value: null },
  { name: "红", value: "#ef4444" },
  { name: "橙", value: "#f97316" },
  { name: "黄", value: "#eab308" },
  { name: "绿", value: "#22c55e" },
  { name: "青", value: "#06b6d4" },
  { name: "蓝", value: "#3b82f6" },
  { name: "紫", value: "#a855f7" },
  { name: "粉", value: "#ec4899" },
  { name: "灰", value: "#6b7280" },
];

export default function TagsView() {
  const [tags, setTags] = useState<TagNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTags, setExpandedTags] = useState<Record<string, boolean>>({});

  // 编辑弹窗
  const [editModal, setEditModal] = useState<{
    show: boolean;
    tagId: string | null;
    name: string;
    color: string | null;
    parentId: string | null;
    isNew: boolean;
  }>({
    show: false,
    tagId: null,
    name: "",
    color: null,
    parentId: null,
    isNew: false,
  });

  // 内联创建
  const [inlineCreate, setInlineCreate] = useState<{
    parentId: string | null;
    name: string;
    color: string | null;
  }>({ parentId: null, name: "", color: null });

  // 行内编辑标签名
  const [inlineEdit, setInlineEdit] = useState<{
    tagId: string;
    name: string;
  } | null>(null);

  const [error, setError] = useState("");
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    tagId: string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const loadTags = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("auth_token") || "";
      const res = await fetch("/api/tags", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setError(`加载标签失败 (HTTP ${res.status})，请刷新页面重试`);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setTags(data.data || []);
        const expand: Record<string, boolean> = {};
        const expandAll = (nodes: TagNode[]) => {
          nodes.forEach((t) => {
            if (t.children && t.children.length > 0) {
              expand[t.id] = true;
              expandAll(t.children);
            }
          });
        };
        expandAll(data.data || []);
        setExpandedTags(expand);
      } else {
        setError(data.error || "加载标签失败");
      }
    } catch (e) {
      setError("网络错误，请检查网络连接后重试");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  // 点击外部关闭右键菜单
  useEffect(() => {
    const handler = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener("click", handler);
      return () => document.removeEventListener("click", handler);
    }
  }, [contextMenu]);

  const toggleExpand = (tagId: string) => {
    setExpandedTags((prev) => ({ ...prev, [tagId]: !prev[tagId] }));
  };

  // 创建标签（通用）
  const createTag = async (name: string, color: string | null, parentId: string | null) => {
    if (!name.trim()) return { success: false, error: "名称不能为空" };
    try {
      const res = await apiFetch("/api/tags", {
        method: "POST",
        body: JSON.stringify({ name, color, parentId }),
      });
      const data = await res.json();
      if (data.success) {
        if (parentId) setExpandedTags((prev) => ({ ...prev, [parentId]: true }));
        loadTags();
        return { success: true };
      }
      return { success: false, error: data.error };
    } catch (e) {
      return { success: false, error: "网络错误" };
    }
  };

  // 更新标签
  const updateTag = async (id: string, name: string, color: string | null) => {
    try {
      const res = await apiFetch("/api/tags", {
        method: "PUT",
        body: JSON.stringify({ id, name, color }),
      });
      const data = await res.json();
      if (data.success) {
        loadTags();
        return true;
      }
      setError(data.error || "保存失败");
      return false;
    } catch (e) {
      setError("网络错误");
      return false;
    }
  };

  // 删除标签
  const deleteTag = async (tagId: string, tagName: string, hasChildren: boolean) => {
    const msg = hasChildren
      ? `确定删除标签「${tagName}」吗？\n子标签将变为顶级标签，关联的内容将取消该标签。`
      : `确定删除标签「${tagName}」吗？`;
    if (!confirm(msg)) return;
    try {
      const res = await apiFetch(`/api/tags?id=${tagId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) loadTags();
      else setError(data.error || "删除失败");
    } catch (e) {
      setError("网络错误");
    }
  };

  // 移动排序
  const moveTag = async (tagId: string, direction: "up" | "down") => {
    // 简单的 sortOrder 调整
    try {
      const res = await apiFetch("/api/tags", {
        method: "PUT",
        body: JSON.stringify({
          id: tagId,
          sortOrder: direction === "up" ? -1 : 1,
        }),
      });
      if (res.ok) loadTags();
    } catch (e) {
      // ignore
    }
  };

  // 内联创建提交
  const handleInlineCreate = async (parentId: string | null) => {
    const result = await createTag(inlineCreate.name, inlineCreate.color, parentId);
    if (result.success) {
      setInlineCreate({ parentId: null, name: "", color: null });
    } else {
      setError(result.error || "创建失败");
    }
  };

  // 行内编辑保存
  const handleInlineEditSave = async (tagId: string) => {
    if (!inlineEdit || !inlineEdit.name.trim()) {
      setInlineEdit(null);
      return;
    }
    const tag = findTag(tags, tagId);
    if (tag && inlineEdit.name.trim() !== tag.name) {
      await updateTag(tagId, inlineEdit.name.trim(), tag.color);
    }
    setInlineEdit(null);
  };

  // 弹窗保存
  const handleModalSave = async () => {
    if (!editModal.name.trim()) return;
    setError("");
    if (editModal.isNew) {
      const result = await createTag(editModal.name, editModal.color, editModal.parentId);
      if (result.success) {
        setEditModal({ show: false, tagId: null, name: "", color: null, parentId: null, isNew: false });
      } else {
        setError(result.error || "创建失败");
      }
    } else if (editModal.tagId) {
      const ok = await updateTag(editModal.tagId, editModal.name, editModal.color);
      if (ok) {
        setEditModal({ show: false, tagId: null, name: "", color: null, parentId: null, isNew: false });
      }
    }
  };

  // 渲染标签图标
  const renderTagIcon = (tag: TagNode, size: number = 14) => {
    if (tag.color) {
      return (
        <span
          className="inline-flex items-center justify-center rounded flex-shrink-0"
          style={{
            width: size + 6,
            height: size + 6,
            backgroundColor: tag.color + "20",
          }}
        >
          <Hash size={size - 2} style={{ color: tag.color }} />
        </span>
      );
    }
    return <Hash size={size} className="text-muted flex-shrink-0" />;
  };

  // 渲染颜色选择器
  const ColorPicker = ({
    selected,
    onSelect,
  }: {
    selected: string | null;
    onSelect: (color: string | null) => void;
  }) => (
    <div className="flex items-center gap-1.5 flex-wrap">
      {TAG_COLORS.map((c) => (
        <button
          key={c.value || "default"}
          onClick={() => onSelect(c.value)}
          className={clsx(
            "w-6 h-6 rounded-full flex items-center justify-center transition-all border",
            selected === c.value
              ? "ring-2 ring-offset-1 ring-accent border-transparent"
              : "border-rule hover:scale-110"
          )}
          style={c.value ? { backgroundColor: c.value } : { backgroundColor: "#f2f3f5" }}
          title={c.name}
        >
          {selected === c.value && <Check size={12} className="text-white" />}
        </button>
      ))}
    </div>
  );

  // 递归渲染标签树
  const renderTagNode = (tag: TagNode, level: number = 0): JSX.Element => {
    const hasChildren = tag.children && tag.children.length > 0;
    const isExpanded = expandedTags[tag.id];
    const isInlineCreating = inlineCreate.parentId === tag.id;

    return (
      <div key={tag.id}>
        <div
          className="group flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-[#f2f3f5] transition-colors cursor-pointer"
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onContextMenu={(e) => {
            e.preventDefault();
            setContextMenu({ x: e.clientX, y: e.clientY, tagId: tag.id });
          }}
        >
          {/* 展开/折叠 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) toggleExpand(tag.id);
            }}
            className="w-4 h-4 flex items-center justify-center text-muted hover:text-ink flex-shrink-0"
          >
            {hasChildren ? (
              isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
            ) : (
              <span className="w-3" />
            )}
          </button>

          {/* 图标 */}
          {renderTagIcon(tag)}

          {/* 名称 - 点击即可编辑 */}
          {inlineEdit?.tagId === tag.id ? (
            <input
              type="text"
              value={inlineEdit.name}
              onChange={(e) => setInlineEdit({ ...inlineEdit, name: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleInlineEditSave(tag.id);
                if (e.key === "Escape") setInlineEdit(null);
              }}
              onBlur={() => handleInlineEditSave(tag.id)}
              className="flex-1 px-2 py-0.5 text-sm border border-accent rounded outline-none focus:ring-1 focus:ring-accent bg-white min-w-0"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              className="flex-1 text-sm text-ink truncate cursor-text"
              onClick={(e) => {
                e.stopPropagation();
                setInlineEdit({ tagId: tag.id, name: tag.name });
              }}
              title="点击编辑名称"
            >
              {tag.name}
            </span>
          )}

          {/* 数量 */}
          {tag.count > 0 && (
            <span className="text-xs text-muted bg-[#f2f3f5] px-1.5 py-0.5 rounded">
              {tag.count}
            </span>
          )}

          {/* hover 操作按钮 - 语雀风格 */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setInlineCreate({
                  parentId: tag.id,
                  name: "",
                  color: null,
                });
                setExpandedTags((prev) => ({ ...prev, [tag.id]: true }));
              }}
              className="p-1 hover:bg-white rounded text-muted hover:text-accent transition-colors"
              title="添加子标签"
            >
              <Plus size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditModal({
                  show: true,
                  tagId: tag.id,
                  name: tag.name,
                  color: tag.color,
                  parentId: null,
                  isNew: false,
                });
              }}
              className="p-1 hover:bg-white rounded text-muted hover:text-ink transition-colors"
              title="编辑颜色/删除"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteTag(tag.id, tag.name, !!(tag.children && tag.children.length > 0));
              }}
              className="p-1 hover:bg-white rounded text-muted hover:text-red-500 transition-colors"
              title="删除"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* 内联创建子标签 */}
        {isInlineCreating && (
          <div
            className="flex items-center gap-2 px-2 py-1.5 bg-accent-soft/40 rounded-md mx-2"
            style={{ marginLeft: `${level * 20 + 28}px` }}
          >
            <Hash size={14} className="text-muted" />
            <input
              ref={inputRef}
              type="text"
              value={inlineCreate.name}
              onChange={(e) => setInlineCreate({ ...inlineCreate, name: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleInlineCreate(tag.id);
                if (e.key === "Escape")
                  setInlineCreate({ parentId: null, name: "", color: null });
              }}
              placeholder="输入子标签名称..."
              className="flex-1 px-2 py-1 text-sm border border-accent/30 rounded outline-none focus:ring-1 focus:ring-accent bg-white"
              autoFocus
            />
            <ColorPicker
              selected={inlineCreate.color}
              onSelect={(c) => setInlineCreate({ ...inlineCreate, color: c })}
            />
            <button
              onClick={() => handleInlineCreate(tag.id)}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-accent text-white rounded hover:bg-accent-2 transition-colors"
            >
              <Check size={12} /> 添加
            </button>
            <button
              onClick={() => setInlineCreate({ parentId: null, name: "", color: null })}
              className="p-1 hover:bg-white rounded text-muted"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* 递归子标签 */}
        {hasChildren && isExpanded && (
          <div>
            {tag.children!.map((child) => renderTagNode(child, level + 1))}
            {/* 底部添加按钮 */}
            <div
              className="flex items-center gap-1.5 px-2 py-1"
              style={{ paddingLeft: `${(level + 1) * 20 + 8}px` }}
            >
              <button
                onClick={() =>
                  setInlineCreate({
                    parentId: tag.id,
                    name: "",
                    color: null,
                  })
                }
                className="flex items-center gap-1 text-xs text-muted hover:text-accent transition-colors py-1"
              >
                <Plus size={12} />
                <span>添加子标签</span>
              </button>
            </div>
          </div>
        )}

        {/* 无子标签时也显示添加按钮 */}
        {!hasChildren && isExpanded && (
          <div
            className="flex items-center gap-1.5 px-2 py-1"
            style={{ paddingLeft: `${(level + 1) * 20 + 8}px` }}
          >
            <button
              onClick={() =>
                setInlineCreate({
                  parentId: tag.id,
                  name: "",
                  color: null,
                })
              }
              className="flex items-center gap-1 text-xs text-muted hover:text-accent transition-colors py-1"
            >
              <Plus size={12} />
              <span>添加子标签</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  // 统计
  const countTags = (nodes: TagNode[]): number => {
    let count = 0;
    for (const t of nodes) {
      count += 1;
      if (t.children) count += countTags(t.children);
    }
    return count;
  };

  const totalAllTags = countTags(tags);

  // 找到 contextMenu 对应的 tag
  const findTag = (nodes: TagNode[], id: string): TagNode | null => {
    for (const t of nodes) {
      if (t.id === id) return t;
      if (t.children) {
        const found = findTag(t.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const contextTag = contextMenu ? findTag(tags, contextMenu.tagId) : null;

  return (
    <div className="flex-1 overflow-y-auto bg-bg" onClick={() => setContextMenu(null)}>
      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TagIcon size={22} className="text-accent" />
            <h1 className="text-xl font-semibold text-ink">标签管理</h1>
            <span className="text-sm text-muted">{totalAllTags} 个标签</span>
          </div>
          <button
            onClick={() =>
              setEditModal({
                show: true,
                tagId: null,
                name: "",
                color: null,
                parentId: null,
                isNew: true,
              })
            }
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-accent text-white rounded-lg hover:bg-accent-2 transition-colors"
          >
            <Plus size={16} />
            <span>新建标签</span>
          </button>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-600">
            <AlertCircle size={16} />
            <span className="flex-1">{error}</span>
            <button
              onClick={() => loadTags()}
              className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-xs font-medium transition-colors"
            >
              重试
            </button>
            <button onClick={() => setError("")} className="p-0.5 hover:bg-red-100 rounded">
              <X size={14} />
            </button>
          </div>
        )}

        {/* 标签树 */}
        {loading ? (
          <div className="text-center py-12 text-muted text-sm">加载中...</div>
        ) : tags.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🏷️</div>
            <h3 className="text-lg font-medium text-ink mb-2">还没有标签</h3>
            <p className="text-sm text-muted mb-4">
              创建第一个标签来分类你的小记和文档
            </p>
            <button
              onClick={() =>
                setEditModal({
                  show: true,
                  tagId: null,
                  name: "",
                  color: null,
                  parentId: null,
                  isNew: true,
                })
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-accent text-white rounded-lg hover:bg-accent-2 transition-colors"
            >
              <Plus size={16} />
              创建标签
            </button>
          </div>
        ) : (
          <div className="bg-white border border-rule rounded-lg p-2 shadow-sm">
            {tags.map((tag) => renderTagNode(tag, 0))}

            {/* 底部添加根标签 */}
            <div className="flex items-center gap-1.5 px-2 py-1 mt-1 border-t border-rule pt-2">
              <button
                onClick={() =>
                  setInlineCreate({ parentId: null, name: "", color: null })
                }
                className="flex items-center gap-1 text-xs text-muted hover:text-accent transition-colors py-1"
              >
                <Plus size={12} />
                <span>添加标签</span>
              </button>
            </div>
          </div>
        )}

        {/* 顶级内联创建 */}
        {inlineCreate.parentId === null && tags.length > 0 && (
          <div className="mt-2 p-3 bg-white border border-accent/30 rounded-lg flex items-center gap-2">
            <Hash size={14} className="text-muted" />
            <input
              type="text"
              value={inlineCreate.name}
              onChange={(e) => setInlineCreate({ ...inlineCreate, name: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleInlineCreate(null);
                if (e.key === "Escape")
                  setInlineCreate({ parentId: null, name: "", color: null });
              }}
              placeholder="输入标签名称..."
              className="flex-1 px-2 py-1 text-sm border border-accent/30 rounded outline-none focus:ring-1 focus:ring-accent"
              autoFocus
            />
            <ColorPicker
              selected={inlineCreate.color}
              onSelect={(c) => setInlineCreate({ ...inlineCreate, color: c })}
            />
            <button
              onClick={() => handleInlineCreate(null)}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-accent text-white rounded hover:bg-accent-2"
            >
              <Check size={12} /> 添加
            </button>
            <button
              onClick={() => setInlineCreate({ parentId: null, name: "", color: null })}
              className="p-1 hover:bg-[#f2f3f5] rounded text-muted"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* 使用说明 */}
        {tags.length > 0 && (
          <div className="mt-6 p-4 bg-[#f8f9fa] border border-rule rounded-lg">
            <div className="text-xs text-muted leading-relaxed space-y-1">
              <div className="font-medium text-ink mb-1.5">使用说明</div>
              <div>· <strong>点击标签名</strong>直接编辑文字，回车保存，Esc取消</div>
              <div>· 鼠标悬停显示 <strong>+</strong>（加子标签）、<strong>编辑</strong>（改颜色）、<strong>删除</strong></div>
              <div>· 右键标签打开操作菜单</div>
              <div>· 每个层级底部都有「添加子标签」按钮</div>
              <div>· 删除父标签后，子标签自动变为顶级标签</div>
            </div>
          </div>
        )}
      </div>

      {/* 编辑/创建弹窗 */}
      {editModal.show && (
        <div
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center px-4"
          onClick={() => setEditModal({ ...editModal, show: false })}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-4">
              <TagIcon size={20} className="text-accent" />
              <h2 className="text-lg font-semibold text-ink">
                {editModal.isNew ? "新建标签" : "编辑标签"}
              </h2>
            </div>

            <div className="space-y-4">
              {/* 名称 */}
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  标签名称
                </label>
                <input
                  type="text"
                  value={editModal.name}
                  onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleModalSave();
                    if (e.key === "Escape")
                      setEditModal({ ...editModal, show: false });
                  }}
                  placeholder="输入标签名称..."
                  className="w-full px-3 py-2 text-sm border border-rule rounded-lg outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                  autoFocus
                />
              </div>

              {/* 颜色 */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-ink mb-2">
                  <Palette size={14} />
                  标签颜色
                </label>
                <ColorPicker
                  selected={editModal.color}
                  onSelect={(c) => setEditModal({ ...editModal, color: c })}
                />
              </div>

              {/* 预览 */}
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  预览
                </label>
                <div className="flex items-center gap-2 p-3 bg-[#f8f9fa] rounded-lg">
                  {renderTagIcon({
                    id: "",
                    name: editModal.name || "标签预览",
                    color: editModal.color,
                    sortOrder: 0,
                    count: 0,
                  })}
                  <span className="text-sm text-ink">
                    {editModal.name || "标签预览"}
                  </span>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center justify-between pt-2">
                {/* 删除按钮（仅编辑模式） */}
                {!editModal.isNew && editModal.tagId ? (
                  <button
                    onClick={() => {
                      const tag = findTag(tags, editModal.tagId!);
                      if (tag) {
                        deleteTag(tag.id, tag.name, !!(tag.children && tag.children.length > 0));
                        setEditModal({ ...editModal, show: false });
                      }
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                    删除标签
                  </button>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditModal({ ...editModal, show: false })}
                    className="px-3 py-1.5 text-sm text-muted hover:bg-[#f2f3f5] rounded-lg transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleModalSave}
                    disabled={!editModal.name.trim()}
                    className={clsx(
                      "flex items-center gap-1 px-4 py-1.5 text-sm rounded-lg transition-colors",
                      editModal.name.trim()
                        ? "bg-accent text-white hover:bg-accent-2"
                        : "bg-[#f2f3f5] text-muted cursor-not-allowed"
                    )}
                  >
                    <Check size={14} />
                    {editModal.isNew ? "创建" : "保存"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 右键菜单 */}
      {contextMenu && contextTag && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-xl border border-rule py-1 min-w-[160px]"
          style={{
            left: Math.min(contextMenu.x, window.innerWidth - 180),
            top: Math.min(contextMenu.y, window.innerHeight - 200),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setInlineCreate({
                parentId: contextTag.id,
                name: "",
                color: null,
              });
              setExpandedTags((prev) => ({ ...prev, [contextTag.id]: true }));
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-[#f2f3f5] transition-colors text-left"
          >
            <Plus size={14} />
            添加子标签
          </button>
          <button
            onClick={() => {
              setEditModal({
                show: true,
                tagId: contextTag.id,
                name: contextTag.name,
                color: contextTag.color,
                parentId: null,
                isNew: false,
              });
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-[#f2f3f5] transition-colors text-left"
          >
            <Edit3 size={14} />
            编辑标签
          </button>
          <div className="h-px bg-rule my-1" />
          <button
            onClick={() => {
              deleteTag(
                contextTag.id,
                contextTag.name,
                !!(contextTag.children && contextTag.children.length > 0)
              );
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors text-left"
          >
            <Trash2 size={14} />
            删除标签
          </button>
        </div>
      )}
    </div>
  );
}
