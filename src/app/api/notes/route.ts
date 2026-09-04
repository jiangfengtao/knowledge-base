import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDefaultUser } from "@/lib/user";

export async function GET(request: Request) {
  const user = await getDefaultUser();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");

  const where: any = {
    userId: user.id,
    isDeleted: false,
  };

  if (search) {
    where.plainText = { contains: search };
  }

  const notes = await prisma.note.findMany({
    where,
    orderBy: [
      { isPinned: "desc" },
      { lastModifiedAt: "desc" },
    ],
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  // 格式化返回
  const formattedNotes = notes.map((note) => ({
    ...note,
    tags: note.tags.map((t) => t.tag.name),
  }));

  return NextResponse.json({
    data: formattedNotes,
  });
}

export async function POST(request: Request) {
  const user = await getDefaultUser();
  const body = await request.json();

  const { content, tags } = body;
  const plainText = content || "";

  // 从内容中提取 #标签
  const extractedTags: string[] = [];
  const tagPattern = /#([^\s#]+)/g;
  let match;
  while ((match = tagPattern.exec(content || "")) !== null) {
    extractedTags.push(match[1]);
  }

  const note = await prisma.note.create({
    data: {
      content,
      plainText,
      userId: user.id,
    },
    include: {
      tags: { include: { tag: true } },
    },
  });

  // 使用提取的标签或传入的标签
  const finalTags = tags && tags.length > 0 ? tags : extractedTags;

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

  // 重新查询，确保返回的 tags 是最新的
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
