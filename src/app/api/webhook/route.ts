import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDefaultUser } from "@/lib/user";
import { classifyContent } from "@/lib/ai";
import { createHash } from "crypto";

// 微信/飞书/企业微信消息接收 Webhook
// 支持多种来源：微信公众号XML、企业微信XML、JSON格式、飞书格式

// 微信公众号 Token（在设置页面配置，存在环境变量或默认值）
const WECHAT_TOKEN = process.env.WECHAT_TOKEN || "xiaotao2024";

// 简单 XML 解析（微信消息格式固定，不需要完整 XML 解析器）
function parseXml(xml: string): Record<string, string> {
  const result: Record<string, string> = {};
  const regex = /<(\w+)><!\[CDATA\[(.*?)\]\]><\/\1>|<(\w+)>(.*?)<\/\3>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const key = match[1] || match[3];
    const value = match[2] || match[4];
    if (key && value) {
      result[key] = value.trim();
    }
  }
  return result;
}

// 微信签名验证
function verifySignature(token: string, timestamp: string, nonce: string, signature: string): boolean {
  const arr = [token, timestamp, nonce].sort();
  const str = arr.join("");
  const sha1 = createHash("sha1").update(str).digest("hex");
  return sha1 === signature;
}

// GET: 微信公众号/企业微信 URL 验证
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const signature = searchParams.get("signature") || "";
  const timestamp = searchParams.get("timestamp") || "";
  const nonce = searchParams.get("nonce") || "";
  const echostr = searchParams.get("echostr") || "";

  // 微信验证：签名校验后返回 echostr
  if (echostr) {
    if (signature) {
      // 有签名，需要验证
      if (verifySignature(WECHAT_TOKEN, timestamp, nonce, signature)) {
        return new Response(echostr, { status: 200, headers: { "Content-Type": "text/plain" } });
      }
      return new Response("Invalid signature", { status: 403 });
    }
    // 无签名，直接返回（企业微信简化模式）
    return new Response(echostr, { status: 200, headers: { "Content-Type": "text/plain" } });
  }

  return NextResponse.json({
    status: "ok",
    message: "晓桃终生成长 - 消息接收服务运行中",
    webhook: "发送消息到此地址即可自动收录到知识库",
  });
}

// POST: 接收消息
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    const user = await getDefaultUser();

    let content = "";
    let source = "api";
    let msgId = "";
    let msgType = "text";

    if (contentType.includes("text/xml") || contentType.includes("application/xml")) {
      // ===== 微信公众号/企业微信 XML 格式 =====
      const xmlText = await request.text();
      console.log("收到微信XML消息:", xmlText.slice(0, 500));
      const data = parseXml(xmlText);

      msgType = data.MsgType || "text";
      msgId = data.MsgId || "";

      if (msgType === "text") {
        content = data.Content || "";
        source = "wechat";
      } else if (msgType === "image") {
        content = data.PicUrl || "[图片消息]";
        source = "wechat";
      } else if (msgType === "link") {
        content = `${data.Title || ""}\n${data.Description || ""}\n${data.Url || ""}`;
        source = "wechat";
      } else if (msgType === "event") {
        // 事件推送（关注/取消关注等）
        const event = data.Event || "";
        if (event === "subscribe") {
          return new Response("success", { status: 200, headers: { "Content-Type": "text/plain" } });
        }
        return new Response("success", { status: 200, headers: { "Content-Type": "text/plain" } });
      } else {
        content = JSON.stringify(data);
        source = "wechat";
      }
    } else {
      // ===== JSON 格式（通用/飞书/自定义） =====
      const body = await request.json();

      if (body.content) {
        content = body.content;
        source = body.source || "api";
      } else if (body.msgtype === "text" && body.text?.content) {
        content = body.text.content;
        source = "wechat";
      } else if (body.msgtype === "markdown" && body.markdown?.content) {
        content = body.markdown.content;
        source = "wechat";
      } else if (body.content_list?.item) {
        const items = body.content_list.item;
        content = items.map((item: any) => item.content || "").join("\n");
        source = "feishu";
      } else if (body.message) {
        content = typeof body.message === "string" ? body.message : JSON.stringify(body.message);
        source = body.source || "api";
      } else {
        content = typeof body === "string" ? body : JSON.stringify(body);
      }
    }

    if (!content || !content.trim()) {
      if (source === "wechat") {
        // 微信要求返回 "success" 而非 JSON
        return new Response("success", { status: 200, headers: { "Content-Type": "text/plain" } });
      }
      return NextResponse.json({ error: "内容不能为空" }, { status: 400 });
    }

    // 检查是否重复消息（微信会重试）
    if (msgId) {
      const existing = await prisma.document.findFirst({
        where: {
          userId: user.id,
          plainText: { contains: content.slice(0, 50) },
          createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
        },
      });
      if (existing) {
        return new Response("success", { status: 200, headers: { "Content-Type": "text/plain" } });
      }
    }

    // AI 自动分类
    let classification;
    try {
      classification = await classifyContent(content);
    } catch (e) {
      // AI 分类失败，使用默认分类
      classification = {
        category: "00",
        categoryName: "收集箱",
        subCategory: "",
        isNote: content.length < 200,
        tags: [],
        summary: content.slice(0, 30),
      };
    }

    // 查找目标知识库
    let targetKb = await prisma.knowledgeBase.findFirst({
      where: { userId: user.id, categoryCode: classification.category },
    });

    let targetKbId = targetKb?.id;
    if (targetKb && classification.subCategory) {
      const subKb = await prisma.knowledgeBase.findFirst({
        where: {
          userId: user.id,
          parentId: targetKb.id,
          name: { contains: classification.subCategory },
        },
      });
      if (subKb) targetKbId = subKb.id;
    }

    // 如果找不到，放到收集箱
    if (!targetKbId) {
      const inbox = await prisma.knowledgeBase.findFirst({
        where: { userId: user.id, categoryCode: "00" },
      });
      targetKbId = inbox?.id;
    }

    let result;

    if (classification.isNote) {
      // 短内容存为小记
      const note = await prisma.note.create({
        data: {
          content,
          plainText: content,
          userId: user.id,
        },
      });

      // 处理标签（从内容中提取 #标签 + AI 分类标签）
      const contentTags = content.match(/#([^\s#]+)/g) || [];
      const allTags = new Set([
        ...contentTags.map((t) => t.slice(1)),
        ...classification.tags,
      ]);

      for (const tagName of allTags) {
        const cleanName = tagName.trim();
        if (!cleanName) continue;
        // 查找或创建顶级标签（兼容新的层级标签约束）
        let tag = await prisma.tag.findFirst({
          where: { userId: user.id, name: cleanName, parentId: null },
        });
        if (!tag) {
          tag = await prisma.tag.create({
            data: { name: cleanName, userId: user.id, parentId: null },
          });
        }
        await prisma.noteTag.create({
          data: { noteId: note.id, tagId: tag.id },
        });
      }

      result = { type: "note", id: note.id };
    } else {
      // 长内容存为文档
      const doc = await prisma.document.create({
        data: {
          title: classification.summary.slice(0, 30) || "来自微信的记录",
          content: `<p>${content.replace(/\n/g, "<br>")}</p>`,
          plainText: content,
          wordCount: content.length,
          knowledgeBaseId: targetKbId!,
          userId: user.id,
        },
      });

      result = { type: "document", id: doc.id };
    }

    console.log(`✅ 消息已收录: ${result.type} → ${classification.categoryName}`);

    // 微信要求返回 "success" 或 XML 回复
    if (source === "wechat") {
      const replyXml = `<xml>
<MsgType><![CDATA[text]]></MsgType>
<Content><![CDATA[✅ 已收录到「${classification.categoryName}」]]></Content>
</xml>`;
      return new Response(replyXml, {
        status: 200,
        headers: { "Content-Type": "text/xml; charset=utf-8" },
      });
    }

    return NextResponse.json({
      success: true,
      message: `已收录到「${classification.categoryName}${
        classification.subCategory ? "/" + classification.subCategory : ""
      }」`,
      classification,
      result,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    // 微信要求即使出错也返回 200 + success，否则会重试
    return new Response("success", { status: 200, headers: { "Content-Type": "text/plain" } });
  }
}
