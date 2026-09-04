import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDefaultUser } from "@/lib/user";
import {
  getYuqueDocs,
  getYuqueDocDetail,
  extractPlainText,
} from "@/lib/yuque";

// 同步语雀知识库的文档到本地
export async function POST(request: Request) {
  const user = await getDefaultUser();
  const body = await request.json();

  const { token, repoId, repoName, targetKnowledgeBaseId } = body;

  if (!token || !repoId) {
    return NextResponse.json(
      { error: "缺少必要参数" },
      { status: 400 }
    );
  }

  try {
    // 1. 获取知识库文档列表
    const docsRes = await getYuqueDocs(token, repoId);
    const docs = docsRes.data || [];

    // 2. 确定目标知识库
    let kbId = targetKnowledgeBaseId;
    if (!kbId) {
      // 如果没指定，创建一个新知库
      const kb = await prisma.knowledgeBase.create({
        data: {
          name: repoName || "语雀导入",
          icon: "📚",
          categoryCode: "00", // 默认进收集箱
          userId: user.id,
        },
      });
      kbId = kb.id;
    }

    // 3. 逐个导入文档（先导入 10 篇测试，后续可以全量）
    const docsToImport = docs.slice(0, 10);
    const results: any[] = [];

    for (const doc of docsToImport) {
      try {
        // 获取文档详情
        const detailRes = await getYuqueDocDetail(token, repoId, doc.slug);
        const detail = detailRes.data;

        // 检查是否已导入（通过 yuque_id 关联，后续可以加字段）
        const existing = await prisma.document.findFirst({
          where: {
            userId: user.id,
            title: doc.title,
            knowledgeBaseId: kbId,
          },
        });

        const plainText = extractPlainText(detail.body || detail.body_html || "");

        if (existing) {
          // 更新
          await prisma.document.update({
            where: { id: existing.id },
            data: {
              content: detail.body_html || `<p>${plainText}</p>`,
              plainText,
              wordCount: plainText.length,
              lastModifiedAt: new Date(doc.updated_at),
            },
          });
          results.push({ id: existing.id, title: doc.title, status: "updated" });
        } else {
          // 新建
          const newDoc = await prisma.document.create({
            data: {
              title: doc.title,
              content: detail.body_html || `<p>${plainText}</p>`,
              plainText,
              wordCount: plainText.length,
              knowledgeBaseId: kbId,
              userId: user.id,
              lastModifiedAt: new Date(doc.updated_at),
            },
          });
          results.push({ id: newDoc.id, title: doc.title, status: "created" });
        }
      } catch (docError: any) {
        results.push({
          title: doc.title,
          status: "error",
          error: docError.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      total: docs.length,
      imported: results.filter((r) => r.status !== "error").length,
      failed: results.filter((r) => r.status === "error").length,
      knowledgeBaseId: kbId,
      results,
    });
  } catch (e: any) {
    console.error("Yuque sync error:", e);
    return NextResponse.json(
      { error: e.message || "同步失败" },
      { status: 500 }
    );
  }
}
