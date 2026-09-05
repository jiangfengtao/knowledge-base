"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Node as TiptapNode, mergeAttributes } from "@tiptap/core";
import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  MoreHorizontal,
  Strikethrough,
  Code,
  Quote,
  Minus,
  Type,
  FileText,
  Pilcrow,
  Clock3,
} from "lucide-react";

// ==================== 自定义视频节点 ====================
const VideoExtension = TiptapNode.create({
  name: "video",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      poster: { default: null },
      controls: { default: true },
    };
  },

  parseHTML() {
    return [{ tag: "video" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["video", mergeAttributes(HTMLAttributes, { class: "w-full rounded-md" })];
  },

  addCommands() {
    return {
      setVideo:
        (options: { src: string; poster?: string }) =>
        ({ commands }: any) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              src: options.src,
              poster: options.poster || null,
            },
          });
        },
    } as any;
  },
});

// ==================== 斜杠命令菜单 ====================
type SlashMenuItem = {
  label: string;
  description: string;
  icon: React.ReactNode;
  action: (editor: Editor) => void;
  keywords: string[];
};

function getSlashMenuItems(): SlashMenuItem[] {
  return [
    {
      label: "标题1",
      description: "大标题",
      icon: <Heading1 size={18} />,
      keywords: ["h1", "标题1", "heading"],
      action: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      label: "标题2",
      description: "中标题",
      icon: <Heading2 size={18} />,
      keywords: ["h2", "标题2", "subheading"],
      action: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      label: "标题3",
      description: "小标题",
      icon: <Heading3 size={18} />,
      keywords: ["h3", "标题3", "small heading"],
      action: (editor: Editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      label: "正文",
      description: "普通段落文本",
      icon: <Pilcrow size={18} />,
      keywords: ["p", "paragraph", "正文", "段落"],
      action: (editor: Editor) => editor.chain().focus().setParagraph().run(),
    },
    {
      label: "无序列表",
      description: "圆点列表",
      icon: <List size={18} />,
      keywords: ["ul", "bullet", "无序列表", "列表"],
      action: (editor: Editor) => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "有序列表",
      description: "数字列表",
      icon: <ListOrdered size={18} />,
      keywords: ["ol", "number", "有序列表", "数字列表"],
      action: (editor: Editor) => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "引用",
      description: "引用块",
      icon: <Quote size={18} />,
      keywords: ["quote", "blockquote", "引用"],
      action: (editor: Editor) => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      label: "分割线",
      description: "水平分割线",
      icon: <Minus size={18} />,
      keywords: ["hr", "divider", "分割线"],
      action: (editor: Editor) => editor.chain().focus().setHorizontalRule().run(),
    },
    {
      label: "代码块",
      description: "代码片段",
      icon: <Code size={18} />,
      keywords: ["code", "代码", "代码块"],
      action: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      label: "图片",
      description: "插入图片",
      icon: <ImageIcon size={18} />,
      keywords: ["img", "image", "图片"],
      action: (editor: Editor) => {
        const url = window.prompt("输入图片地址");
        if (url) editor.chain().focus().setImage({ src: url }).run();
      },
    },
    {
      label: "视频",
      description: "插入视频",
      icon: <VideoIcon size={18} />,
      keywords: ["video", "视频"],
      action: (editor: Editor) => {
        const url = window.prompt("输入视频地址（mp4 等）");
        if (url) (editor.chain().focus() as any).setVideo({ src: url }).run();
      },
    },
    {
      label: "链接",
      description: "插入超链接",
      icon: <LinkIcon size={18} />,
      keywords: ["link", "href", "链接"],
      action: (editor: Editor) => {
        const url = window.prompt("输入链接地址");
        if (url) editor.chain().focus().setLink({ href: url }).run();
      },
    },
  ];
}

function SlashCommandMenu({
  editor,
  onClose,
}: {
  editor: Editor;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const items = getSlashMenuItems();
  const filtered = items.filter((item) => {
    if (!query) return true;
    return (
      item.label.includes(query) ||
      item.keywords.some((kw) => kw.includes(query.toLowerCase()))
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action(editor);
          onClose();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [filtered, selectedIndex, editor, onClose]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute z-50 w-72 bg-white border border-rule rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto"
      style={{ top: "100%", left: 0, marginTop: 4 }}
    >
      <div className="px-3 py-2 border-b border-rule bg-[#fafbfc]">
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="输入关键词筛选..."
          className="w-full text-sm outline-none bg-transparent text-ink placeholder:text-muted"
        />
      </div>
      <div className="py-1">
        {filtered.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-muted">
            没有找到匹配的命令
          </div>
        ) : (
          filtered.map((item, index) => (
            <button
              key={item.label}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => {
                item.action(editor);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                index === selectedIndex
                  ? "bg-accent-soft"
                  : "hover:bg-[#f9fafb]"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  index === selectedIndex
                    ? "bg-accent text-white"
                    : "bg-[#f2f3f5] text-muted"
                }`}
              >
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-ink">{item.label}</div>
                <div className="text-xs text-muted truncate">{item.description}</div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// ==================== 编辑器状态栏（字数统计） ====================
function EditorStatusBar({ editor }: { editor: Editor }) {
  const [stats, setStats] = useState({
    chars: 0,
    words: 0,
    readingTime: 0,
  });

  const updateStats = useCallback(() => {
    const text = editor.getText();
    const charCount = text.length;
    // 中英文混合计算字数：中文按字算，英文按单词算
    const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    const wordCount = chineseChars + englishWords;
    // 阅读速度：中文约 300字/分钟，英文约 200词/分钟
    const readingTime = Math.max(1, Math.ceil(wordCount / 300));
    setStats({ chars: charCount, words: wordCount, readingTime });
  }, [editor]);

  useEffect(() => {
    updateStats();
    editor.on("update", updateStats);
    editor.on("selectionUpdate", updateStats);
    return () => {
      editor.off("update", updateStats);
      editor.off("selectionUpdate", updateStats);
    };
  }, [editor, updateStats]);

  return (
    <div className="flex items-center justify-between px-1 py-1.5 text-xs text-muted border-t border-rule mt-2">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <FileText size={12} />
          <span>{stats.words} 字</span>
        </span>
        <span className="flex items-center gap-1">
          <Type size={12} />
          <span>{stats.chars} 字符</span>
        </span>
        <span className="flex items-center gap-1">
          <Clock3 size={12} />
          <span>约 {stats.readingTime} 分钟阅读</span>
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline">Markdown 已启用</span>
        <span className="text-accent-deep">/</span>
        <span>输入 / 唤起命令</span>
      </div>
    </div>
  );
}

const AIToolbar = dynamic(() => import("./AIToolbar"), {
  ssr: false,
  loading: () => null,
});

type TiptapEditorProps = {
  content?: string;
  placeholder?: string;
  onChange?: (html: string, text: string) => void;
  editable?: boolean;
  docTitle?: string;
};

export default function TiptapEditor({
  content = "",
  placeholder = "开始写作...",
  onChange,
  editable = true,
  docTitle = "",
}: TiptapEditorProps) {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: true,
      }),
      Placeholder.configure({ placeholder }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-accent-deep underline" },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-md" },
      }),
      VideoExtension,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      onChange?.(html, text);
      // 检测斜杠命令
      const { $from } = editor.state.selection;
      const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
      if (textBefore === "/" && !showSlashMenu) {
        setShowSlashMenu(true);
      } else if (textBefore.endsWith("/") && textBefore.length > 1) {
        // 输入文字/的时候继续显示
        setShowSlashMenu(true);
      } else if (!textBefore.includes("/") && showSlashMenu) {
        setShowSlashMenu(false);
      }
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    if (showMoreMenu) {
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }
  }, [showMoreMenu]);

  if (!editor) {
    return null;
  }

  // 常用工具栏按钮
  const commonTools = (
    <>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        label={<Bold size={18} />}
        title="加粗 ⌘B"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        label={<Italic size={18} />}
        title="斜体 ⌘I"
      />
      <div className="w-px h-5 bg-rule mx-0.5" />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        label={<Heading2 size={18} />}
        title="标题2"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        label={<Heading3 size={18} />}
        title="标题3"
      />
      <div className="w-px h-5 bg-rule mx-0.5" />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        label={<List size={18} />}
        title="无序列表"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        label={<ListOrdered size={18} />}
        title="有序列表"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        label={<Quote size={18} />}
        title="引用"
      />
      <ToolbarButton
        onClick={() => {
          const url = window.prompt("输入链接地址");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
        active={editor.isActive("link")}
        label={<LinkIcon size={18} />}
        title="链接"
      />
      <ToolbarButton
        onClick={() => {
          const url = window.prompt("输入图片地址");
          if (url) editor.chain().focus().setImage({ src: url }).run();
        }}
        label={<ImageIcon size={18} />}
        title="图片"
      />
      <ToolbarButton
        onClick={() => {
          const url = window.prompt("输入视频地址（mp4 等）");
          if (url) (editor.chain().focus() as any).setVideo({ src: url }).run();
        }}
        label={<VideoIcon size={18} />}
        title="视频"
      />
    </>
  );

  // 更多工具
  const moreTools = (
    <>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
        label={<Heading1 size={18} />}
        title="标题1"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        label={<Strikethrough size={18} />}
        title="删除线"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        label={<Code size={18} />}
        title="行内代码"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        label={<Minus size={18} />}
        title="分割线"
      />
    </>
  );

  return (
    <div className="editor-wrapper relative">
      {/* 桌面端顶部工具栏 */}
      {editable && (
        <div className="hidden md:flex items-center gap-0.5 pb-3 border-b border-rule mb-4 flex-wrap sticky top-0 bg-white z-10">
          {commonTools}
          <div className="w-px h-5 bg-rule mx-0.5" />
          {moreTools}
          <div className="w-px h-5 bg-rule mx-0.5" />
          <AIToolbar editor={editor} docTitle={docTitle} />
        </div>
      )}

      {/* 编辑器内容 */}
      <div className="relative">
        <EditorContent editor={editor} className="min-h-[400px] md:min-h-[500px]" />
        {/* 斜杠命令菜单 */}
        {showSlashMenu && editor && (
          <div className="relative">
            <SlashCommandMenu editor={editor} onClose={() => setShowSlashMenu(false)} />
          </div>
        )}
      </div>

      {/* 编辑器底部状态栏 - 字数统计 */}
      {editable && (
        <div className="hidden md:block">
          <EditorStatusBar editor={editor} />
        </div>
      )}

      {/* 移动端底部浮动工具栏 */}
      {editable && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-rule shadow-lg">
          {/* 移动端字数统计 */}
          <div className="px-3 py-1 border-b border-rule bg-[#fafbfc]">
            <EditorStatusBar editor={editor} />
          </div>
          <div className="flex items-center justify-around px-2 py-2 overflow-x-auto">
            {commonTools}
            {/* 更多按钮 */}
            <div className="relative" ref={moreMenuRef}>
              <ToolbarButton
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                active={showMoreMenu}
                label={<MoreHorizontal size={18} />}
                title="更多"
              />
              {showMoreMenu && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white border border-rule rounded-xl shadow-xl p-2 flex flex-wrap gap-1 w-56 justify-center">
                  {moreTools}
                  <div className="w-full h-px bg-rule my-1" />
                  <div className="w-full">
                    <AIToolbar editor={editor} docTitle={docTitle} />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  label,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  label: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2.5 rounded-lg transition-colors flex items-center justify-center min-w-10 min-h-10 ${
        active
          ? "bg-accent-soft text-accent-deep"
          : "text-ink hover:bg-[#f2f3f5]"
      }`}
    >
      {label}
    </button>
  );
}
