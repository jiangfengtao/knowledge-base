import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDefaultUser } from "@/lib/user";

/**
 * 获取文档的所有版本列表
 * GET /api/documents/[id]/versions
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getDefaultUser();

  // 先验证文档归属
  const doc = await prisma.document.findUnique({
    where: {
      id: params.id,
      userId: user.id,
      isDeleted: false,
    },
    select: { id: true },
  });

  if (!doc) {
    return NextResponse.json({ error: "文档不存在" }, { status: 404 });
  }

  const versions = await prisma.documentVersion.findMany({
    where: { documentId: params.id },
    orderBy: { version: "desc" },
    select: {
      id: true,
      version: true,
      title: true,
      wordCount: true,
      note: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    data: versions,
  });
}

/**
 * 保存文档新版本
 * POST /api/documents/[id]/versions
 * Body: { note?: string }
 *
 * 会自动保存当前文档内容为一个新版本，版本号自动递增
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await getDefaultUser();
  const body = await request.json();
  const { note } = body as { note?: string };

  // 获取当前文档
  const doc = await prisma.document.findUnique({
    where: {
      id: params.id,
      userId: user.id,
      isDeleted: false,
    },
  });

  if (!doc) {
    return NextResponse.json({ error: "文档不存在" }, { status: 404 });
  }

  // 获取当前最大版本号
  const maxVersionResult = await prisma.documentVersion.aggregate({
    where: { documentId: params.id },
    _max: { version: true },
  });
  const currentMaxVersion = maxVersionResult._max.version || 0;
  const nextVersion = currentMaxVersion + 1;

  // 创建新版本记录
  const version = await prisma.documentVersion.create({
    data: {
      documentId: doc.id,
      title: doc.title,
      content: doc.content,
      plainText: doc.plainText,
      wordCount: doc.wordCount,
      version: nextVersion,
      note: note || null,
    },
  });

  // 同步更新文档的 version 字段
  await prisma.document.update({
    where: { id: doc.id },
    data: { version: nextVersion },
  });

  return NextResponse.json({
    data: {
      id: version.id,
      version: version.version,
      title: version.title,
      wordCount: version.wordCount,
      note: version.note,
      createdAt: version.createdAt,
    },
  });
}
