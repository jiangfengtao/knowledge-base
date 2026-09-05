"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Node as TiptapNode, mergeAttributes } from "@tiptap/core";
import { useEffect, useState, useRef } from "react";
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
} from "lucide-react";

// 自定义视频节点扩展
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
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-accent-deep underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-md",
        },
      }),
      VideoExtension,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      onChange?.(html, text);
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // 点击外部关闭更多菜单
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

  // 常用工具栏按钮（移动端底部 + 桌面端顶部都显示）
  const commonTools = (
    <>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        label={<Bold size={18} />}
        title="加粗"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        label={<Italic size={18} />}
        title="斜体"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        label={<Heading2 size={18} />}
        title="标题"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        label={<List size={18} />}
        title="无序列表"
      />
      <ToolbarButton
        onClick={() => {
          const url = window.prompt("输入链接地址");
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        active={editor.isActive("link")}
        label={<LinkIcon size={18} />}
        title="链接"
      />
      <ToolbarButton
        onClick={() => {
          const url = window.prompt("输入图片地址");
          if (url) {
            editor.chain().focus().setImage({ src: url }).run();
          }
        }}
        label={<ImageIcon size={18} />}
        title="图片"
      />
      <ToolbarButton
        onClick={() => {
          const url = window.prompt("输入视频地址（mp4 等）");
          if (url) {
            (editor.chain().focus() as any).setVideo({ src: url }).run();
          }
        }}
        label={<VideoIcon size={18} />}
        title="视频"
      />
    </>
  );

  // 更多工具（桌面端直接显示，移动端收起到更多菜单）
  const moreTools = (
    <>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
        label={<Heading1 size={18} />}
        title="标题1"
      />
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        label={<Heading3 size={18} />}
        title="标题3"
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
        <div className="hidden md:flex items-center gap-1 pb-3 border-b border-rule mb-4 flex-wrap">
          {commonTools}
          <div className="w-px h-5 bg-rule mx-1" />
          {moreTools}
          <div className="w-px h-5 bg-rule mx-1" />
          <AIToolbar editor={editor} docTitle={docTitle} />
        </div>
      )}

      {/* 编辑器内容 */}
      <EditorContent editor={editor} className="min-h-[400px] md:min-h-[500px]" />

      {/* 移动端底部浮动工具栏 */}
      {editable && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-rule shadow-lg">
          <div className="flex items-center justify-around px-2 py-2">
            {commonTools}
            {/* 更多按钮 */}
            <div className="relative" ref={moreMenuRef}>
              <ToolbarButton
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                active={showMoreMenu}
                label={<MoreHorizontal size={18} />}
                title="更多"
              />
              {/* 更多菜单弹出 */}
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
          {/* 底部安全区域 */}
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
