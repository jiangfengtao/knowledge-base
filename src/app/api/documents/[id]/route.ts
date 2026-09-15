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

  const { title, content, plainText, isFavorite, visibility, knowledgeBaseId, sortOrder, isPublic, videoUrl, videoDuration, isVideo, videoThumbnail, audioUrl, audioDuration, isAudio, audioTitle } = body;

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
  if (visibility !== undefined) updateData.visibility = visibility;
  // 兼容旧版 isPublic 字段
  if (isPublic !== undefined) {
    updateData.visibility = isPublic ? "public" : "private";
  }
  if (knowledgeBaseId !== undefined) updateData.knowledgeBaseId = knowledgeBaseId;
  if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
  // 视频相关字段
  if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
  if (videoDuration !== undefined) updateData.videoDuration = videoDuration;
  if (isVideo !== undefined) updateData.isVideo = isVideo;
  if (videoThumbnail !== undefined) updateData.videoThumbnail = videoThumbnail;
  // 音频相关字段
  if (audioUrl !== undefined) updateData.audioUrl = audioUrl;
  if (audioDuration !== undefined) updateData.audioDuration = audioDuration;
  if (isAudio !== undefined) updateData.isAudio = isAudio;
  if (audioTitle !== undefined) updateData.audioTitle = audioTitle;

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
