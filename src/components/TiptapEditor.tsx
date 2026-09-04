"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useEffect } from "react";
import dynamic from "next/dynamic";

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

  if (!editor) {
    return null;
  }

  return (
    <div className="editor-wrapper">
      {/* 工具栏 */}
      {editable && (
        <div className="flex items-center gap-1 pb-3 border-b border-rule mb-4 flex-wrap">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive("heading", { level: 1 })}
            label="H1"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive("heading", { level: 2 })}
            label="H2"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive("heading", { level: 3 })}
            label="H3"
          />
          <div className="w-px h-5 bg-rule mx-1" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive("bold")}
            label="B"
            bold
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive("italic")}
            label="I"
            italic
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive("strike")}
            label="S"
            strike
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive("code")}
            label="</>"
          />
          <div className="w-px h-5 bg-rule mx-1" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive("bulletList")}
            label="• 列表"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive("orderedList")}
            label="1. 列表"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive("blockquote")}
            label="引用"
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            label="分割线"
          />
          <div className="w-px h-5 bg-rule mx-1" />
          <ToolbarButton
            onClick={() => {
              const url = window.prompt("输入链接地址");
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            active={editor.isActive("link")}
            label="链接"
          />
          <ToolbarButton
            onClick={() => {
              const url = window.prompt("输入图片地址");
              if (url) {
                editor.chain().focus().setImage({ src: url }).run();
              }
            }}
            label="图片"
          />
          <div className="w-px h-5 bg-rule mx-1" />
          <AIToolbar editor={editor} docTitle={docTitle} />
        </div>
      )}

      {/* 编辑器内容 */}
      <EditorContent editor={editor} className="min-h-[400px]" />
    </div>
  );
}

function ToolbarButton({
  onClick,
  active,
  label,
  bold,
  italic,
  strike,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 text-sm rounded transition-colors ${
        active
          ? "bg-accent-soft text-accent-deep"
          : "text-ink hover:bg-[#f2f3f5]"
      } ${bold ? "font-bold" : ""} ${italic ? "italic" : ""} ${
        strike ? "line-through" : ""
      }`}
    >
      {label}
    </button>
  );
}
