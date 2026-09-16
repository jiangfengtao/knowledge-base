import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";
import { NextResponse } from "next/server";
import { xss } from "@/lib/sanitize";

// 获取帖子列表
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const type = searchParams.get("type");
  const category = searchParams.get("category");

  const where: any = { status: "active" };
  if (type) where.type = type;
  if (category) where.category = category;

  const [posts, total] = await Promise.all([
    prisma.communityPost.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: {
          select: { replies: { where: { status: "active" } } },
        },
      },
    }),
    prisma.communityPost.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: posts,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}

// 发布帖子
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
  }

  const body = await request.json();
  const { title, content, type = "discussion", category } = body;

  if (!title?.trim() || title.trim().length < 2) {
    return NextResponse.json({ success: false, error: "标题至少2个字" }, { status: 400 });
  }
  if (!content?.trim()) {
    return NextResponse.json({ success: false, error: "内容不能为空" }, { status: 400 });
  }
  if (title.length > 100) {
    return NextResponse.json({ success: false, error: "标题不能超过100字" }, { status: 400 });
  }
  if (content.length > 10000) {
    return NextResponse.json({ success: false, error: "内容不能超过10000字" }, { status: 400 });
  }

  const plainText = content.replace(/<[^>]*>/g, "").slice(0, 500);

  const post = await prisma.communityPost.create({
    data: {
      authorId: user.id,
      authorName: user.name,
      title: xss(title.trim()),
      content: xss(content),
      plainText,
      type,
      category: category || null,
    },
  });

  return NextResponse.json({ success: true, data: post });
}
