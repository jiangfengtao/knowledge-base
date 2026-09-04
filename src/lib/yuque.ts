// 语雀开放 API 封装
// 文档：https://www.yuque.com/yuque/developer/api

const YUQUE_API_BASE = "https://www.yuque.com/api/v2";

type YuqueOptions = {
  token: string;
};

// 获取用户信息
export async function getYuqueUser(token: string) {
  const res = await fetch(`${YUQUE_API_BASE}/user`, {
    headers: {
      "X-Auth-Token": token,
      "User-Agent": "xiaoTao-Knowledge-Base",
    },
  });

  if (!res.ok) {
    throw new Error(`语雀 API 错误: ${res.status}`);
  }

  return res.json();
}

// 获取知识库列表
export async function getYuqueRepos(token: string) {
  const userRes = await getYuqueUser(token);
  const login = userRes.data.login;

  const res = await fetch(
    `${YUQUE_API_BASE}/users/${login}/repos?type=Book`,
    {
      headers: {
        "X-Auth-Token": token,
        "User-Agent": "xiaoTao-Knowledge-Base",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`语雀 API 错误: ${res.status}`);
  }

  return res.json();
}

// 获取知识库目录
export async function getYuqueToc(token: string, repoId: string) {
  const res = await fetch(`${YUQUE_API_BASE}/repos/${repoId}/toc`, {
    headers: {
      "X-Auth-Token": token,
      "User-Agent": "xiaoTao-Knowledge-Base",
    },
  });

  if (!res.ok) {
    throw new Error(`语雀 API 错误: ${res.status}`);
  }

  return res.json();
}

// 获取文档列表
export async function getYuqueDocs(token: string, repoId: string) {
  const res = await fetch(
    `${YUQUE_API_BASE}/repos/${repoId}/docs?offset=0&limit=100`,
    {
      headers: {
        "X-Auth-Token": token,
        "User-Agent": "xiaoTao-Knowledge-Base",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`语雀 API 错误: ${res.status}`);
  }

  return res.json();
}

// 获取单个文档详情
export async function getYuqueDocDetail(
  token: string,
  repoId: string,
  slug: string
) {
  const res = await fetch(
    `${YUQUE_API_BASE}/repos/${repoId}/docs/${slug}`,
    {
      headers: {
        "X-Auth-Token": token,
        "User-Agent": "xiaoTao-Knowledge-Base",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`语雀 API 错误: ${res.status}`);
  }

  return res.json();
}

// 将语雀 Markdown 转换为 HTML（简单处理，后续可以用 markdown-it）
export function yuqueMarkdownToHtml(markdown: string): string {
  // 简单转换，实际项目可以用 markdown-it 或 remark
  let html = markdown
    // 标题
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^#### (.+)$/gm, "<h4>$1</h4>")
    // 粗体
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // 斜体
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // 代码行
    .replace(/`(.+?)`/g, "<code>$1</code>")
    // 链接
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    // 图片
    .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1">')
    // 列表
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/^(\d+)\. (.+)$/gm, "<li>$2</li>")
    // 引用
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    // 分割线
    .replace(/^---$/gm, "<hr>")
    // 段落
    .replace(/^(.+)$/gm, (match) => {
      if (
        match.startsWith("<h") ||
        match.startsWith("<li") ||
        match.startsWith("<blockquote") ||
        match.startsWith("<hr") ||
        match.startsWith("<ul") ||
        match.startsWith("<ol") ||
        match.startsWith("<pre") ||
        match.startsWith("<div") ||
        match.startsWith("<p")
      ) {
        return match;
      }
      return `<p>${match}</p>`;
    });

  return html;
}

// 提取纯文本
export function extractPlainText(htmlOrMd: string): string {
  // 去除 HTML 标签
  const text = htmlOrMd.replace(/<[^>]*>/g, "").replace(/[#*`>\-\[\]\(\)!]/g, "");
  return text.trim().slice(0, 500);
}
