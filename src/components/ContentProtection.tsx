"use client";

import { useEffect } from "react";

/**
 * 内容保护组件
 * 仅在前台公开页面使用，不影响后台编辑功能
 *
 * 保护措施：
 * 1. 禁用右键菜单
 * 2. 禁用文本选择（博客正文除外，允许用户正常阅读选中）
 * 3. 禁用图片拖拽
 * 4. 拦截 F12 / Ctrl+Shift+I / Ctrl+U 等快捷键
 * 5. 检测 DevTools 打开（警告但不阻止，避免影响体验）
 * 6. 禁用控制台输出（生产环境）
 * 7. 剪贴板污染：复制时自动追加版权信息
 */
export default function ContentProtection() {
  useEffect(() => {
    // 跳过开发环境和后台编辑页面
    const pathname = window.location.pathname;
    const isAdminPage =
      pathname.startsWith("/knowledge") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/redeem") ||
      pathname.startsWith("/setup");

    if (isAdminPage) return;

    // 1. 禁用右键菜单
    const handleContextMenu = (e: MouseEvent) => {
      // 允许在输入框/文本域内右键
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }
      e.preventDefault();
    };

    // 2. 禁用图片拖拽
    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG" || target.tagName === "VIDEO") {
        e.preventDefault();
      }
    };

    // 3. 拦截快捷键（F12 / Ctrl+Shift+I / Ctrl+U / Ctrl+S / Ctrl+P）
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.keyCode === 123) {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C（开发者工具）
      if (
        e.ctrlKey &&
        e.shiftKey &&
        (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)
      ) {
        e.preventDefault();
        return false;
      }

      // Ctrl+U（查看源代码）
      if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        return false;
      }

      // Ctrl+S（保存网页）
      if (e.ctrlKey && e.keyCode === 83) {
        e.preventDefault();
        return false;
      }

      // Ctrl+P（打印）
      if (e.ctrlKey && e.keyCode === 80) {
        e.preventDefault();
        return false;
      }
    };

    // 4. 剪贴板版权追加 - 复制时自动加上来源信息
    const handleCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

      const copiedText = selection.toString();
      // 只对较长的复制内容追加版权（短词语不追加，避免影响体验）
      if (copiedText.length > 50) {
        const copyrightText = `\n\n---\n原文来自：晓桃自学英语 (xiaotaotop.com)\n版权所有，转载请注明出处。\n`;

        if (e.clipboardData) {
          e.clipboardData.setData("text/plain", copiedText + copyrightText);
          e.preventDefault();
        }
      }
    };

    // 5. 禁用控制台输出（生产环境）
    if (process.env.NODE_ENV === "production") {
      // 保留 error 和 warn，只禁用 log/info/debug
      console.log = () => {};
      console.info = () => {};
      console.debug = () => {};
    }

    // 6. DevTools 检测（温和提醒）
    let devtoolsOpen = false;
    const threshold = 160;

    const checkDevTools = () => {
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      const isOpen = widthDiff > threshold || heightDiff > threshold;

      if (isOpen && !devtoolsOpen) {
        devtoolsOpen = true;
        // 不阻止，只做一次性提醒
        console.warn(
          "%c⚠️ 友情提醒",
          "color: red; font-size: 16px; font-weight: bold;"
        );
        console.warn(
          "%c本网站内容受版权法保护，未经授权不得复制、转载或用于 AI 训练。版权所有：晓桃自学英语 (xiaotaotop.com)",
          "color: #666; font-size: 12px;"
        );
      } else if (!isOpen) {
        devtoolsOpen = false;
      }
    };

    const devtoolsInterval = setInterval(checkDevTools, 2000);

    // 添加事件监听
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("dragstart", handleDragStart);
    document.addEventListener("keydown", handleKeyDown as EventListener);
    document.addEventListener("copy", handleCopy);

    // 禁用图片的 user-drag
    const images = document.querySelectorAll("img, video");
    images.forEach((img) => {
      img.addEventListener("dragstart", (e) => e.preventDefault());
      (img as HTMLElement).style.setProperty("-webkit-user-drag", "none");
    });

    // 清理
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("dragstart", handleDragStart);
      document.removeEventListener("keydown", handleKeyDown as EventListener);
      document.removeEventListener("copy", handleCopy);
      clearInterval(devtoolsInterval);
    };
  }, []);

  return null; // 不渲染任何内容
}
