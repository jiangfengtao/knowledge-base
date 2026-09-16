import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";
import { NextResponse } from "next/server";

// 点赞 / 取消点赞（toggle）
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
  }

  const body = await request.json();
  const { targetType, targetId } = body;

  if (!targetType || !targetId) {
    return NextResponse.json({ success: false, error: "参数错误" }, { status: 400 });
  }

  if (targetType !== "post" && targetType !== "reply") {
    return NextResponse.json({ success: false, error: "类型错误" }, { status: 400 });
  }

  // 检查是否已点赞
  const existing = await prisma.communityLike.findUnique({
    where: {
      userId_targetType_targetId: {
        userId: user.id,
        targetType,
        targetId,
      },
    },
  });

  if (existing) {
    // 已点赞 -> 取消
    await prisma.communityLike.delete({
      where: { id: existing.id },
    });

    // 更新计数
    if (targetType === "post") {
      await prisma.communityPost.update({
        where: { id: targetId },
        data: { likeCount: { decrement: 1 } },
      });
    } else {
      await prisma.communityReply.update({
        where: { id: targetId },
        data: { likeCount: { decrement: 1 } },
      });
    }

    return NextResponse.json({ success: true, liked: false });
  } else {
    // 未点赞 -> 点赞
    await prisma.communityLike.create({
      data: {
        userId: user.id,
        targetType,
        targetId,
      },
    });

    // 更新计数
    if (targetType === "post") {
      await prisma.communityPost.update({
        where: { id: targetId },
        data: { likeCount: { increment: 1 } },
      });

      // 给帖子作者发通知
      const post = await prisma.communityPost.findUnique({
        where: { id: targetId },
        select: { authorId: true, title: true },
      });
      if (post && post.authorId !== user.id) {
        await prisma.notification.create({
          data: {
            userId: post.authorId,
            type: "like",
            title: `${user.name} 赞了你的帖子`,
            content: post.title,
            link: `/community/post/${targetId}`,
          },
        });
      }
    } else {
      await prisma.communityReply.update({
        where: { id: targetId },
        data: { likeCount: { increment: 1 } },
      });

      // 给回复作者发通知
      const reply = await prisma.communityReply.findUnique({
        where: { id: targetId },
        select: { authorId: true, content: true, postId: true },
      });
      if (reply && reply.authorId !== user.id) {
        await prisma.notification.create({
          data: {
            userId: reply.authorId,
            type: "like",
            title: `${user.name} 赞了你的回复`,
            content: reply.content.slice(0, 50),
            link: `/community/post/${reply.postId}`,
          },
        });
      }
    }

    return NextResponse.json({ success: true, liked: true });
  }
}
