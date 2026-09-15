import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { rateLimit, getClientIP } from "@/lib/rateLimit";

// 获取评论列表
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get("documentId");

    if (!documentId) {
      return NextResponse.json(
        { success: false, error: "缺少文章ID" },
        { status: 400 }
      );
    }

    // 获取所有已审核通过的评论，按时间倒序
    const comments = await prisma.comment.findMany({
      where: {
        documentId,
        status: "approved",
        parentId: null, // 只查顶层评论
      },
      orderBy: { createdAt: "desc" },
      include: {
        replies: {
          where: { status: "approved" },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    // 统计评论总数
    const totalCount = await prisma.comment.count({
      where: {
        documentId,
        status: "approved",
      },
    });

    return NextResponse.json({
      success: true,
      data: comments,
      totalCount,
    });
  } catch (error: any) {
    console.error("获取评论失败:", error);
    return NextResponse.json(
      { success: false, error: "获取评论失败" },
      { status: 500 }
    );
  }
}

// 发表评论
export async function POST(request: Request) {
  try {
    // 速率限制：每个IP每分钟最多3条评论
    const ip = getClientIP(request);
    const rateKey = `comment:${ip}`;
    const limit = rateLimit(rateKey, 3, 60 * 1000);

    if (!limit.allowed) {
      return NextResponse.json(
        { success: false, error: "评论太频繁啦，休息一下再发吧～" },
        { status: 429 }
      );
    }

    const { documentId, nickname, email, content, parentId } =
      await request.json();

    // 验证必填字段
    if (!documentId || !nickname || !content) {
      return NextResponse.json(
        { success: false, error: "请填写昵称和评论内容" },
        { status: 400 }
      );
    }

    // 验证昵称长度
    if (nickname.length > 20) {
      return NextResponse.json(
        { success: false, error: "昵称不能超过20个字" },
        { status: 400 }
      );
    }

    // 验证内容长度
    if (content.length > 500) {
      return NextResponse.json(
        { success: false, error: "评论内容不能超过500字" },
        { status: 400 }
      );
    }

    // 验证邮箱格式（如果填了）
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "邮箱格式不正确" },
        { status: 400 }
      );
    }

    // 检查文章是否存在且是公开的
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { visibility: true, isDeleted: true },
    });

    if (!document || document.isDeleted || document.visibility !== "public") {
      return NextResponse.json(
        { success: false, error: "文章不存在或已被删除" },
        { status: 404 }
      );
    }

    // 如果是回复，检查父评论是否存在
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { id: true, documentId: true },
      });
      if (!parentComment || parentComment.documentId !== documentId) {
        return NextResponse.json(
          { success: false, error: "回复的评论不存在" },
          { status: 400 }
        );
      }
    }

    // 获取 UA
    const userAgent = request.headers.get("user-agent") || undefined;

    // 创建评论（默认直接通过审核，后面可以改成待审核）
    const comment = await prisma.comment.create({
      data: {
        documentId,
        nickname: nickname.trim(),
        email: email?.trim() || null,
        content: content.trim(),
        parentId: parentId || null,
        status: "approved",
        ipAddress: ip,
        userAgent,
      },
      include: {
        replies: false,
      },
    });

    return NextResponse.json({
      success: true,
      data: comment,
      message: "评论发表成功！",
    });
  } catch (error: any) {
    console.error("发表评论失败:", error);
    return NextResponse.json(
      { success: false, error: "评论发表失败，请稍后再试" },
      { status: 500 }
    );
  }
}
