import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDefaultUser } from "@/lib/user";

export async function GET() {
  const user = await getDefaultUser();

  const knowledgeBases = await prisma.knowledgeBase.findMany({
    where: { userId: user.id },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      children: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        include: {
          children: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            include: {
              children: {
                orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
                include: {
                  _count: {
                    select: { documents: { where: { isDeleted: false } } },
                  },
                  documents: {
                    where: { isDeleted: false },
                    orderBy: { sortOrder: "asc" },
                    select: {
                      id: true,
                      title: true,
                      isFavorite: true,
                      isPublic: true,
                      wordCount: true,
                    },
                  },
                },
              },
              _count: {
                select: { documents: { where: { isDeleted: false } } },
              },
              documents: {
                where: { isDeleted: false },
                orderBy: { sortOrder: "asc" },
                select: {
                  id: true,
                  title: true,
                  isFavorite: true,
                  isPublic: true,
                  wordCount: true,
                },
              },
            },
          },
          _count: {
            select: { documents: { where: { isDeleted: false } } },
          },
          documents: {
            where: { isDeleted: false },
            orderBy: { sortOrder: "asc" },
            select: {
              id: true,
              title: true,
              isFavorite: true,
              isPublic: true,
              wordCount: true,
            },
          },
        },
      },
      _count: {
        select: { documents: { where: { isDeleted: false } } },
      },
      documents: {
        where: { isDeleted: false },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          title: true,
          isFavorite: true,
          isPublic: true,
          wordCount: true,
        },
      },
    },
  });

  const topLevelKbs = knowledgeBases.filter((kb) => !kb.parentId);

  return NextResponse.json({
    data: topLevelKbs,
  });
}

export async function POST(request: Request) {
  const user = await getDefaultUser();
  const body = await request.json();

  const { name, icon, parentId, categoryCode, color, sortOrder } = body;

  const kb = await prisma.knowledgeBase.create({
    data: {
      name,
      icon: icon || "📁",
      parentId: parentId || null,
      categoryCode: categoryCode || null,
      color: color || null,
      sortOrder: sortOrder || 0,
      userId: user.id,
    },
  });

  return NextResponse.json({ data: kb });
}

// 更新知识库
export async function PUT(request: Request) {
  const user = await getDefaultUser();
  const body = await request.json();
  const { id, name, icon, color, parentId, sortOrder, categoryCode } = body;

  if (!id) {
    return NextResponse.json(
      { error: "缺少知识库ID" },
      { status: 400 }
    );
  }

  const existing = await prisma.knowledgeBase.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "知识库不存在" },
      { status: 404 }
    );
  }

  // 防止把自己设为自己的父级
  if (parentId === id) {
    return NextResponse.json(
      { error: "不能将自己设为子级" },
      { status: 400 }
    );
  }

  const data: any = {};
  if (name !== undefined) data.name = name;
  if (icon !== undefined) data.icon = icon;
  if (color !== undefined) data.color = color;
  if (parentId !== undefined) data.parentId = parentId || null;
  if (sortOrder !== undefined) data.sortOrder = sortOrder;
  if (categoryCode !== undefined) data.categoryCode = categoryCode;

  const kb = await prisma.knowledgeBase.update({
    where: { id },
    data,
  });

  return NextResponse.json({ data: kb });
}

// 删除知识库
export async function DELETE(request: Request) {
  const user = await getDefaultUser();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "缺少知识库ID" },
      { status: 400 }
    );
  }

  const existing = await prisma.knowledgeBase.findFirst({
    where: { id, userId: user.id },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "知识库不存在" },
      { status: 404 }
    );
  }

  // 级联删除（子知识库和文档都会被自动删除）
  await prisma.knowledgeBase.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

// 批量排序（拖拽排序）
export async function PATCH(request: Request) {
  const user = await getDefaultUser();
  const body = await request.json();
  const { items } = body as { items: { id: string; sortOrder: number; parentId: string | null }[] };

  if (!items || !Array.isArray(items)) {
    return NextResponse.json(
      { error: "缺少排序数据" },
      { status: 400 }
    );
  }

  // 批量更新排序
  await Promise.all(
    items.map((item) =>
      prisma.knowledgeBase.updateMany({
        where: { id: item.id, userId: user.id },
        data: {
          sortOrder: item.sortOrder,
          parentId: item.parentId,
        },
      })
    )
  );

  return NextResponse.json({ success: true });
}
