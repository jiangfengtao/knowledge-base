import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";
import { NextResponse } from "next/server";
import { sanitizeHtml } from "@/lib/sanitize";

// 获取帖子的所有回复（树形结构）
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const replies = await prisma.communityReply.findMany({
    where: { postId: params.id, status: "active", parentId: null },
    orderBy: { createdAt: "asc" },
    include: {
      replies: {
        where: { status: "active" },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return NextResponse.json({ success: true, data: replies });
}

// 发表回复
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
  }

  const body = await request.json();
  const { content, parentId } = body;

  if (!content?.trim()) {
    return NextResponse.json({ success: false, error: "回复内容不能为空" }, { status: 400 });
  }
  if (content.length > 2000) {
    return NextResponse.json({ success: false, error: "回复不能超过2000字" }, { status: 400 });
  }

  // 检查帖子是否存在
  const post = await prisma.communityPost.findUnique({
    where: { id: params.id },
    select: { id: true, authorId: true, title: true },
  });

  if (!post || post.status !== "active") {
    return NextResponse.json({ success: false, error: "帖子不存在" }, { status: 404 });
  }

  // 如果是楼中楼回复，检查父回复是否存在
  if (parentId) {
    const parentReply = await prisma.communityReply.findUnique({
      where: { id: parentId },
      select: { id: true },
    });
    if (!parentReply) {
      return NextResponse.json({ success: false, error: "回复的评论不存在" }, { status: 404 });
    }
  }

  const reply = await prisma.communityReply.create({
    data: {
      postId: params.id,
      authorId: user.id,
      authorName: user.name,
      content: sanitizeHtml(content.trim()),
      parentId: parentId || null,
    },
  });

  // 帖子回复计数 +1
  await prisma.communityPost.update({
    where: { id: params.id },
    data: { replyCount: { increment: 1 } },
  });

  // 给帖子作者发通知（不是自己回复自己的帖子）
  if (post.authorId !== user.id) {
    await prisma.notification.create({
      data: {
        userId: post.authorId,
        type: "reply",
        title: `${user.name} 回复了你的帖子`,
        content: post.title,
        link: `/community/post/${params.id}`,
      },
    });
  }

  // 如果是楼中楼，给被回复的人也发通知
  if (parentId) {
    const parentReply = await prisma.communityReply.findUnique({
      where: { id: parentId },
      select: { authorId: true },
    });
    if (parentReply && parentReply.authorId !== user.id) {
      await prisma.notification.create({
        data: {
          userId: parentReply.authorId,
          type: "reply",
          title: `${user.name} 回复了你的评论`,
          content: content.slice(0, 50),
          link: `/community/post/${params.id}`,
        },
      });
    }
  }

  return NextResponse.json({ success: true, data: reply });
}
