import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDefaultUser } from "@/lib/user";

/**
 * 将文档恢复到指定版本
 * POST /api/documents/[id]/versions/[versionId]/restore
 *
 * 恢复前会自动将当前内容保存为一个新版本（带恢复前备注），
 * 确保用户可以随时撤销恢复操作。
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string; versionId: string } }
) {
  const user = await getDefaultUser();

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

  // 获取目标版本
  const targetVersion = await prisma.documentVersion.findUnique({
    where: {
      id: params.versionId,
    },
  });

  if (!targetVersion || targetVersion.documentId !== params.id) {
    return NextResponse.json({ error: "版本不存在" }, { status: 404 });
  }

  // 获取当前最大版本号
  const maxVersionResult = await prisma.documentVersion.aggregate({
    where: { documentId: params.id },
    _max: { version: true },
  });
  const currentMaxVersion = maxVersionResult._max.version || 0;
  const nextVersion = currentMaxVersion + 1;

  // 使用事务：先保存当前版本，再恢复到目标版本
  const [savedVersion, restoredDoc] = await prisma.$transaction([
    // 1. 保存当前内容为新版本（恢复前自动备份）
    prisma.documentVersion.create({
      data: {
        documentId: doc.id,
        title: doc.title,
        content: doc.content,
        plainText: doc.plainText,
        wordCount: doc.wordCount,
        version: nextVersion,
        note: `恢复前自动备份（恢复至 v${targetVersion.version}）`,
      },
    }),
    // 2. 将文档恢复到目标版本
    prisma.document.update({
      where: { id: doc.id },
      data: {
        title: targetVersion.title,
        content: targetVersion.content,
        plainText: targetVersion.plainText,
        wordCount: targetVersion.wordCount,
        version: nextVersion + 1, // 恢复后版本号继续递增
        lastModifiedAt: new Date(),
      },
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      restoredFromVersion: targetVersion.version,
      backupVersion: savedVersion.version,
      backupVersionId: savedVersion.id,
      document: {
        id: restoredDoc.id,
        title: restoredDoc.title,
        version: restoredDoc.version,
        wordCount: restoredDoc.wordCount,
        lastModifiedAt: restoredDoc.lastModifiedAt,
      },
    },
  });
}
