import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import prisma from "@/lib/prisma";

// 允许的音频格式
const ALLOWED_TYPES = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/m4a", "audio/mp4", "audio/aac", "audio/ogg", "audio/webm"];

// 最大文件大小：25MB（Vercel 无服务器限制 4.5MB，我们保守一点）
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // 验证登录
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "未登录" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "请选择音频文件" },
        { status: 400 }
      );
    }

    // 检查文件类型
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|aac|ogg|webm)$/i)) {
      return NextResponse.json(
        { success: false, error: "不支持的音频格式，支持 mp3、wav、m4a、aac、ogg" },
        { status: 400 }
      );
    }

    // 检查文件大小
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: `文件过大，最大支持 ${Math.floor(MAX_SIZE / 1024 / 1024)}MB` },
        { status: 400 }
      );
    }

    // 读取文件并转换为 base64 data URL
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const mimeType = file.type || "audio/mpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // 计算音频时长（简单估算，mp3 约 128kbps）
    // 实际时长由前端通过 Audio 对象获取后再传回来
    const estimatedDuration = Math.floor(file.size / 16000); // 粗略估算

    return NextResponse.json({
      success: true,
      data: {
        url: dataUrl,
        size: file.size,
        type: mimeType,
        name: file.name,
        estimatedDuration,
      },
    });
  } catch (error: any) {
    console.error("音频上传失败:", error);
    return NextResponse.json(
      { success: false, error: "上传失败，请稍后重试" },
      { status: 500 }
    );
  }
}
