import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDefaultUser } from "@/lib/user";

// 获取单条小记
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getDefaultUser();

  const note = await prisma.note.findUnique({
    where: {
      id: params.id,
      userId: user.id,
      isDeleted: false,
    },
    include: {
      tags: { include: { tag: true } },
    },
  });

  if (!note) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    data: {
      ...note,
      tags: note.tags.map((t) => t.tag.name),
    },
  });
}

// 更新小记
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getDefaultUser();
  const body = await request.json();

  const { content, isPinned, tags } = body;

  const updateData: any = {
    lastModifiedAt: new Date(),
  };

  if (content !== undefined) {
    updateData.content = content;
    // 从内容中提取 #标签
    const extractedTags: string[] = [];
    const tagPattern = /#([^\s#]+)/g;
    let match;
    while ((match = tagPattern.exec(content)) !== null) {
      extractedTags.push(match[1]);
    }

    // 清理内容中的标签用于纯文本搜索
    updateData.plainText = content;
  }

  if (isPinned !== undefined) updateData.isPinned = isPinned;

  const note = await prisma.note.update({
    where: {
      id: params.id,
      userId: user.id,
    },
    data: updateData,
    include: {
      tags: { include: { tag: true } },
    },
  });

  // 处理标签更新（如果有 tags 参数或内容变了）
  if (tags !== undefined || content !== undefined) {
    // 先删除旧标签关联
    await prisma.noteTag.deleteMany({
      where: { noteId: note.id },
    });

    // 从内容中提取标签，或使用传入的 tags
    let finalTags = tags;
    if (!finalTags && content) {
      finalTags = [];
      const tagPattern = /#([^\s#]+)/g;
      let match;
      while ((match = tagPattern.exec(content)) !== null) {
        finalTags.push(match[1]);
      }
    }

    if (finalTags && finalTags.length > 0) {
      for (const tagName of finalTags) {
        // 查找或创建标签（顶级标签，parentId 为 null）
        let tag = await prisma.tag.findFirst({
          where: {
            userId: user.id,
            name: tagName,
            parentId: null,
          },
        });

        if (!tag) {
          tag = await prisma.tag.create({
            data: {
              name: tagName,
              userId: user.id,
              parentId: null,
            },
          });
        }

        await prisma.noteTag.create({
          data: {
            noteId: note.id,
            tagId: tag.id,
          },
        });
      }
    }
  }

  // 重新查询，确保返回最新标签
  const noteWithTags = await prisma.note.findUnique({
    where: { id: note.id },
    include: {
      tags: { include: { tag: true } },
    },
  });

  return NextResponse.json({
    data: {
      ...noteWithTags,
      tags: noteWithTags?.tags.map((t) => t.tag.name) || [],
    },
  });
}

// 删除小记（软删除）
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getDefaultUser();

  await prisma.note.update({
    where: {
      id: params.id,
      userId: user.id,
    },
    data: {
      isDeleted: true,
      lastModifiedAt: new Date(),
    },
  });

  return NextResponse.json({ success: true });
}
