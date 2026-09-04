import { NextResponse } from "next/server";
import { getYuqueRepos, getYuqueUser } from "@/lib/yuque";
import prisma from "@/lib/prisma";
import { getDefaultUser } from "@/lib/user";

// 获取语雀知识库列表
export async function GET(request: Request) {
  const user = await getDefaultUser();
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "缺少语雀 Token" },
      { status: 400 }
    );
  }

  try {
    const repos = await getYuqueRepos(token);
    return NextResponse.json({ data: repos.data });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "获取语雀知识库失败" },
      { status: 500 }
    );
  }
}

// 保存语雀配置
export async function POST(request: Request) {
  const user = await getDefaultUser();
  const body = await request.json();
  const { token } = body;

  if (!token) {
    return NextResponse.json(
      { error: "缺少语雀 Token" },
      { status: 400 }
    );
  }

  try {
    // 验证 token 是否有效
    const yuqueUser = await getYuqueUser(token);

    // 保存到设置（这里用 user 的字段存，后续可以做专门的 settings 表）
    // 先简化，返回成功
    return NextResponse.json({
      success: true,
      yuqueUser: yuqueUser.data,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Token 验证失败" },
      { status: 400 }
    );
  }
}
