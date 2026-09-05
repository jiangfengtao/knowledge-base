/**
 * 简单的内存速率限制器
 * 用于防止暴力破解和滥用
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const limitMap = new Map<string, RateLimitEntry>();

// 定期清理过期条目
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of limitMap.entries()) {
    if (now > entry.resetTime) {
      limitMap.delete(key);
    }
  }
}, 60000); // 每分钟清理一次

/**
 * 检查速率限制
 * @param identifier - 标识符（如 IP 地址 + 邮箱）
 * @param maxAttempts - 最大尝试次数
 * @param windowMs - 时间窗口（毫秒）
 * @returns { allowed: boolean, remaining: number, resetAfter: number }
 */
export function rateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15分钟
): { allowed: boolean; remaining: number; resetAfter: number } {
  const now = Date.now();
  const entry = limitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    limitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: maxAttempts - 1, resetAfter: windowMs };
  }

  entry.count++;

  if (entry.count > maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      resetAfter: entry.resetTime - now,
    };
  }

  return {
    allowed: true,
    remaining: maxAttempts - entry.count,
    resetAfter: entry.resetTime - now,
  };
}

/**
 * 从请求中获取客户端 IP
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}
