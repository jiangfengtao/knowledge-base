import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDefaultUser } from "@/lib/user";

// AI 写作助手 - 各种写作操作
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, content, context, title } = body;

    if (!content && action !== "outline" && action !== "brainstorm") {
      return NextResponse.json(
        { success: false, error: "内容不能为空" },
        { status: 400 }
      );
    }

    const user = await getDefaultUser();

    // 获取 AI 配置
    const settings = await prisma.userSettings.findUnique({
      where: { userId: user.id },
    });

    const settingsJson: any = settings?.settings ? JSON.parse(settings.settings) : {};
    const aiConfig = settingsJson.ai || {};

    if (!aiConfig.apiKey) {
      return NextResponse.json(
        { success: false, error: "请先设置 AI API Key" },
        { status: 400 }
      );
    }

    const apiKey = aiConfig.apiKey;
    const baseUrl = aiConfig.baseUrl || "https://api.deepseek.com";
    const model = aiConfig.model || "deepseek-chat";

    // 构建不同的 prompt
    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "continue":
        systemPrompt = "你是一位优秀的写作助手，请根据上下文继续写下去，保持风格一致，内容自然流畅。";
        userPrompt = context
          ? `文章标题：${title || "未命名"}\n\n上下文：\n${context}\n\n请继续写下去：\n${content}`
          : `请继续写以下内容：\n${content}`;
        break;

      case "polish":
        systemPrompt = "你是一位专业的文字编辑，请润色以下文字，让它更通顺、更优雅、更有文采，但保持原意不变。直接返回润色后的内容，不要加解释。";
        userPrompt = `请润色以下文字：\n\n${content}`;
        break;

      case "expand":
        systemPrompt = "你是一位写作专家，请根据以下内容进行扩写，丰富细节，增加深度，让内容更充实。直接返回扩写后的内容，不要加解释。";
        userPrompt = context
          ? `文章标题：${title || "未命名"}\n\n上下文：\n${context}\n\n请扩写以下段落：\n${content}`
          : `请扩写以下内容：\n\n${content}`;
        break;

      case "summarize":
        systemPrompt = "你是一位文字编辑，请将以下内容缩写成简洁的摘要，保留核心信息，去掉冗余。直接返回摘要内容，不要加解释。";
        userPrompt = `请缩写以下内容：\n\n${content}`;
        break;

      case "translate_zh":
        systemPrompt = "你是一位专业翻译，请将以下英文翻译成地道的中文。直接返回翻译结果，不要加解释。";
        userPrompt = `请翻译成中文：\n\n${content}`;
        break;

      case "translate_en":
        systemPrompt = "你是一位专业翻译，请将以下中文翻译成地道的英文。直接返回翻译结果，不要加解释。";
        userPrompt = `请翻译成英文：\n\n${content}`;
        break;

      case "outline":
        systemPrompt = "你是一位写作教练，请根据给定的主题，列出一个清晰、有逻辑的文章大纲，包含主要章节和要点。用 Markdown 格式返回。";
        userPrompt = `请为主题「${title || content}」列出文章大纲：`;
        break;

      case "brainstorm":
        systemPrompt = "你是一位创意写作助手，请围绕给定主题展开头脑风暴，给出 5-10 个相关的写作思路或角度。用列表形式返回。";
        userPrompt = `请围绕「${title || content}」进行头脑风暴，给出写作灵感：`;
        break;

      default:
        return NextResponse.json(
          { success: false, error: "不支持的操作类型" },
          { status: 400 }
        );
    }

    // 调用 DeepSeek API
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `AI 接口错误 (${response.status}): ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({
      success: true,
      data: {
        result,
        action,
        usage: data.usage,
      },
    });
  } catch (error: any) {
    console.error("AI writing error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "AI 服务调用失败" },
      { status: 500 }
    );
  }
}
