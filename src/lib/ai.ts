// AI 服务封装 - 支持大模型调用
// 目前先做 mock，后续接入真实 API

type ClassifyResult = {
  category: string; // 分类编号，如 "02"
  categoryName: string; // 分类名称，如 "02 领域"
  subCategory?: string; // 子分类
  tags: string[]; // 提取的标签
  summary: string; // 内容摘要
  isNote: boolean; // 是否是小记（否则是文档）
};

// 模拟的分类逻辑 - 基于关键词匹配
// 后续接入 LLM 后替换为 AI 分类
export async function classifyContent(content: string): Promise<ClassifyResult> {
  const text = content.toLowerCase();

  // 关键词到分类的映射
  const categoryRules: { pattern: RegExp; code: string; name: string; sub?: string }[] = [
    { pattern: /代码|编程|前端|后端|算法|java|python|javascript|typescript|react|vue|node/, code: "02", name: "02 领域", sub: "技术" },
    { pattern: /产品|需求|设计|ux|ui|交互/, code: "02", name: "02 领域", sub: "产品" },
    { pattern: /项目|计划|todo|任务|待办/, code: "01", name: "01 项目" },
    { pattern: /书|读书|阅读|笔记/, code: "03", name: "03 资源", sub: "书籍笔记" },
    { pattern: /想法|灵感|创意/, code: "00", name: "00 收集箱", sub: "快速记录" },
    { pattern: /思考|反思|感悟|人生/, code: "06", name: "06 个人", sub: "思考反思" },
    { pattern: /ai|人工智能|大模型|gpt|claude/, code: "04", name: "04 长期关注", sub: "AI 前沿" },
  ];

  for (const rule of categoryRules) {
    if (rule.pattern.test(text)) {
      return {
        category: rule.code,
        categoryName: rule.name,
        subCategory: rule.sub,
        tags: extractTags(content),
        summary: content.slice(0, 100) + (content.length > 100 ? "..." : ""),
        isNote: content.length < 500, // 短内容存为小记，长内容存为文档
      };
    }
  }

  // 默认进收集箱
  return {
    category: "00",
    categoryName: "00 收集箱",
    subCategory: "待整理",
    tags: extractTags(content),
    summary: content.slice(0, 100) + (content.length > 100 ? "..." : ""),
    isNote: true,
  };
}

// 简单的标签提取
function extractTags(content: string): string[] {
  const tags: string[] = [];
  const tagPattern = /#(\S+)/g;
  let match;
  while ((match = tagPattern.exec(content)) !== null) {
    tags.push(match[1]);
  }
  return tags;
}

// 生成内容摘要
export async function summarizeContent(content: string): Promise<string> {
  // 先简单截取，后续接入 AI
  return content.slice(0, 200) + (content.length > 200 ? "..." : "");
}
