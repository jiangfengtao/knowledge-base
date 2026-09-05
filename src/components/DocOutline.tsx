"use client";

import { useState, useEffect, useMemo } from "react";
import { List, ChevronRight } from "lucide-react";

type Heading = {
  id: string;
  text: string;
  level: number; // 1, 2, 3
};

type DocOutlineProps = {
  content: string;
  /** 是否处于编辑模式（编辑模式下大纲仍然可用） */
  editable?: boolean;
};

export default function DocOutline({ content, editable }: DocOutlineProps) {
  const [activeId, setActiveId] = useState<string>("");

  // 从 HTML 内容中提取标题
  const headings = useMemo<Heading[]>(() => {
    if (!content) return [];
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, "text/html");
      const els = doc.querySelectorAll("h1, h2, h3");
      const result: Heading[] = [];
      els.forEach((el, idx) => {
        const level = el.tagName === "H1" ? 1 : el.tagName === "H2" ? 2 : 3;
        const text = el.textContent?.trim() || "";
        if (!text) return;
        // 使用已有的 id 或生成一个
        const id = el.id || `heading-${idx}`;
        el.id = id;
        result.push({ id, text, level });
      });
      return result;
    } catch {
      return [];
    }
  }, [content]);

  // 监听滚动，高亮当前章节
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      // 查找编辑器/预览容器内的标题元素
      const container = document.querySelector(".doc-content") || document.querySelector(".ProseMirror");
      if (!container) return;

      const headingEls = container.querySelectorAll("h1, h2, h3");
      if (headingEls.length === 0) return;

      let current = "";
      const scrollY = window.scrollY || document.documentElement.scrollTop;

      headingEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < 120) {
          current = el.id || "";
        }
      });

      if (current) setActiveId(current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // 初始触发一次
    setTimeout(handleScroll, 300);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings]);

  // 点击跳转到对应标题
  const handleClick = (heading: Heading) => {
    const container = document.querySelector(".doc-content") || document.querySelector(".ProseMirror");
    if (!container) return;

    // 尝试通过 id 查找，或通过文本内容查找
    let el = container.querySelector(`#${heading.id}`);
    if (!el) {
      // 通过文本内容匹配
      const allHeadings = container.querySelectorAll("h1, h2, h3");
      allHeadings.forEach((h) => {
        if (h.textContent?.trim() === heading.text) {
          el = h;
        }
      });
    }

    if (el) {
      const rect = el.getBoundingClientRect();
      const offset = rect.top + window.scrollY - 80;
      window.scrollTo({ top: offset, behavior: "smooth" });
    }
  };

  if (headings.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-3 border-b border-rule">
          <div className="flex items-center gap-1.5 text-sm font-medium text-ink">
            <List size={15} className="text-muted" />
            <span>大纲</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-xs text-muted text-center leading-relaxed">
            开始编写内容后<br />文档大纲会显示在这里
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-rule sticky top-0 bg-white z-10">
        <div className="flex items-center gap-1.5 text-sm font-medium text-ink">
          <List size={15} className="text-muted" />
          <span>大纲</span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {headings.map((heading, idx) => (
          <button
            key={idx}
            onClick={() => handleClick(heading)}
            className={`w-full text-left py-1.5 px-2 rounded text-xs transition-colors flex items-start gap-1 ${
              activeId === heading.id
                ? "bg-accent-soft text-accent-deep font-medium"
                : "text-muted hover:bg-[#f2f3f5] hover:text-ink"
            }`}
            style={{
              paddingLeft: `${heading.level === 1 ? 8 : heading.level === 2 ? 20 : 32}px`,
            }}
          >
            {heading.level > 1 && (
              <ChevronRight size={10} className="mt-0.5 flex-shrink-0 opacity-50" />
            )}
            <span className="line-clamp-2 leading-relaxed">{heading.text}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
