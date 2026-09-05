"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  StickyNote,
  Search,
  Star,
  Tag,
  ChevronDown,
  ChevronRight,
  Plus,
  FileText,
  MessageCircle,
  Sparkles,
  LogOut,
  Folder,
  Edit3,
  Trash2,
  Check,
  Move,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import clsx from "clsx";

type DocItem = {
  id: string;
  title: string;
  isFavorite: boolean;
  visibility: string;
  wordCount: number;
};

type KnowledgeBase = {
  id: string;
  name: string;
  icon: string | null;
  categoryCode: string | null;
  parentId?: string | null;
  sortOrder?: number;
  children?: KnowledgeBase[];
  documents?: DocItem[];
  _count?: { documents: number };
};

type SidebarProps = {
  activeNav: string;
  onNavChange: (nav: string) => void;
  onKbSelect?: (kbId: string, kbName: string) => void;
};

// 图标选择器
const ICON_OPTIONS = ["📁", "📂", "📄", "📑", "📝", "💡", "🎯", "📚", "🔧", "💻", "🎨", "📊", "🏠", "🌱", "📌", "✍️", "🔍", "🚀", "⭐", "🔥"];

type DropPosition = "before" | "after" | "inside";

export default function Sidebar({ activeNav, onNavChange, onKbSelect }: SidebarProps) {
  const router = useRouter();
  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [expandedKbs, setExpandedKbs] = useState<Record<string, boolean>>({});
  const [activeKbId, setActiveKbId] = useState("");
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  // 读取折叠状态
  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar_collapsed", String(next));
  };

  // 行内编辑
  const [inlineEdit, setInlineEdit] = useState<{ id: string; name: string; type: "kb" | "doc" } | null>(null);

  // 右键菜单
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    kb: KnowledgeBase | null;
    doc: DocItem | null;
  } | null>(null);

  // 创建菜单
  const [createMenu, setCreateMenu] = useState<{
    parentId: string | null;
    show: boolean;
    x: number;
    y: number;
  } | null>(null);

  // 创建子知识库
  const [newKb, setNewKb] = useState<{ parentId: string | null; name: string; icon: string }>({
    parentId: null,
    name: "",
    icon: "📁",
  });
  const [showNewKbForm, setShowNewKbForm] = useState(false);

  // 图标编辑弹窗
  const [iconEdit, setIconEdit] = useState<{ kbId: string; icon: string; name: string } | null>(null);

  // 拖拽状态
  const [dragData, setDragData] = useState<
    | { kind: "kb"; kb: KnowledgeBase }
    | { kind: "doc"; doc: DocItem; kbId: string }
    | null
  >(null);
  const [dropTarget, setDropTarget] = useState<{
    id: string;
    position: DropPosition;
    kind: "kb" | "doc";
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // 读取用户信息
  useEffect(() => {
    try {
      const info = localStorage.getItem("user_info");
      if (info) {
        const user = JSON.parse(info);
        setUserName(user.name || "");
        setUserEmail(user.email || "");
      }
    } catch (e) {}
  }, []);

  const loadKnowledgeBases = useCallback(async () => {
    try {
      const token = localStorage.getItem("auth_token") || "";
      const res = await fetch("/api/knowledge-bases", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const kbs: KnowledgeBase[] = data.data || [];
      setKnowledgeBases(kbs);

      const initialExpanded: Record<string, boolean> = {};
      const expandAll = (nodes: KnowledgeBase[]) => {
        nodes.forEach((kb) => {
          if (kb.children && kb.children.length > 0) {
            initialExpanded[kb.id] = true;
            expandAll(kb.children);
          }
        });
      };
      expandAll(kbs);
      setExpandedKbs(initialExpanded);

      if (!activeKbId) {
        const kb02 = kbs.find((kb) => kb.categoryCode === "02");
        if (kb02?.children?.length) {
          const childId = kb02.children[0].id;
          setActiveKbId(childId);
          onKbSelect?.(childId, kb02.children[0].name);
        }
      }
    } catch (e) {
      console.error("Load KB error:", e);
    } finally {
      setLoading(false);
    }
  }, [activeKbId, onKbSelect]);

  useEffect(() => {
    loadKnowledgeBases();
  }, [loadKnowledgeBases]);

  // 点击外部关闭右键菜单
  useEffect(() => {
    const handler = () => {
      setContextMenu(null);
      setCreateMenu(null);
    };
    if (contextMenu || createMenu) {
      document.addEventListener("click", handler);
      return () => document.removeEventListener("click", handler);
    }
  }, [contextMenu, createMenu]);

  const toggleKb = (kbId: string) => {
    setExpandedKbs((prev) => ({ ...prev, [kbId]: !prev[kbId] }));
  };

  const handleSelectKb = (kbId: string, kbName: string) => {
    setActiveKbId(kbId);
    onKbSelect?.(kbId, kbName);
  };

  // 保存行内编辑
  const saveInlineEdit = async (id: string) => {
    if (!inlineEdit || !inlineEdit.name.trim()) {
      setInlineEdit(null);
      return;
    }
    if (inlineEdit.type === "kb") {
      const kb = findKb(knowledgeBases, id);
      if (kb && inlineEdit.name.trim() !== kb.name) {
        await fetch("/api/knowledge-bases", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, name: inlineEdit.name.trim() }),
        });
        loadKnowledgeBases();
      }
    } else if (inlineEdit.type === "doc") {
      await fetch(`/api/documents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: inlineEdit.name.trim() }),
      });
      loadKnowledgeBases();
    }
    setInlineEdit(null);
  };

  // 删除文档
  const deleteDoc = async (doc: DocItem) => {
    if (!confirm(`确定删除文档「${doc.title}」吗？`)) return;
    await fetch(`/api/documents/${doc.id}`, { method: "DELETE" });
    loadKnowledgeBases();
    setContextMenu(null);
  };

  // 创建知识库
  const createKb = async (name: string, icon: string, parentId: string | null) => {
    if (!name.trim()) return;
    await fetch("/api/knowledge-bases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, icon, parentId }),
    });
    if (parentId) setExpandedKbs((prev) => ({ ...prev, [parentId]: true }));
    loadKnowledgeBases();
    setNewKb({ parentId: null, name: "", icon: "📁" });
    setShowNewKbForm(false);
  };

  // 删除知识库
  const deleteKb = async (kb: KnowledgeBase) => {
    const hasChildren = kb.children && kb.children.length > 0;
    const msg = hasChildren
      ? `确定删除「${kb.name}」吗？\n该分类下的所有子分类和文档都会被删除，此操作不可撤销！`
      : `确定删除「${kb.name}」吗？`;
    if (!confirm(msg)) return;
    await fetch(`/api/knowledge-bases?id=${kb.id}`, { method: "DELETE" });
    if (activeKbId === kb.id) setActiveKbId("");
    loadKnowledgeBases();
    setContextMenu(null);
  };

  // 更新图标
  const updateIcon = async (id: string, icon: string, name: string) => {
    await fetch("/api/knowledge-bases", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, icon, name }),
    });
    loadKnowledgeBases();
    setIconEdit(null);
  };

  // === 拖拽辅助函数 ===

  // 递归查找
  const findKb = (nodes: KnowledgeBase[], id: string): KnowledgeBase | null => {
    for (const n of nodes) {
      if (n.id === id) return n;
      if (n.children) {
        const found = findKb(n.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // 查找父节点ID
  const findParentId = (nodes: KnowledgeBase[], id: string, parentId: string | null = null): string | null => {
    for (const n of nodes) {
      if (n.id === id) return parentId;
      if (n.children) {
        const found = findParentId(n.children, id, n.id);
        if (found !== undefined) return found;
      }
    }
    return undefined as any;
  };

  // 检查 descendantId 是否是 ancestorId 的后代
  const isDescendantOf = (ancestorId: string, descendantId: string): boolean => {
    const ancestor = findKb(knowledgeBases, ancestorId);
    if (!ancestor) return false;
    const check = (kb: KnowledgeBase): boolean => {
      if (kb.id === descendantId) return true;
      if (kb.children) return kb.children.some(check);
      return false;
    };
    return check(ancestor);
  };

  // 获取同级兄弟节点
  const getSiblings = (parentId: string | null): KnowledgeBase[] => {
    if (parentId === null) return knowledgeBases;
    const parent = findKb(knowledgeBases, parentId);
    return parent?.children || [];
  };

  // 计算拖放位置
  const calcDropPosition = (e: React.DragEvent, canContain: boolean): DropPosition => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const h = rect.height;
    if (canContain) {
      if (y < h * 0.3) return "before";
      if (y > h * 0.7) return "after";
      return "inside";
    } else {
      return y < h * 0.5 ? "before" : "after";
    }
  };

  // 处理知识库拖放
  const handleKbDrop = async (
    draggedKb: KnowledgeBase,
    targetKb: KnowledgeBase,
    position: DropPosition
  ) => {
    // 不能拖到自己
    if (draggedKb.id === targetKb.id) return;

    // 不能拖到自己的后代里
    if (position === "inside" && isDescendantOf(draggedKb.id, targetKb.id)) return;
    // before/after 也不能放在自己的后代旁边（会改变层级关系）
    if ((position === "before" || position === "after") && isDescendantOf(draggedKb.id, targetKb.id)) return;

    let newParentId: string | null;
    if (position === "inside") {
      newParentId = targetKb.id;
    } else {
      newParentId = findParentId(knowledgeBases, targetKb.id) ?? null;
    }

    // 获取目标层级的兄弟节点（排除被拖的节点）
    let siblings = getSiblings(newParentId).filter((k) => k.id !== draggedKb.id);

    // 插入到正确位置
    if (position === "before") {
      const idx = siblings.findIndex((k) => k.id === targetKb.id);
      if (idx >= 0) {
        siblings.splice(idx, 0, draggedKb);
      } else {
        siblings.push(draggedKb);
      }
    } else if (position === "after") {
      const idx = siblings.findIndex((k) => k.id === targetKb.id);
      if (idx >= 0) {
        siblings.splice(idx + 1, 0, draggedKb);
      } else {
        siblings.push(draggedKb);
      }
    } else {
      // inside - 放到末尾
      siblings.push(draggedKb);
    }

    // 分配新的 sortOrder
    const items = siblings.map((k, i) => ({
      id: k.id,
      sortOrder: i,
      parentId: newParentId,
    }));

    await fetch("/api/knowledge-bases", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });

    // 如果拖进了某个KB，展开它
    if (position === "inside") {
      setExpandedKbs((prev) => ({ ...prev, [targetKb.id]: true }));
    }

    loadKnowledgeBases();
  };

  // 处理文档拖放到知识库（移到该知识库）
  const handleDocDropOnKb = async (doc: DocItem, targetKb: KnowledgeBase, position: DropPosition) => {
    if (position !== "inside") {
      // before/after on a KB means we need to know which KB's doc list to modify
      // For simplicity, treat before/after on a KB that has no expanded docs as "move into"
      // Actually, let's handle this: if before/after, we move the doc to be a sibling doc
      // But docs are children of KBs, not of other docs. So before/after on a KB
      // means: move to the target KB's doc list, at the beginning (before) or end (after)
    }

    // Move doc to target KB
    const targetDocs = targetKb.documents || [];
    const otherDocs = targetDocs.filter((d) => d.id !== doc.id);

    let insertIdx: number;
    if (position === "before") {
      insertIdx = 0;
    } else {
      insertIdx = otherDocs.length;
    }
    otherDocs.splice(insertIdx, 0, doc);

    const items = otherDocs.map((d, i) => ({
      id: d.id,
      sortOrder: i,
      knowledgeBaseId: targetKb.id,
    }));

    await fetch("/api/documents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });

    setExpandedKbs((prev) => ({ ...prev, [targetKb.id]: true }));
    loadKnowledgeBases();
  };

  // 处理文档拖放到文档（重新排序）
  const handleDocDropOnDoc = async (
    draggedDoc: DocItem,
    draggedFromKbId: string,
    targetDoc: DocItem,
    targetKbId: string,
    position: DropPosition
  ) => {
    if (draggedDoc.id === targetDoc.id) return;

    // If same KB, just reorder
    if (draggedFromKbId === targetKbId) {
      const parent = findKb(knowledgeBases, targetKbId);
      const docs = (parent?.documents || []).filter((d) => d.id !== draggedDoc.id);

      const idx = docs.findIndex((d) => d.id === targetDoc.id);
      if (position === "before") {
        docs.splice(idx, 0, draggedDoc);
      } else {
        docs.splice(idx + 1, 0, draggedDoc);
      }

      const items = docs.map((d, i) => ({
        id: d.id,
        sortOrder: i,
        knowledgeBaseId: targetKbId,
      }));

      await fetch("/api/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
    } else {
      // Cross-KB move: remove from old, add to new
      const targetParent = findKb(knowledgeBases, targetKbId);
      const targetDocs = (targetParent?.documents || []).filter((d) => d.id !== draggedDoc.id);

      const idx = targetDocs.findIndex((d) => d.id === targetDoc.id);
      if (position === "before") {
        targetDocs.splice(idx, 0, draggedDoc);
      } else {
        targetDocs.splice(idx + 1, 0, draggedDoc);
      }

      const items = targetDocs.map((d, i) => ({
        id: d.id,
        sortOrder: i,
        knowledgeBaseId: targetKbId,
      }));

      await fetch("/api/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      setExpandedKbs((prev) => ({ ...prev, [targetKbId]: true }));
    }

    loadKnowledgeBases();
  };

  // 新建文档
  const createDoc = async (kbId: string, kbName: string) => {
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "无标题文档", knowledgeBaseId: kbId }),
    });
    const data = await res.json();
    if (data.data) {
      setExpandedKbs((prev) => ({ ...prev, [kbId]: true }));
      loadKnowledgeBases();
      handleSelectKb(kbId, kbName);
    }
    setContextMenu(null);
  };

  // 移动知识库到顶级（右键菜单用）
  const moveKbToTop = async (id: string) => {
    const topLevel = knowledgeBases.filter((k) => k.id !== id);
    const items = topLevel.map((k, i) => ({
      id: k.id,
      sortOrder: i,
      parentId: null as string | null,
    }));
    items.push({ id, sortOrder: topLevel.length, parentId: null });

    await fetch("/api/knowledge-bases", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    loadKnowledgeBases();
  };

  const navItems = [
    { id: "kb", label: "知识库", icon: <BookOpen size={18} /> },
    { id: "notes", label: "小记", icon: <StickyNote size={18} /> },
    { id: "tags", label: "标签", icon: <Tag size={18} /> },
    { id: "search", label: "搜索", icon: <Search size={18} /> },
    { id: "favorites", label: "收藏", icon: <Star size={18} /> },
  ];

  // 渲染创建菜单弹层
  const renderCreateMenu = () => {
    if (!createMenu?.show) return null;
    const parentKb = createMenu.parentId ? findKb(knowledgeBases, createMenu.parentId) : null;

    return (
      <div
        className="fixed z-50 bg-white rounded-lg shadow-xl border border-rule py-1 min-w-[180px]"
        style={{
          left: Math.min(createMenu.x ?? 0, window.innerWidth - 200),
          top: Math.min(createMenu.y ?? 0, window.innerHeight - 250),
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => {
            const kb = parentKb;
            if (kb) {
              createDoc(kb.id, kb.name);
            }
            setCreateMenu(null);
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-[#f2f3f5] text-left"
        >
          <FileText size={14} />
          新建文档
        </button>
        <button
          onClick={() => {
            setNewKb({ parentId: createMenu.parentId, name: "", icon: "📁" });
            setShowNewKbForm(true);
            setCreateMenu(null);
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-[#f2f3f5] text-left"
        >
          <Folder size={14} />
          新建子分类
        </button>
      </div>
    );
  };

  // 递归渲染树节点
  const renderNode = (kb: KnowledgeBase, level: number = 0): JSX.Element => {
    const hasChildren = kb.children && kb.children.length > 0;
    const hasDocs = kb.documents && kb.documents.length > 0;
    const isExpanded = expandedKbs[kb.id];
    const isActive = activeKbId === kb.id;
    const isEditing = inlineEdit?.id === kb.id && inlineEdit.type === "kb";
    const docCount = kb._count?.documents || 0;

    // 拖拽相关
    const isDragOver = dropTarget?.id === kb.id && dropTarget.kind === "kb";
    const dropPos = isDragOver ? dropTarget!.position : null;
    const canContainChildren = true; // 所有KB都可以包含子项

    return (
      <div key={kb.id}>
        {/* before 指示线 */}
        {isDragOver && dropPos === "before" && (
          <div className="h-0.5 mx-2 bg-accent rounded-full" style={{ marginLeft: `${level * 16 + 8}px` }} />
        )}

        <div
          className={clsx(
            "group flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors cursor-pointer relative",
            isActive
              ? "bg-accent-soft text-accent-deep"
              : "text-ink hover:bg-[#f2f3f5]",
            isDragOver && dropPos === "inside" && "ring-2 ring-accent ring-inset bg-accent-soft",
            isDragOver && (dropPos === "before" || dropPos === "after") && "bg-[#f8f9fa]"
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          draggable
          onDragStart={(e) => {
            setDragData({ kind: "kb", kb });
            setIsDragging(true);
            e.dataTransfer.effectAllowed = "move";
            // 设置半透明拖拽预览
            e.dataTransfer.setData("text/plain", kb.id);
          }}
          onDragEnd={() => {
            setDragData(null);
            setDropTarget(null);
            setIsDragging(false);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (dragData && (dragData.kind === "kb" || dragData.kind === "doc")) {
              // 不能拖到自己身上
              if (dragData.kind === "kb" && dragData.kb.id === kb.id) return;
              const pos = calcDropPosition(e, canContainChildren);
              setDropTarget({ id: kb.id, position: pos, kind: "kb" });
            }
          }}
          onDragLeave={(e) => {
            // 只有真正离开元素才清除
            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
            const x = e.clientX;
            const y = e.clientY;
            if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
              setDropTarget((prev) => (prev?.id === kb.id ? null : prev));
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!dragData) return;

            const pos = calcDropPosition(e, canContainChildren);

            if (dragData.kind === "kb") {
              handleKbDrop(dragData.kb, kb, pos);
            } else if (dragData.kind === "doc") {
              handleDocDropOnKb(dragData.doc, kb, pos);
            }

            setDragData(null);
            setDropTarget(null);
            setIsDragging(false);
          }}
          onClick={() => {
            if (hasChildren || hasDocs) toggleKb(kb.id);
            handleSelectKb(kb.id, kb.name);
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setContextMenu({ x: e.clientX, y: e.clientY, kb, doc: null });
          }}
        >
          {/* 展开/折叠 */}
          <span className="w-4 flex items-center justify-center text-muted flex-shrink-0">
            {hasChildren || hasDocs ? (
              isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
            ) : (
              <span className="w-3" />
            )}
          </span>

          {/* 图标 */}
          <span className="text-sm flex-shrink-0" title="右键修改图标">
            {kb.icon || "📁"}
          </span>

          {/* 名称 */}
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={inlineEdit!.name}
              onChange={(e) => setInlineEdit({ ...inlineEdit!, name: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveInlineEdit(kb.id);
                if (e.key === "Escape") setInlineEdit(null);
              }}
              onBlur={() => saveInlineEdit(kb.id)}
              className="flex-1 px-1.5 py-0.5 text-sm border border-accent rounded outline-none focus:ring-1 focus:ring-accent bg-white min-w-0"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              className="flex-1 text-sm truncate"
              onDoubleClick={(e) => {
                e.stopPropagation();
                setInlineEdit({ id: kb.id, name: kb.name, type: "kb" });
              }}
              title="双击重命名"
            >
              {kb.name}
            </span>
          )}

          {/* 文档数量 */}
          {docCount > 0 && !isExpanded && (
            <span className="text-xs text-muted flex-shrink-0">{docCount}</span>
          )}

          {/* hover 操作 */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setContextMenu({ x: e.clientX, y: e.clientY, kb, doc: null });
              }}
              className="p-1 hover:bg-white rounded text-muted hover:text-ink"
              title="操作"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>

        {/* after 指示线（紧跟在节点行后面） */}
        {isDragOver && dropPos === "after" && !isExpanded && (
          <div className="h-0.5 mx-2 bg-accent rounded-full" style={{ marginLeft: `${level * 16 + 8}px` }} />
        )}

        {/* 子分类 */}
        {hasChildren && isExpanded && (
          <div>
            {kb.children!.map((child) => renderNode(child, level + 1))}
          </div>
        )}

        {/* 文档列表 */}
        {isExpanded && kb.documents && kb.documents.length > 0 && (
          <div>
            {/* 如果拖到 after 位置且节点是展开的，指示线放在文档列表前 */}
            {isDragOver && dropPos === "after" && isExpanded && (
              <div className="h-0.5 mx-2 bg-accent rounded-full" style={{ marginLeft: `${(level + 1) * 16 + 24}px` }} />
            )}
            {kb.documents.map((doc) => {
              const isDocEditing = inlineEdit?.id === doc.id && inlineEdit.type === "doc";
              const isDocDragOver = dropTarget?.id === doc.id && dropTarget.kind === "doc";
              const docDropPos = isDocDragOver ? dropTarget!.position : null;

              return (
                <div key={doc.id}>
                  {/* before 指示线 */}
                  {isDocDragOver && docDropPos === "before" && (
                    <div className="h-0.5 mx-2 bg-accent rounded-full" style={{ marginLeft: `${(level + 1) * 16 + 24}px` }} />
                  )}
                  <div
                    className={clsx(
                      "group flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors cursor-pointer",
                      isDocDragOver
                        ? "bg-[#f8f9fa]"
                        : "hover:bg-[#f2f3f5]"
                    )}
                    style={{ paddingLeft: `${(level + 1) * 16 + 24}px` }}
                    draggable
                    onDragStart={(e) => {
                      setDragData({ kind: "doc", doc, kbId: kb.id });
                      setIsDragging(true);
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", doc.id);
                    }}
                    onDragEnd={() => {
                      setDragData(null);
                      setDropTarget(null);
                      setIsDragging(false);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (dragData) {
                        if (dragData.kind === "doc" && dragData.doc.id === doc.id) return;
                        const pos = calcDropPosition(e, false);
                        setDropTarget({ id: doc.id, position: pos, kind: "doc" });
                      }
                    }}
                    onDragLeave={(e) => {
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      const x = e.clientX;
                      const y = e.clientY;
                      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                        setDropTarget((prev) => (prev?.id === doc.id ? null : prev));
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (!dragData) return;

                      const pos = calcDropPosition(e, false);

                      if (dragData.kind === "doc") {
                        handleDocDropOnDoc(dragData.doc, dragData.kbId, doc, kb.id, pos);
                      } else if (dragData.kind === "kb") {
                        // 拖KB到文档上 = 把KB放到该文档所属的KB的子级
                        // 这种情况较少，暂不处理
                      }

                      setDragData(null);
                      setDropTarget(null);
                      setIsDragging(false);
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setContextMenu({ x: e.clientX, y: e.clientY, kb: null, doc });
                    }}
                    onClick={() => handleSelectKb(kb.id, kb.name)}
                  >
                    <FileText size={13} className={clsx("flex-shrink-0", doc.visibility === "public" ? "text-green-500" : doc.visibility === "members" ? "text-amber-500" : "text-muted")} />
                    {isDocEditing ? (
                      <input
                        type="text"
                        value={inlineEdit!.name}
                        onChange={(e) => setInlineEdit({ ...inlineEdit!, name: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveInlineEdit(doc.id);
                          if (e.key === "Escape") setInlineEdit(null);
                        }}
                        onBlur={() => saveInlineEdit(doc.id)}
                        className="flex-1 px-1.5 py-0.5 text-sm border border-accent rounded outline-none focus:ring-1 focus:ring-accent bg-white min-w-0"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span
                        className="flex-1 text-sm truncate"
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setInlineEdit({ id: doc.id, name: doc.title, type: "doc" });
                        }}
                        title="双击重命名"
                      >
                        {doc.title}
                      </span>
                    )}
                    {doc.isFavorite && <Star size={11} className="text-yellow-400 flex-shrink-0" fill="currentColor" />}
                    {doc.visibility !== "private" && (
                      <span className="text-[10px] text-green-500 flex-shrink-0">
                        {doc.visibility === "public" ? "公开" : "会员"}
                      </span>
                    )}
                  </div>
                  {/* after 指示线 */}
                  {isDocDragOver && docDropPos === "after" && (
                    <div className="h-0.5 mx-2 bg-accent rounded-full" style={{ marginLeft: `${(level + 1) * 16 + 24}px` }} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 如果拖到 after 位置且节点有展开的子内容，指示线放在子内容后面 */}
        {isDragOver && dropPos === "after" && isExpanded && !(hasChildren || hasDocs) && (
          <div className="h-0.5 mx-2 bg-accent rounded-full" style={{ marginLeft: `${level * 16 + 8}px` }} />
        )}

        {/* 添加子分类按钮 */}
        {isExpanded && (hasChildren || hasDocs || !hasChildren) && (
          <div style={{ paddingLeft: `${(level + 1) * 16 + 24}px` }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setContextMenu({ x: e.clientX, y: e.clientY, kb, doc: null });
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs text-muted hover:text-accent transition-colors"
            >
              <Plus size={12} />
              <span>添加</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  const sidebarContent = (
    <>
      {/* Logo 区 */}
      <div className="px-4 py-3 flex items-center gap-2 border-b border-rule">
        <div className="w-7 h-7 rounded bg-accent flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          桃
        </div>
        <span className="font-semibold text-ink flex-1">晓桃终生成长</span>
        <button
          onClick={toggleCollapse}
          className="p-1.5 hover:bg-[#f2f3f5] rounded transition-colors flex-shrink-0"
          title="收起侧边栏"
        >
          <PanelLeftClose size={16} className="text-muted" />
        </button>
      </div>

      {/* 搜索框 */}
      <div className="p-3">
        <div
          className="relative cursor-pointer"
          onClick={() => {
            onNavChange("search");
          }}
        >
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="搜索..."
            readOnly
            className="w-full pl-8 pr-3 py-1.5 bg-[#f2f3f5] rounded text-sm outline-none focus:bg-white focus:ring-1 focus:ring-accent transition-all cursor-pointer"
          />
        </div>
      </div>

      {/* 主导航 */}
      <nav className="px-2 pb-2">
        {navItems.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              onNavChange(item.id);
            }}
            className={clsx(
              "flex items-center gap-2 px-3 py-2 rounded cursor-pointer text-sm transition-colors",
              activeNav === item.id
                ? "bg-accent-soft text-accent-deep font-medium"
                : "text-ink hover:bg-[#f2f3f5]"
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      {/* 分割线 */}
      <div className="h-px bg-rule mx-3" />

      {/* 知识库树 */}
      <div
        className="flex-1 overflow-y-auto py-2 px-2"
        // 顶级区域作为拖放目标（拖到空白处 = 移到顶级）
        onDragOver={(e) => {
          if (dragData?.kind === "kb") {
            // 只有拖到底部空白处才处理
            const rect = e.currentTarget.getBoundingClientRect();
            if (e.clientY > rect.bottom - 40) {
              e.preventDefault();
              setDropTarget({ id: "__root__", position: "after", kind: "kb" });
            }
          }
        }}
        onDrop={(e) => {
          if (dragData?.kind === "kb" && dropTarget?.id === "__root__") {
            e.preventDefault();
            // 移到顶级末尾
            const topLevel = knowledgeBases.filter((k) => k.id !== dragData.kb.id);
            topLevel.push(dragData.kb);
            const items = topLevel.map((k, i) => ({
              id: k.id,
              sortOrder: i,
              parentId: null as string | null,
            }));
            fetch("/api/knowledge-bases", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ items }),
            }).then(() => loadKnowledgeBases());
            setDragData(null);
            setDropTarget(null);
            setIsDragging(false);
          }
        }}
      >
        <div className="flex items-center justify-between px-2 py-1.5 text-xs text-muted font-medium">
          <span>知识库</span>
          <button
            onClick={() => {
              setNewKb({ parentId: null, name: "", icon: "📁" });
              setShowNewKbForm(true);
            }}
            className="p-1 hover:bg-[#f2f3f5] rounded transition-colors hover:text-accent"
            title="新建知识库"
          >
            <Plus size={14} />
          </button>
        </div>

        {loading ? (
          <div className="px-2 py-4 text-center text-xs text-muted">加载中...</div>
        ) : (
          knowledgeBases.map((kb) => renderNode(kb, 0))
        )}

        {/* 底部添加根分类 */}
        {knowledgeBases.length > 0 && (
          <div className="mt-1 pt-2 border-t border-rule">
            <button
              onClick={() => {
                setNewKb({ parentId: null, name: "", icon: "📁" });
                setShowNewKbForm(true);
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs text-muted hover:text-accent transition-colors"
            >
              <Plus size={12} />
              <span>添加分类</span>
            </button>
          </div>
        )}

        {/* 拖到底部指示线 */}
        {dropTarget?.id === "__root__" && (
          <div className="h-0.5 mx-2 bg-accent rounded-full" />
        )}
      </div>

      {/* 底部用户区 */}
      <div className="border-t border-rule p-3">
        <div className="flex items-center gap-2 px-1">
          <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center text-sm font-medium text-accent">
            {userName ? userName.charAt(0) : "我"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{userName || "我的账号"}</div>
            <div className="text-xs text-muted truncate">{userEmail || "已同步"}</div>
          </div>
          <button
            onClick={() => router.push("/wechat-setup")}
            className="p-1.5 hover:bg-[#f2f3f5] rounded transition-colors"
            title="微信接入"
          >
            <MessageCircle size={16} className="text-muted" />
          </button>
          <button
            onClick={() => router.push("/ai-settings")}
            className="p-1.5 hover:bg-[#f2f3f5] rounded transition-colors"
            title="AI 设置"
          >
            <Sparkles size={16} className="text-muted" />
          </button>
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              localStorage.removeItem("auth_token");
              localStorage.removeItem("user_info");
              router.push("/login");
            }}
            className="p-1.5 hover:bg-red-50 rounded transition-colors group"
            title="退出登录"
          >
            <LogOut size={16} className="text-muted group-hover:text-red-500" />
          </button>
        </div>
      </div>
    </>
  );

  if (collapsed) {
    // 折叠状态：窄边栏，只显示展开按钮和图标
    return (
      <>
        <aside className="w-14 bg-white border-r border-rule flex flex-col flex-shrink-0 h-screen items-center py-3 gap-2">
          {/* Logo + 展开按钮 */}
          <button
            onClick={toggleCollapse}
            className="w-9 h-9 rounded bg-accent flex items-center justify-center text-white font-bold text-sm hover:bg-accent-2 transition-colors"
            title="展开侧边栏"
          >
            桃
          </button>

          <div className="h-px w-8 bg-rule" />

          {/* 导航图标 */}
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavChange(item.id)}
              className={clsx(
                "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                activeNav === item.id
                  ? "bg-accent-soft text-accent-deep"
                  : "text-ink hover:bg-[#f2f3f5]"
              )}
              title={item.label}
            >
              {item.icon}
            </button>
          ))}

          {/* 底部用户区 */}
          <div className="mt-auto flex flex-col items-center gap-2">
            <button
              onClick={() => onNavChange("search")}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-muted hover:bg-[#f2f3f5] hover:text-accent transition-colors"
              title="搜索"
            >
              <Search size={18} />
            </button>
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                localStorage.removeItem("auth_token");
                localStorage.removeItem("user_info");
                router.push("/login");
              }}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-muted hover:bg-red-50 hover:text-red-500 transition-colors"
              title="退出登录"
            >
              <LogOut size={16} />
            </button>
            <button
              onClick={toggleCollapse}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-muted hover:bg-[#f2f3f5] hover:text-accent transition-colors"
              title="展开侧边栏"
            >
              <PanelLeftOpen size={18} />
            </button>
          </div>
        </aside>

        {/* 弹窗等仍然渲染 */}
        {showNewKbForm && null}
        {iconEdit && null}
        {contextMenu && null}
        {createMenu && null}
      </>
    );
  }

  return (
    <>
      {/* 侧边栏 - 展开状态 */}
      <aside
        className="w-64 bg-white border-r border-rule flex flex-col flex-shrink-0 h-screen transition-all duration-200"
      >
        {sidebarContent}
      </aside>

      {/* 新建分类弹窗 */}
      {showNewKbForm && (
        <div
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center px-4"
          onClick={() => setShowNewKbForm(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-ink mb-4">新建分类</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">分类名称</label>
                <input
                  type="text"
                  value={newKb.name}
                  onChange={(e) => setNewKb({ ...newKb, name: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") createKb(newKb.name, newKb.icon, newKb.parentId);
                    if (e.key === "Escape") setShowNewKbForm(false);
                  }}
                  placeholder="输入分类名称..."
                  className="w-full px-3 py-2 text-sm border border-rule rounded-lg outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-2">选择图标</label>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setNewKb({ ...newKb, icon })}
                      className={clsx(
                        "w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all",
                        newKb.icon === icon
                          ? "bg-accent-soft ring-2 ring-accent"
                          : "hover:bg-[#f2f3f5]"
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowNewKbForm(false)}
                  className="px-3 py-1.5 text-sm text-muted hover:bg-[#f2f3f5] rounded-lg"
                >
                  取消
                </button>
                <button
                  onClick={() => createKb(newKb.name, newKb.icon, newKb.parentId)}
                  disabled={!newKb.name.trim()}
                  className={clsx(
                    "flex items-center gap-1 px-4 py-1.5 text-sm rounded-lg transition-colors",
                    newKb.name.trim()
                      ? "bg-accent text-white hover:bg-accent-2"
                      : "bg-[#f2f3f5] text-muted cursor-not-allowed"
                  )}
                >
                  <Check size={14} />
                  创建
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 图标编辑弹窗 */}
      {iconEdit && (
        <div
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center px-4"
          onClick={() => setIconEdit(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-ink mb-4">
              编辑图标 - {iconEdit.name}
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {ICON_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setIconEdit({ ...iconEdit, icon })}
                  className={clsx(
                    "w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all",
                    iconEdit.icon === icon
                      ? "bg-accent-soft ring-2 ring-accent"
                      : "hover:bg-[#f2f3f5]"
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIconEdit(null)}
                className="px-3 py-1.5 text-sm text-muted hover:bg-[#f2f3f5] rounded-lg"
              >
                取消
              </button>
              <button
                onClick={() => updateIcon(iconEdit.kbId, iconEdit.icon, iconEdit.name)}
                className="flex items-center gap-1 px-4 py-1.5 text-sm bg-accent text-white rounded-lg hover:bg-accent-2"
              >
                <Check size={14} />
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 右键菜单 - 知识库 */}
      {contextMenu && contextMenu.kb && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-xl border border-rule py-1 min-w-[180px]"
          style={{
            left: Math.min(contextMenu.x, window.innerWidth - 200),
            top: Math.min(contextMenu.y, window.innerHeight - 300),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              createDoc(contextMenu.kb!.id, contextMenu.kb!.name);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-[#f2f3f5] text-left"
          >
            <FileText size={14} />
            新建文档
          </button>
          <button
            onClick={() => {
              setNewKb({ parentId: contextMenu.kb!.id, name: "", icon: "📁" });
              setShowNewKbForm(true);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-[#f2f3f5] text-left"
          >
            <Folder size={14} />
            新建子分类
          </button>
          <button
            onClick={() => {
              setIconEdit({
                kbId: contextMenu.kb!.id,
                icon: contextMenu.kb!.icon || "📁",
                name: contextMenu.kb!.name,
              });
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-[#f2f3f5] text-left"
          >
            <Edit3 size={14} />
            修改图标
          </button>
          <button
            onClick={() => {
              setInlineEdit({ id: contextMenu.kb!.id, name: contextMenu.kb!.name, type: "kb" });
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-[#f2f3f5] text-left"
          >
            <Edit3 size={14} />
            重命名
          </button>
          <div className="h-px bg-rule my-1" />
          <button
            onClick={() => {
              if (confirm("确定移到顶级分类吗？")) {
                moveKbToTop(contextMenu.kb!.id);
              }
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-[#f2f3f5] text-left"
          >
            <Move size={14} />
            移到顶级
          </button>
          <button
            onClick={() => deleteKb(contextMenu.kb!)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 text-left"
          >
            <Trash2 size={14} />
            删除
          </button>
        </div>
      )}

      {/* 右键菜单 - 文档 */}
      {contextMenu && contextMenu.doc && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-xl border border-rule py-1 min-w-[180px]"
          style={{
            left: Math.min(contextMenu.x, window.innerWidth - 200),
            top: Math.min(contextMenu.y, window.innerHeight - 200),
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              setInlineEdit({ id: contextMenu.doc!.id, name: contextMenu.doc!.title, type: "doc" });
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-[#f2f3f5] text-left"
          >
            <Edit3 size={14} />
            重命名
          </button>
          <button
            onClick={() => {
              // 切换收藏
              fetch(`/api/documents/${contextMenu.doc!.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isFavorite: !contextMenu.doc!.isFavorite }),
              }).then(() => loadKnowledgeBases());
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-[#f2f3f5] text-left"
          >
            <Star size={14} />
            {contextMenu.doc!.isFavorite ? "取消收藏" : "收藏"}
          </button>
          <button
            onClick={() => {
              // 切换公开/私密
              fetch(`/api/documents/${contextMenu.doc!.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ visibility: contextMenu.doc!.visibility === "private" ? "public" : "private" }),
              }).then(() => loadKnowledgeBases());
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-[#f2f3f5] text-left"
          >
            <FileText size={14} />
            {contextMenu.doc!.visibility === "private" ? "设为公开" : "设为私密"}
          </button>
          <div className="h-px bg-rule my-1" />
          <button
            onClick={() => deleteDoc(contextMenu.doc!)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 text-left"
          >
            <Trash2 size={14} />
            删除文档
          </button>
        </div>
      )}

      {/* 创建菜单 */}
      {renderCreateMenu()}
    </>
  );
}
