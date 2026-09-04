import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, hashPassword } from "@/lib/password";
import { generateToken } from "@/lib/auth";

// 登录
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "请填写邮箱和密码" },
        { status: 400 }
      );
    }

    // 先检查是否有默认用户（兼容旧数据迁移）
    const defaultUser = await prisma.user.findUnique({
      where: { id: "user-default" },
    });

    // 如果默认用户没有密码，给它设置密码（首次登录迁移）
    if (defaultUser && !defaultUser.password && defaultUser.email === email) {
      // 为旧用户设置密码（哈希存储）
      const hashedPassword = await hashPassword(password);
      await prisma.user.update({
        where: { id: defaultUser.id },
        data: { password: hashedPassword },
      });

      const token = generateToken(defaultUser.id);
      const response = NextResponse.json({
        success: true,
        token,
        user: {
          id: defaultUser.id,
          name: defaultUser.name,
          email: defaultUser.email,
          avatar: defaultUser.avatar,
        },
      });
      response.cookies.set("auth_token", token, {
        httpOnly: true,
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
        sameSite: "lax",
      });
      return response;
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "用户不存在，请先注册" },
        { status: 404 }
      );
    }

    if (!user.password) {
      // 旧用户没有密码，设置密码（哈希存储）
      const hashedPassword = await hashPassword(password);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });
    } else {
      // 验证密码（兼容哈希和旧明文）
      const isValid = await verifyPassword(password, user.password);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "密码错误" },
          { status: 401 }
        );
      }

      // 如果是旧明文密码，自动升级为哈希
      if (!user.password.startsWith("$2a$") && !user.password.startsWith("$2b$")) {
        const hashedPassword = await hashPassword(password);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword },
        });
      }
    }

    const token = generateToken(user.id);

    const response = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
      sameSite: "lax",
    });
    return response;
  } catch (error: any) {
    console.error("登录失败:", error);
    return NextResponse.json(
      { success: false, error: "登录失败，请稍后重试" },
      { status: 500 }
    );
  }
}
