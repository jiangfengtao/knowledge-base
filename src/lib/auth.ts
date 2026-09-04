import crypto from "crypto";

// Token 有效期：30 天
const TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

// 内部签名密钥（与环境变量绑定，生产环境务必设置）
const SECRET = process.env.AUTH_SECRET || "xiaotao-dev-secret-change-in-prod";

/**
 * 生成安全 token（crypto 随机 + HMAC 签名）
 * 格式：base64(userId:timestamp:hmac)
 */
export function generateToken(userId: string): string {
  const timestamp = Date.now();
  const payload = `${userId}:${timestamp}`;
  const hmac = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("hex");

  const token = `${payload}:${hmac}`;
  return Buffer.from(token).toString("base64");
}

/**
 * 验证 token 并返回 userId
 * 返回 null 表示无效或过期
 */
export function verifyToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return null;

    const [userId, timestampStr, hmac] = parts;
    const timestamp = parseInt(timestampStr, 10);

    // 检查时间戳是否过期
    if (Date.now() - timestamp > TOKEN_EXPIRY_MS) return null;

    // 验证 HMAC 签名
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

/**
 * 从 Request 中提取并验证 token
 * 返回 userId 或 null
 */
export function getUserIdFromRequest(request: Request): string | null {
  // 从 Authorization header 获取
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    return verifyToken(token);
  }

  // 从 cookie 获取
  const cookieHeader = request.headers.get("cookie") || "";
  const tokenMatch = cookieHeader.match(/auth_token=([^;]+)/);
  if (tokenMatch) {
    return verifyToken(tokenMatch[1]);
  }

  return null;
}
