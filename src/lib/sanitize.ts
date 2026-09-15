import xss from "xss";

/**
 * 清洗 HTML，防止 XSS 攻击
 * 允许常见格式化标签，移除 script/事件处理器等危险内容
 */
export function sanitizeHtml(dirty: string): string {
  return xss(dirty, {
    whiteList: {
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: [],
      p: [],
      br: [],
      hr: [],
      blockquote: [],
      pre: [],
      code: [],
      ul: [],
      ol: [],
      li: [],
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      figure: [],
      figcaption: [],
      strong: [],
      em: [],
      del: [],
      s: [],
      u: [],
      sub: [],
      sup: [],
      table: [],
      thead: [],
      tbody: [],
      tr: [],
      th: ["colspan", "rowspan"],
      td: ["colspan", "rowspan"],
      div: ["class", "id"],
      span: ["class", "id"],
      section: ["class", "id"],
      details: [],
      summary: [],
      video: ["src", "poster", "controls", "autoplay", "loop", "muted", "playsinline"],
      source: ["src"],
    },
    // 允许 data-* 属性
    onTagAttr: (tag, name, value) => {
      if (name.startsWith("data-")) {
        return `${name}="${value}"`;
      }
    },
  });
}
