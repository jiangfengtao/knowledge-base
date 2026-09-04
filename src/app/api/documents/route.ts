import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDefaultUser } from "@/lib/user";

export async function GET(request: Request) {
  const user = await getDefaultUser();
  const { searchParams } = new URL(request.url);
  const knowledgeBaseId = searchParams.get("knowledgeBaseId");
  const search = searchParams.get("search");
  const favorite = searchParams.get("favorite");

  const where: any = {
    userId: user.id,
    isDeleted: false,
  };

  if (knowledgeBaseId) {
    where.knowledgeBaseId = knowledgeBaseId;
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { plainText: { contains: search } },
    ];
  }

  if (favorite === "true") {
    where.isFavorite = true;
  }

  const documents = await prisma.document.findMany({
    where,
    orderBy: { lastModifiedAt: "desc" },
    select: {
      id: true,
      title: true,
      plainText: true,
      wordCount: true,
      isFavorite: true,
      lastModifiedAt: true,
      knowledgeBaseId: true,
    },
  });

  return NextResponse.json({
    data: documents,
  });
}

export async function POST(request: Request) {
  const user = await getDefaultUser();
  const body = await request.json();

  const { title, content, plainText, knowledgeBaseId } = body;

  // 查找或创建默认知识库
  let kbId = knowledgeBaseId;
  if (!kbId) {
    const defaultKb = await prisma.knowledgeBase.findFirst({
      where: { userId: user.id, categoryCode: "00" },
    });
    if (defaultKb) kbId = defaultKb.id;
  }

  const doc = await prisma.document.create({
    data: {
      title: title || "无标题文档",
      content: content || "",
      plainText: plainText || "",
      wordCount: plainText?.length || 0,
      knowledgeBaseId: kbId,
      userId: user.id,
    },
  });

  return NextResponse.json({ data: doc });
}

// 批量排序（拖拽排序）
export async function PATCH(request: Request) {
  const user = await getDefaultUser();
  const body = await request.json();
  const { items } = body as {
    items: { id: string; sortOrder: number; knowledgeBaseId: string }[];
  };

  if (!items || !Array.isArray(items)) {
    return NextResponse.json({ error: "缺少排序数据" }, { status: 400 });
  }

  await Promise.all(
    items.map((item) =>
      prisma.document.updateMany({
        where: { id: item.id, userId: user.id },
        data: {
          sortOrder: item.sortOrder,
          knowledgeBaseId: item.knowledgeBaseId,
        },
      })
    )
  );

  return NextResponse.json({ success: true });
}
