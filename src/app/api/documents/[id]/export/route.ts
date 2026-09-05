import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDefaultUser } from "@/lib/user";

/**
 * 将 HTML 内容简单转换为 Markdown 格式
 * 仅处理常见的 Tiptap 输出标签，满足基本导出需求
 */
function htmlToMarkdown(html: string): string {
  if (!html) return "";

  let md = html;

  // 去除换行和多余空白（先规范化）
  md = md.replace(/\r\n/g, "\n");

  // 处理代码块 <pre><code>...</code></pre>
  md = md.replace(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (_, code) => {
    const decoded = decodeHtmlEntities(code).trim();
    return "\n```\n" + decoded + "\n```\n";
  });

  // 处理行内代码 <code>...</code>
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, text) => {
    return "`" + decodeHtmlEntities(text) + "`";
  });

  // 处理标题
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n# $1\n");
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n## $1\n");
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n### $1\n");
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n#### $1\n");
  md = md.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, "\n##### $1\n");
  md = md.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, "\n###### $1\n");

  // 处理加粗和斜体
  md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**");
  md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**");
  md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*");
  md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*");

  // 处理删除线
  md = md.replace(/<s[^>]*>([\s\S]*?)<\/s>/gi, "~~$1~~");
  md = md.replace(/<strike[^>]*>([\s\S]*?)<\/strike>/gi, "~~$1~~");
  md = md.replace(/<del[^>]*>([\s\S]*?)<\/del>/gi, "~~$1~~");

  // 处理链接 <a href="...">text</a>
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)");

  // 处理图片 <img src="..." alt="...">
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi, "![$2]($1)");
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, "![]( $1)");

  // 处理无序列表
  md = md.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_, content) => {
    return "\n" + content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "- $1\n") + "\n";
  });

  // 处理有序列表
  md = md.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_, content) => {
    let index = 0;
    return "\n" + content.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, () => {
      index++;
      return `${index}. $1\n`;
    }) + "\n";
  });

  // 处理引用块
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, content) => {
    const lines = content.trim().split("\n");
    return "\n" + lines.map((line: string) => "> " + line).join("\n") + "\n";
  });

  // 处理分割线
  md = md.replace(/<hr[^>]*>/gi, "\n---\n");

  // 处理段落
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n$1\n");

  // 处理换行 <br>
  md = md.replace(/<br\s*\/?>/gi, "  \n");

  // 处理 div
  md = md.replace(/<div[^>]*>([\s\S]*?)<\/div>/gi, "\n$1\n");

  // 去除剩余的 HTML 标签
  md = md.replace(/<[^>]+>/g, "");

  // 解码 HTML 实体
  md = decodeHtmlEntities(md);

  // 清理多余空行（最多保留 2 个连续换行）
  md = md.replace(/\n{3,}/g, "\n\n");

  return md.trim();
}

/**
 * 解码 HTML 实体字符
 */
function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&ldquo;": '"',
    "&rdquo;": '"',
    "&lsquo;": "'",
    "&rsquo;": "'",
    "&mdash;": "—",
    "&ndash;": "–",
    "&hellip;": "…",
  };

  let result = text;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replace(new RegExp(entity, "gi"), char);
  }

  // 处理数字实体 &#xxx;
  result = result.replace(/&#(\d+);/g, (_, num) => {
    return String.fromCharCode(parseInt(num, 10));
  });

  return result;
}

/**
 * 格式化日期为 YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * 导出文档为 Markdown 格式
 * GET /api/documents/[id]/export
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getDefaultUser();

  const doc = await prisma.document.findUnique({
    where: {
      id: params.id,
      userId: user.id,
      isDeleted: false,
    },
    include: {
      knowledgeBase: {
        select: { name: true },
      },
      tags: {
        include: {
          tag: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!doc) {
    return NextResponse.json({ error: "文档不存在" }, { status: 404 });
  }

  // 将 HTML 内容转换为 Markdown
  const contentMarkdown = htmlToMarkdown(doc.content);

  // 构建元信息
  const tagNames = doc.tags.map((t) => t.tag.name).join(", ");
  const category = doc.knowledgeBase?.name || "";
  const createdDate = formatDate(new Date(doc.createdAt));
  const updatedDate = formatDate(new Date(doc.lastModifiedAt));

  // 组装完整的 Markdown 内容（带 YAML front matter）
  const frontMatter = [
    "---",
    `title: "${doc.title.replace(/"/g, '\\"')}"`,
    `category: "${category.replace(/"/g, '\\"')}"`,
    `tags: [${doc.tags.map((t) => `"${t.tag.name.replace(/"/g, '\\"')}"`).join(", ")}]`,
    `created: ${createdDate}`,
    `updated: ${updatedDate}`,
    `wordCount: ${doc.wordCount}`,
    "---",
    "",
  ].join("\n");

  const fullMarkdown = frontMatter + `# ${doc.title}\n\n` + contentMarkdown + "\n";

  // 生成文件名（替换不合法字符）
  const safeTitle = doc.title.replace(/[\\/:*?"<>|]/g, "_").slice(0, 100) || "document";
  const fileName = `${safeTitle}.md`;

  // 返回文件下载响应
  return new NextResponse(fullMarkdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
      "Content-Length": String(new TextEncoder().encode(fullMarkdown).length),
    },
  });
}
