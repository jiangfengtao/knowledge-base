"use client";

/**
 * 全局 fetch 拦截器
 * 在模块加载时立即 patch window.fetch，确保所有 API 请求都带上认证信息
 * 不依赖 useEffect，避免子组件先执行 useEffect 导致拦截器未生效
 */

let isPatched = false;

function patchFetch() {
  if (isPatched || typeof window === "undefined") return;
  isPatched = true;

  const originalFetch = window.fetch;

  window.fetch = function (
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    const isApiCall = url.startsWith("/api/") || url.includes("/api/");

    if (isApiCall) {
      const token = localStorage.getItem("auth_token");

      if (token) {
        const headers = new Headers(init?.headers);
        if (!headers.has("Authorization")) {
          headers.set("Authorization", `Bearer ${token}`);
        }
        if (init?.body && !headers.has("Content-Type")) {
          headers.set("Content-Type", "application/json");
        }
        return originalFetch(input, { ...init, headers });
      }
    }

    return originalFetch(input, init);
  };
}

// 立即执行 patch（模块加载时）
patchFetch();

export default function AuthFetchProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // 确保 patch 已生效（处理 HMR 等情况）
  patchFetch();
  return <>{children}</>;
}
