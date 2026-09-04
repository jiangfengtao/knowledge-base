import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";

// 不需要认证的 API 路由
const PUBLIC_API_ROUTES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/seed",
  "/api/webhook",
];

// Token 有效期：30 天
const TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;
const SECRET = process.env.AUTH_SECRET || "xiaotao-dev-secret-change-in-prod";

/**
 * 验证 token（与 lib/auth.ts 中的逻辑一致）
 */
function verifyToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return null;

    const [userId, timestampStr, hmac] = parts;
    const timestamp = parseInt(timestampStr, 10);

    if (Date.now() - timestamp > TOKEN_EXPIRY_MS) return null;

    const payload = `${userId}:${timestamp}`;
    const expectedHmac = crypto
      .createHmac("sha256", SECRET)
      .update(payload)
      .digest("hex");

    if (hmac !== expectedHmac) return null;

    return userId;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 只拦截 /api/* 路由
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // 公开路由直接放行
  if (PUBLIC_API_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 从 Authorization header 或 cookie 获取 token
  const authHeader = request.headers.get("authorization");
  let token: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else {
    const cookieToken = request.cookies.get("auth_token")?.value;
    if (cookieToken) {
      token = cookieToken;
    }
  }

  // 验证 token
  if (!token) {
    return NextResponse.json(
      { success: false, error: "未登录，请先登录" },
      { status: 401 }
    );
  }

  const userId = verifyToken(token);
  if (!userId) {
    return NextResponse.json(
      { success: false, error: "登录已过期，请重新登录" },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
