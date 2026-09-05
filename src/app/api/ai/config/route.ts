import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDefaultUser } from "@/lib/user";

// 保存 AI 配置
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, apiKey, baseUrl, model } = body;

    const user = await getDefaultUser();

    // 保存到 userSettings
    const aiConfig = {
      provider: provider || "deepseek",
      apiKey: apiKey || "",
      baseUrl: baseUrl || "https://api.deepseek.com",
      model: model || "deepseek-chat",
    };

    // 检查是否已有设置
    const existing = await prisma.userSettings.findUnique({
      where: { userId: user.id },
    });

    if (existing) {
      await prisma.userSettings.update({
        where: { userId: user.id },
        data: { aiConfig: JSON.stringify(aiConfig) },
      });
    } else {
      await prisma.userSettings.create({
        data: {
          userId: user.id,
          aiConfig: JSON.stringify(aiConfig),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        provider: aiConfig.provider,
        model: aiConfig.model,
        hasApiKey: !!aiConfig.apiKey,
      },
    });
  } catch (error: any) {
    console.error("Save AI config error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "保存失败" },
      { status: 500 }
    );
  }
}

// 获取 AI 配置
export async function GET() {
  try {
    const user = await getDefaultUser();

    const settings = await prisma.userSettings.findUnique({
      where: { userId: user.id },
    });

    const aiConfig = settings?.aiConfig ? JSON.parse(settings.aiConfig) : {};

    return NextResponse.json({
      success: true,
      data: {
        provider: aiConfig.provider || "deepseek",
        model: aiConfig.model || "deepseek-chat",
        hasApiKey: !!aiConfig.apiKey,
        // 不返回完整的 key，只返回前几位和后几位
        apiKeyPreview: aiConfig.apiKey
          ? aiConfig.apiKey.slice(0, 6) + "..." + aiConfig.apiKey.slice(-4)
          : "",
      },
    });
  } catch (error: any) {
    console.error("Get AI config error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "获取失败" },
      { status: 500 }
    );
  }
}
