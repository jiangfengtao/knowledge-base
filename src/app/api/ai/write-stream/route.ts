import prisma from "@/lib/prisma";
import { getDefaultUser } from "@/lib/user";

// AI 写作助手 - 流式响应（SSE）
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, content, context, title } = body;

    if (!content && action !== "outline" && action !== "brainstorm") {
      return new Response(
        JSON.stringify({ error: "内容不能为空" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const user = await getDefaultUser();

    // 获取 AI 配置
    const settings = await prisma.userSettings.findUnique({
      where: { userId: user.id },
    });

    const aiConfig = settings?.aiConfig ? JSON.parse(settings.aiConfig) : {};

    if (!aiConfig.apiKey) {
      return new Response(
        JSON.stringify({ error: "请先设置 AI API Key" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
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
        systemPrompt = "你是一位优秀的写作助手，请根据上下文继续写下去，保持风格一致，内容自然流畅。直接返回续写的内容，不要加前缀说明。";
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

      case "rewrite":
        systemPrompt = "你是一位写作专家，请用不同的表达方式重写以下内容，保持原意不变但换一种风格和句式。直接返回重写后的内容，不要加解释。";
        userPrompt = `请重写以下内容：\n\n${content}`;
        break;

      case "explain":
        systemPrompt = "你是一位知识渊博的老师，请用通俗易懂的语言解释以下概念或内容，让初学者也能理解。";
        userPrompt = `请解释以下内容：\n\n${content}`;
        break;

      case "custom":
        systemPrompt = "你是一位智能写作助手，请根据用户的要求处理以下内容。";
        userPrompt = `${context || ""}\n\n内容：\n${content}`;
        break;

      default:
        return new Response(
          JSON.stringify({ error: "不支持的操作类型" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
    }

    // 调用 DeepSeek API - 流式
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
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return new Response(
        JSON.stringify({ error: `AI 接口错误 (${response.status}): ${errorData.error?.message || response.statusText}` }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    // 创建 SSE 流
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        try {
          while (reader) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith("data: ")) continue;

              const data = trimmed.slice(6);
              if (data === "[DONE]") {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                continue;
              }

              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content || "";
                if (delta) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`));
                }
              } catch {
                // skip parse errors
              }
            }
          }
        } catch (e) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: "流式传输中断" })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("AI streaming error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "AI 服务调用失败" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
