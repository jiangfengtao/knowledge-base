import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { generateToken } from "@/lib/auth";

// 注册
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: "请填写所有必填项" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "密码至少6位" },
        { status: 400 }
      );
    }

    // 检查邮箱是否已注册
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "该邮箱已注册" },
        { status: 400 }
      );
    }

    // 创建用户（密码哈希存储）
    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // 初始化默认知识库
    const defaultKbs = [
      { name: "00 收集箱", icon: "📥", categoryCode: "00", sortOrder: 0 },
      { name: "01 项目", icon: "📁", categoryCode: "01", sortOrder: 1 },
      { name: "02 领域", icon: "🎯", categoryCode: "02", sortOrder: 2 },
      { name: "03 资源", icon: "📚", categoryCode: "03", sortOrder: 3 },
      { name: "04 长期关注", icon: "🔭", categoryCode: "04", sortOrder: 4 },
      { name: "05 输出", icon: "✍️", categoryCode: "05", sortOrder: 5 },
      { name: "06 个人", icon: "🏠", categoryCode: "06", sortOrder: 6 },
    ];

    for (const kb of defaultKbs) {
      await prisma.knowledgeBase.create({
        data: {
          ...kb,
          userId: user.id,
        },
      });
    }

    // 给「02 领域」加一个「技术」子知识库
    const kb02 = await prisma.knowledgeBase.findFirst({
      where: { userId: user.id, categoryCode: "02" },
    });
    if (kb02) {
      await prisma.knowledgeBase.create({
        data: {
          name: "技术",
          icon: "💻",
          parentId: kb02.id,
          userId: user.id,
          sortOrder: 0,
        },
      });
    }

    const token = generateToken(user.id);

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });

    // 设置 httpOnly Cookie，浏览器自动携带
    const isProduction = process.env.NODE_ENV === "production";
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30天
      sameSite: "lax",
      ...(isProduction && { secure: true }),
    });

    return response;
  } catch (error: any) {
    console.error("注册失败:", error);
    return NextResponse.json(
      { success: false, error: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
}
