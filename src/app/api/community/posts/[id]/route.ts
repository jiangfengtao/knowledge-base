import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-server";
import { NextResponse } from "next/server";

// 获取帖子详情
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const post = await prisma.communityPost.findUnique({
    where: { id: params.id },
    include: {
      replies: {
        where: { status: "active", parentId: null },
        orderBy: { createdAt: "asc" },
        include: {
          replies: {
            where: { status: "active" },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!post || post.status !== "active") {
    return NextResponse.json({ success: false, error: "帖子不存在" }, { status: 404 });
  }

  // 增加浏览量
  await prisma.communityPost.update({
    where: { id: params.id },
    data: { viewCount: { increment: 1 } },
  });

  // 检查当前用户是否点赞过
  const user = await getCurrentUser();
  let likedByMe = false;
  if (user) {
    const like = await prisma.communityLike.findUnique({
      where: {
        userId_targetType_targetId: {
          userId: user.id,
          targetType: "post",
          targetId: params.id,
        },
      },
    });
    likedByMe = !!like;
  }

  return NextResponse.json({ success: true, data: { ...post, likedByMe } });
}

// 删除帖子（作者或管理员）
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
  }

  const post = await prisma.communityPost.findUnique({
    where: { id: params.id },
  });

  if (!post) {
    return NextResponse.json({ success: false, error: "帖子不存在" }, { status: 404 });
  }

  // 只有作者或默认管理员可以删除
  if (post.authorId !== user.id) {
    const adminUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { email: true },
    });
    if (adminUser?.email !== "admin@xiaotao.com") {
      return NextResponse.json({ success: false, error: "无权操作" }, { status: 403 });
    }
  }

  await prisma.communityPost.update({
    where: { id: params.id },
    data: { status: "deleted" },
  });

  return NextResponse.json({ success: true });
}
