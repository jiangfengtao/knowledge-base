import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getDefaultUser } from "@/lib/user";

// 获取当前用户设置
export async function GET() {
  try {
    const user = await getDefaultUser();

    const settings = await prisma.userSettings.findFirst({
      where: { userId: user.id },
    });

    // 解析 socialLinks
    let socialLinks = {};
    try {
      socialLinks = settings?.socialLinks
        ? JSON.parse(settings.socialLinks)
        : {};
    } catch {
      socialLinks = {};
    }

    return NextResponse.json({
      success: true,
      data: {
        blogTitle: settings?.blogTitle || "",
        blogSubtitle: settings?.blogSubtitle || "",
        bio: settings?.bio || "",
        avatarUrl: settings?.avatarUrl || "",
        socialLinks,
        defaultLicense: settings?.defaultLicense || "all-rights",
        defaultAllowCopy: settings?.defaultAllowCopy ?? true,
        defaultAllowShare: settings?.defaultAllowShare ?? true,
      },
    });
  } catch (error: any) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "获取设置失败" },
      { status: 500 }
    );
  }
}

// 更新用户设置
export async function PUT(request: Request) {
  try {
    const user = await getDefaultUser();
    const body = await request.json();

    const {
      blogTitle,
      blogSubtitle,
      bio,
      avatarUrl,
      socialLinks,
      defaultLicense,
      defaultAllowCopy,
      defaultAllowShare,
    } = body;

    const socialLinksStr = socialLinks
      ? JSON.stringify(socialLinks)
      : undefined;

    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: {
        blogTitle: blogTitle ?? undefined,
        blogSubtitle: blogSubtitle ?? undefined,
        bio: bio ?? undefined,
        avatarUrl: avatarUrl ?? undefined,
        socialLinks: socialLinksStr,
        defaultLicense: defaultLicense ?? undefined,
        defaultAllowCopy:
          defaultAllowCopy !== undefined ? defaultAllowCopy : undefined,
        defaultAllowShare:
          defaultAllowShare !== undefined ? defaultAllowShare : undefined,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        blogTitle: blogTitle || "",
        blogSubtitle: blogSubtitle || "",
        bio: bio || "",
        avatarUrl: avatarUrl || "",
        socialLinks: socialLinksStr || "{}",
        defaultLicense: defaultLicense || "all-rights",
        defaultAllowCopy: defaultAllowCopy ?? true,
        defaultAllowShare: defaultAllowShare ?? true,
      },
    });

    // 解析返回
    let resultSocialLinks = {};
    try {
      resultSocialLinks = settings.socialLinks
        ? JSON.parse(settings.socialLinks)
        : {};
    } catch {
      resultSocialLinks = {};
    }

    return NextResponse.json({
      success: true,
      data: {
        blogTitle: settings.blogTitle,
        blogSubtitle: settings.blogSubtitle,
        bio: settings.bio,
        avatarUrl: settings.avatarUrl,
        socialLinks: resultSocialLinks,
        defaultLicense: settings.defaultLicense,
        defaultAllowCopy: settings.defaultAllowCopy,
        defaultAllowShare: settings.defaultAllowShare,
      },
    });
  } catch (error: any) {
    console.error("Update settings error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "保存设置失败" },
      { status: 500 }
    );
  }
}
