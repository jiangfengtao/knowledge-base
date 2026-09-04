import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDefaultUser } from "@/lib/user";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getDefaultUser();

  const doc = await prisma.document.findUnique({
    where: {
      id: params.id,
      userId: user.id,
      isDeleted: false,
    },
  });

  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ data: doc });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getDefaultUser();
  const body = await request.json();

  const { title, content, plainText, isFavorite, isPublic, knowledgeBaseId, sortOrder } = body;

  const updateData: any = {
    lastModifiedAt: new Date(),
  };

  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;
  if (plainText !== undefined) {
    updateData.plainText = plainText;
    updateData.wordCount = plainText.length;
  }
  if (isFavorite !== undefined) updateData.isFavorite = isFavorite;
  if (isPublic !== undefined) updateData.isPublic = isPublic;
  if (knowledgeBaseId !== undefined) updateData.knowledgeBaseId = knowledgeBaseId;
  if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

  const doc = await prisma.document.update({
    where: {
      id: params.id,
      userId: user.id,
    },
    data: updateData,
  });

  return NextResponse.json({ data: doc });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getDefaultUser();

  await prisma.document.update({
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
