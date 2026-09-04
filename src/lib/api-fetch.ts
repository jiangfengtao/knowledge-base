/**
 * 带 Authorization header 的 fetch 封装
 * 自动从 localStorage 读取 token 并附加到请求头
 * 同时依赖 httpOnly cookie 作为备用认证方式
 */
export async function apiFetch(
  input: string | URL,
  init?: RequestInit
): Promise<Response> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const headers = new Headers(init?.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // 如果没有手动设置 Content-Type 且有 body，自动加上
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(input, { ...init, headers });
}
