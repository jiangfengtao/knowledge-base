"use client";

import { useEffect } from "react";

interface BlogPostClientProps {
  postId: string;
  allowCopy: boolean;
  isMemberOnly: boolean;
}

export default function BlogPostClient({
  postId,
  allowCopy,
  isMemberOnly,
}: BlogPostClientProps) {
  useEffect(() => {
    // 记录阅读量
    fetch(`/api/documents/${postId}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const viewCountEl = document.getElementById("view-count");
          if (viewCountEl) {
            viewCountEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> ${data.viewCount} 阅读`;
          }
        }
      })
      .catch(() => {});

    // 复制追加版权声明
    const handleCopy = (e: ClipboardEvent) => {
      if (!allowCopy) {
        e.preventDefault();
        return;
      }
      const selection = window.getSelection();
      if (!selection) return;
      const selectedText = selection.toString();
      if (selectedText.length < 30) return; // 太短的不追加

      const pageUrl = window.location.href;
      const copyrightText = `\n\n---\n原文来自 晓桃终生成长：${pageUrl}\n作者：晓桃\n保留所有权利`;

      e.preventDefault();
      e.clipboardData?.setData("text/plain", selectedText + copyrightText);
    };

    // 禁止右键菜单（不允许复制的文章）
    const handleContextMenu = (e: MouseEvent) => {
      if (!allowCopy) {
        e.preventDefault();
      }
    };

    // 禁止选择文本（不允许复制的文章）
    const handleSelectStart = (e: Event) => {
      if (!allowCopy) {
        e.preventDefault();
      }
    };

    document.addEventListener("copy", handleCopy);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("selectstart", handleSelectStart);

    // ========== 仅在 allowCopy = false 时启用的加强保护 ==========
    let copyWarningTimer: ReturnType<typeof setTimeout> | null = null;
    let watermarkTimer: ReturnType<typeof setTimeout> | null = null;
    let watermarkInterval: ReturnType<typeof setInterval> | null = null;

    // 显示版权警告提示
    const showWarning = (message: string) => {
      const existing = document.getElementById("copy-warning-toast");
      if (existing) existing.remove();

      const toast = document.createElement("div");
      toast.id = "copy-warning-toast";
      toast.textContent = message;
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(239, 68, 68, 0.95);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 99999;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        max-width: 90vw;
        text-align: center;
      `;
      document.body.appendChild(toast);

      requestAnimationFrame(() => {
        toast.style.opacity = "1";
      });

      if (copyWarningTimer) clearTimeout(copyWarningTimer);
      copyWarningTimer = setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    };

    // 禁止开发者工具快捷键
    const handleKeyDown = (e: KeyboardEvent) => {
      if (allowCopy) return;

      // F12
      if (e.key === "F12") {
        e.preventDefault();
        showWarning("本内容受版权保护，禁止使用开发者工具");
        return;
      }

      // Ctrl+Shift+I / Cmd+Shift+I (检查元素)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "i") {
        e.preventDefault();
        showWarning("本内容受版权保护，禁止使用开发者工具");
        return;
      }

      // Ctrl+Shift+J / Cmd+Shift+J (控制台)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "j") {
        e.preventDefault();
        showWarning("本内容受版权保护，禁止使用开发者工具");
        return;
      }

      // Ctrl+Shift+C / Cmd+Shift+C (元素选择器)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        showWarning("本内容受版权保护，禁止使用开发者工具");
        return;
      }

      // Ctrl+U / Cmd+U (查看源代码)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "u") {
        e.preventDefault();
        showWarning("本内容受版权保护，禁止查看源代码");
        return;
      }

      // Ctrl+S / Cmd+S (保存页面)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        return;
      }

      // 检测到大段复制（Ctrl+C / Cmd+C）
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
        const selection = window.getSelection();
        const selectedText = selection?.toString() || "";
        if (selectedText.length > 100) {
          showWarning("版权警告：禁止复制大段内容，如需引用请联系作者授权");
        }
      }
    };

    // 禁止拖拽图片保存
    const handleDragStart = (e: DragEvent) => {
      if (allowCopy) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG") {
        e.preventDefault();
      }
    };

    // 图片添加水印效果
    const addImageWatermarks = () => {
      if (allowCopy) return;
      const docContent = document.querySelector(".doc-content");
      if (!docContent) return;

      const images = docContent.querySelectorAll("img");
      images.forEach((img) => {
        if (img.parentElement?.classList.contains("watermark-wrapper")) return;

        const wrapper = document.createElement("span");
        wrapper.className = "watermark-wrapper";
        wrapper.style.cssText = `
          position: relative;
          display: inline-block;
          width: 100%;
          user-select: none;
          -webkit-user-drag: none;
        `;

        // 水印层
        const watermark = document.createElement("div");
        watermark.className = "image-watermark";
        watermark.textContent = "晓桃终生成长";
        watermark.style.cssText = `
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.25);
          font-size: 24px;
          font-weight: bold;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
          user-select: none;
          letter-spacing: 4px;
        `;

        // 确保图片不可拖拽
        img.style.cssText = (img.style.cssText || "") + "; user-select: none; -webkit-user-drag: none; pointer-events: none;";
        img.setAttribute("draggable", "false");

        img.parentNode?.insertBefore(wrapper, img);
        wrapper.appendChild(img);
        wrapper.appendChild(watermark);
      });
    };

    // 检测开发者工具打开（通过窗口尺寸变化检测）
    const checkDevTools = () => {
      if (allowCopy) return;
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      if (widthThreshold || heightThreshold) {
        if (!document.getElementById("devtools-overlay")) {
          const overlay = document.createElement("div");
          overlay.id = "devtools-overlay";
          overlay.innerHTML = `
            <div style="
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.85);
              z-index: 99998;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              color: white;
              text-align: center;
              padding: 20px;
            ">
              <div style="font-size: 20px; font-weight: bold; margin-bottom: 12px;">内容受版权保护</div>
              <div style="font-size: 14px; opacity: 0.8; max-width: 400px; line-height: 1.6;">
                检测到开发者工具已打开。请关闭开发者工具后继续浏览。<br/>
                未经授权，禁止复制、转载本站内容。
              </div>
              <a href="/blog" style="
                margin-top: 20px;
                padding: 10px 24px;
                background: #f97316;
                color: white;
                border-radius: 8px;
                text-decoration: none;
                font-size: 14px;
              ">返回首页</a>
            </div>
          `;
          document.body.appendChild(overlay);
        }
      } else {
        const overlay = document.getElementById("devtools-overlay");
        if (overlay) overlay.remove();
      }
    };

    // 注册加强保护的事件监听
    if (!allowCopy) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("dragstart", handleDragStart);
      window.addEventListener("resize", checkDevTools);

      // 图片水印（延迟执行确保 DOM 已渲染）
      watermarkTimer = setTimeout(addImageWatermarks, 500);

      // 定期检测新增图片
      watermarkInterval = setInterval(addImageWatermarks, 2000);

      // 初始检测开发者工具
      checkDevTools();
    }

    // 加载 Giscus 评论（仅完整文章显示）
    if (!isMemberOnly) {
      const script = document.createElement("script");
      script.src = "https://giscus.app/client.js";
      script.async = true;
      script.crossOrigin = "anonymous";
      script.setAttribute("data-repo", "xiaotaotop/knowledge-base");
      script.setAttribute("data-repo-id", "");
      script.setAttribute("data-category", "General");
      script.setAttribute("data-category-id", "");
      script.setAttribute("data-mapping", "pathname");
      script.setAttribute("data-strict", "0");
      script.setAttribute("data-reactions-enabled", "1");
      script.setAttribute("data-emit-metadata", "0");
      script.setAttribute("data-input-position", "bottom");
      script.setAttribute("data-theme", "light");
      script.setAttribute("data-lang", "zh-CN");

      const container = document.getElementById("comments-container");
      if (container) {
        container.innerHTML = "";
        container.appendChild(script);
      }
    }

    return () => {
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("selectstart", handleSelectStart);

      if (!allowCopy) {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("dragstart", handleDragStart);
        window.removeEventListener("resize", checkDevTools);
        if (watermarkTimer) clearTimeout(watermarkTimer);
        if (watermarkInterval) clearInterval(watermarkInterval);
        if (copyWarningTimer) clearTimeout(copyWarningTimer);
      }
    };
  }, [postId, allowCopy, isMemberOnly]);

  return null;
}
