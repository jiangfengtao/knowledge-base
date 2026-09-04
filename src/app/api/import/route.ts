import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDefaultUser } from "@/lib/user";
import { marked } from "marked";
import { sanitizeHtml } from "@/lib/sanitize";

export const runtime = "nodejs";
export const maxDuration = 60;

// 导入 Markdown 文件（支持单文件 .md 或语雀导出的 .zip）
export async function POST(request: Request) {
  const user = await getDefaultUser();

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const knowledgeBaseId = formData.get("knowledgeBaseId") as string;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "请选择要导入的文件" },
        { status: 400 }
      );
    }

    // 确定目标知识库
    let kbId = knowledgeBaseId;
    if (!kbId) {
      // 默认放收集箱
      const inbox = await prisma.knowledgeBase.findFirst({
        where: { userId: user.id, categoryCode: "00" },
      });
      kbId = inbox?.id || "";
    }

    if (!kbId) {
      return NextResponse.json(
        { error: "找不到目标知识库" },
        { status: 400 }
      );
    }

    const results: any[] = [];

    for (const file of files) {
      const fileName = file.name;

      // 处理 .md 文件
      if (fileName.endsWith(".md")) {
        const content = await file.text();
        const result = await importMarkdown(user.id, kbId, fileName, content);
        results.push(result);
      }
      // 处理 .zip 文件（语雀导出格式）
      else if (fileName.endsWith(".zip")) {
        // 动态加载 jszip
        const JSZip = (await import("jszip")).default;
        const zip = await JSZip.loadAsync(await file.arrayBuffer());

        // 遍历 zip 中的文件
        const mdFiles: { name: string; content: string }[] = [];

        zip.forEach((relativePath, zipEntry) => {
          if (relativePath.endsWith(".md") && !zipEntry.dir) {
            mdFiles.push({
              name: relativePath,
              content: "", // 后面填充
            });
          }
        });

        // 读取所有 md 文件内容
        for (const mdFile of mdFiles) {
          const entry = zip.file(mdFile.name);
          if (entry) {
            mdFile.content = await entry.async("string");
          }
        }

        // 逐个导入
        for (const mdFile of mdFiles) {
          const result = await importMarkdown(
            user.id,
            kbId,
            mdFile.name,
            mdFile.content
          );
          results.push(result);
        }
      }
    }

    const successCount = results.filter((r) => r.status === "success").length;
    const failCount = results.filter((r) => r.status === "error").length;

    return NextResponse.json({
      success: true,
      total: results.length,
      successCount,
      failCount,
      knowledgeBaseId: kbId,
      results,
    });
  } catch (e: any) {
    console.error("Import error:", e);
    return NextResponse.json(
      { error: e.message || "导入失败" },
      { status: 500 }
    );
  }
}

// 导入单篇 Markdown 文档
async function importMarkdown(
  userId: string,
  knowledgeBaseId: string,
  fileName: string,
  markdownContent: string
) {
  try {
    // 从文件名提取标题（去掉路径和 .md 后缀）
    let title = fileName;
    const lastSlash = Math.max(title.lastIndexOf("/"), title.lastIndexOf("\\"));
    if (lastSlash >= 0) {
      title = title.slice(lastSlash + 1);
    }
    title = title.replace(/\.md$/i, "");

    // 语雀导出的文件名可能带数字前缀，如 "1- 标题"，去掉前缀
    title = title.replace(/^\d+[-_\s]+/, "");

    // 如果 Markdown 第一行是 # 标题，用那个作为标题
    const firstLineMatch = markdownContent.match(/^#\s+(.+)$/m);
    if (firstLineMatch) {
      title = firstLineMatch[1].trim();
      // 从内容中去掉标题行，避免重复
      markdownContent = markdownContent.replace(/^#\s+.+\n+/, "");
    }

    // 转换 Markdown 为 HTML
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
    const html = sanitizeHtml(await marked.parse(markdownContent));

    // 提取纯文本
    const plainText = markdownContent.replace(/[#*`>\-\[\]\(\)!_]/g, "").trim();

    // 检查是否已存在（同标题 + 同知识库）
    const existing = await prisma.document.findFirst({
      where: {
        userId,
        knowledgeBaseId,
        title,
      },
    });

    if (existing) {
      // 更新
      await prisma.document.update({
        where: { id: existing.id },
        data: {
          content: html,
          plainText,
          wordCount: plainText.length,
          lastModifiedAt: new Date(),
        },
      });
      return { title, status: "success", action: "updated" };
    } else {
      // 新建
      await prisma.document.create({
        data: {
          title,
          content: html,
          plainText,
          wordCount: plainText.length,
          knowledgeBaseId,
          userId,
        },
      });
      return { title, status: "success", action: "created" };
    }
  } catch (e: any) {
    return {
      title: fileName,
      status: "error",
      error: e.message,
    };
  }
}
