import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 不需要认证的 API 路由
const PUBLIC_API_ROUTES = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/seed",
  "/api/webhook",
];

// Token 有效期：30 天
const TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;
const SECRET = process.env.AUTH_SECRET || "xiaotao-dev-secret-change-in-prod";

/**
 * 使用 Web Crypto API 验证 token（Edge Runtime 兼容）
 * 格式：base64(userId:timestamp:hmac)
 */
async function verifyToken(token: string): Promise<string | null> {
  try {
    // atob 在 Edge Runtime 中可用
    const decoded = atob(token);
    const parts = decoded.split(":");
    if (parts.length !== 3) return null;

    const [userId, timestampStr, hmac] = parts;
    const timestamp = parseInt(timestampStr, 10);

    if (Date.now() - timestamp > TOKEN_EXPIRY_MS) return null;

    // 使用 Web Crypto API 计算 HMAC
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const payload = `${userId}:${timestamp}`;
    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(payload)
    );

    // 将签名转为 hex 字符串
    const expectedHmac = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (hmac !== expectedHmac) return null;

    return userId;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
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

  const userId = await verifyToken(token);
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
