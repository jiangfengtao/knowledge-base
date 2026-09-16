"use client";

import { useEffect } from "react";

/**
 * 隐形水印组件
 *
 * 三层水印保护：
 * 1. 零宽字符水印 - 在文本中插入不可见的零宽字符，编码网站标识
 *    被复制后可解码追溯来源
 * 2. CSS 水印 - 在页面底层叠加半透明水印
 * 3. DOM 指纹 - 在 HTML 中注入可追溯的唯一标识
 */

// 站点唯一标识（编码为二进制再转零宽字符）
const SITE_ID = "xiaotaotop.com";

// 零宽字符映射：用于编码二进制
// U+200B (Zero Width Space) = 0
// U+200C (Zero Width Non-Joiner) = 1
// U+200D (Zero Width Joiner) = 分隔符
// U+FEFF (Zero Width No-Break Space) = 起止标记
const ZW_CHARS: Record<string, string> = {
  "0": "\u200B", // ZWSP
  "1": "\u200C", // ZWNJ
  sep: "\u200D",  // ZWJ - 分隔
  mark: "\uFEFF", // BOM - 起止标记
};

/**
 * 将文本编码为零宽字符序列
 * 每个字符转为 8 位二进制，用零宽字符表示
 */
function encodeToZeroWidth(text: string): string {
  let binary = "";
  for (let i = 0; i < text.length; i++) {
    const bits = text.charCodeAt(i).toString(2).padStart(8, "0");
    binary += bits;
  }

  let result = ZW_CHARS.mark; // 起始标记
  for (let i = 0; i < binary.length; i++) {
    result += ZW_CHARS[binary[i]];
  }
  result += ZW_CHARS.sep; // 分隔符
  return result;
}

/**
 * 从零宽字符序列解码出原文
 */
function decodeFromZeroWidth(text: string): string {
  // 提取零宽字符
  const zwChars = text.match(/[\u200B\u200C\u200D\uFEFF]/g);
  if (!zwChars || zwChars.length === 0) return "";

  // 找到起始标记后的内容
  const startIndex = zwChars.indexOf("\uFEFF");
  if (startIndex === -1) return "";

  const contentChars = zwChars.slice(startIndex + 1);
  // 找到分隔符位置
  const sepIndex = contentChars.indexOf("\u200D");
  if (sepIndex === -1) return "";

  const binaryChars = contentChars.slice(0, sepIndex);
  let binary = "";
  for (const char of binaryChars) {
    if (char === "\u200B") binary += "0";
    else if (char === "\u200C") binary += "1";
  }

  let result = "";
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.slice(i, i + 8);
    if (byte.length === 8) {
      result += String.fromCharCode(parseInt(byte, 2));
    }
  }
  return result;
}

/**
 * 在文本节点中注入零宽水印
 * 策略：在每个段落的特定位置插入水印，不影响阅读
 */
function injectWatermarkIntoText(element: HTMLElement) {
  // 只处理包含实际内容的元素
  const contentSelectors = [
    "article",
    ".doc-content",
    ".blog-content",
    "main p",
    "main h1",
    "main h2",
    "main h3",
    "main li",
    "main blockquote",
  ];

  const contentElements = element.querySelectorAll(
    contentSelectors.join(", ")
  );

  const watermark = encodeToZeroWidth(SITE_ID);

  contentElements.forEach((el) => {
    // 跳过已标记的元素
    if (el.getAttribute("data-watermarked")) return;
    el.setAttribute("data-watermarked", "true");

    // 在元素末尾追加零宽字符水印
    // 使用 TextNode 追加，不影响渲染
    const watermarkNode = document.createTextNode(watermark);
    el.appendChild(watermarkNode);
  });
}

/**
 * 创建 CSS 水印覆盖层
 */
function createWatermarkOverlay() {
  // 检查是否已存在
  if (document.getElementById("watermark-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "watermark-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
    opacity: 0.035;
    background-image: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 120px,
      rgba(0, 0, 0, 0.1) 120px,
      rgba(0, 0, 0, 0.1) 240px
    );
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 200px;
  `;

  // 添加水印文字
  for (let i = 0; i < 3; i++) {
    const row = document.createElement("div");
    row.style.cssText = `
      display: flex;
      gap: 200px;
      transform: rotate(-25deg);
    `;
    for (let j = 0; j < 5; j++) {
      const span = document.createElement("span");
      span.textContent = "xiaotaotop.com · 晓桃自学英语";
      span.style.cssText = `
        font-size: 14px;
        color: #000;
        white-space: nowrap;
        letter-spacing: 2px;
        opacity: 0.5;
      `;
      row.appendChild(span);
    }
    overlay.appendChild(row);
  }

  document.body.appendChild(overlay);

  // 暗黑模式适配
  const observer = new MutationObserver(() => {
    const isDark = document.documentElement.classList.contains("dark");
    const spans = overlay.querySelectorAll("span");
    spans.forEach((span) => {
      span.style.color = isDark ? "#fff" : "#000";
    });
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
}

/**
 * 注入 DOM 指纹
 * 在页面 HTML 中添加可追溯的隐藏标识
 */
function injectDOMFingerprint() {
  // 在 head 中添加版权标识 meta 标签
  const existingMeta = document.querySelector('meta[name="content-fingerprint"]');
  if (!existingMeta) {
    const meta = document.createElement("meta");
    meta.name = "content-fingerprint";
    meta.content = `xtp-${Date.now()}-${SITE_ID}`;
    document.head.appendChild(meta);
  }

  // 在 body 末尾添加隐藏的版权标识
  const existingMarker = document.getElementById("copyright-marker");
  if (!existingMarker) {
    const marker = document.createElement("div");
    marker.id = "copyright-marker";
    marker.setAttribute("data-site", SITE_ID);
    marker.setAttribute("data-copyright", "© 2026 晓桃自学英语");
    marker.style.cssText = "display:none !important;";
    marker.textContent = encodeToZeroWidth(
      JSON.stringify({
        site: SITE_ID,
        copyright: "© 2026 晓桃自学英语",
        timestamp: new Date().toISOString(),
      })
    );
    document.body.appendChild(marker);
  }
}

export default function InvisibleWatermark() {
  useEffect(() => {
    const pathname = window.location.pathname;
    // 管理页面不注入水印
    const isAdminPage =
      pathname.startsWith("/knowledge") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/redeem") ||
      pathname.startsWith("/setup");

    if (isAdminPage) return;

    // 1. 创建 CSS 水印覆盖层
    createWatermarkOverlay();

    // 2. 注入 DOM 指纹
    injectDOMFingerprint();

    // 3. 延迟注入零宽水印（等待内容渲染完成）
    const timer = setTimeout(() => {
      injectWatermarkIntoText(document.body);
    }, 1500);

    // 4. 使用 MutationObserver 监听新内容
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            injectWatermarkIntoText(node as HTMLElement);
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      // 清理水印层
      const overlay = document.getElementById("watermark-overlay");
      if (overlay) overlay.remove();
    };
  }, []);

  return null;
}

// 导出解码函数（供需要时调试使用）
export { decodeFromZeroWidth };
