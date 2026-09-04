import DOMPurify from "isomorphic-dompurify";

/**
 * 清洗 HTML，防止 XSS 攻击
 * 允许常见格式化标签，移除 script/事件处理器等危险内容
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "br", "hr", "blockquote", "pre", "code",
      "ul", "ol", "li",
      "a", "img", "figure", "figcaption",
      "strong", "em", "del", "s", "u", "sub", "sup",
      "table", "thead", "tbody", "tr", "th", "td",
      "div", "span", "section",
      "details", "summary",
    ],
    ALLOWED_ATTR: [
      "href", "title", "target", "rel",
      "src", "alt", "width", "height",
      "class", "id",
      "colspan", "rowspan",
      "data-*",
    ],
    ALLOW_DATA_ATTR: true,
  });
}
