import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

/**
 * 从 cookie 中获取当前登录用户（服务端组件使用）
 */
export async function getCurrentUser() {
  const token = cookies().get("auth_token")?.value;
  if (!token) return null;

  try {
    const decoded = atob(token);
    const parts = decoded.split(":");
    if (parts.length !== 3) return null;

    const [userId, timestampStr, hmac] = parts;
    const timestamp = parseInt(timestampStr, 10);
    const TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

    if (Date.now() - timestamp > TOKEN_EXPIRY_MS) return null;

    // 验证 HMAC（简化版，实际和 middleware 一致）
    const SECRET =
      process.env.AUTH_SECRET || "xiaotao-dev-secret-change-in-prod";
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
    const expectedHmac = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (hmac !== expectedHmac) return null;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        isMember: true,
        memberTier: true,
        memberExpiresAt: true,
      },
    });

    return user;
  } catch {
    return null;
  }
}
