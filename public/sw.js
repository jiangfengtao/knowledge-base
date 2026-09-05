// 晓桃终生成长 - Service Worker
const CACHE_NAME = "xiaotao-v1";
const STATIC_CACHE = "xiaotao-static-v1";
const RUNTIME_CACHE = "xiaotao-runtime-v1";

// 预缓存的静态资源
const PRECACHE_URLS = [
  "/",
  "/login",
  "/blog",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
];

// 安装时预缓存
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// 激活时清理旧缓存
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE && name !== RUNTIME_CACHE)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// 请求拦截策略
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API 请求：网络优先，不缓存
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // 静态资源：缓存优先
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?)$/)
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(request).then(
          (cached) =>
            cached ||
            fetch(request).then((response) => {
              cache.put(request, response.clone());
              return response;
            })
        )
      )
    );
    return;
  }

  // 页面请求：网络优先，回退缓存
  event.respondWith(
    fetch(request)
      .then((response) => {
        // 缓存成功的页面请求
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // 网络失败时回退缓存
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          // 离线回退页面
          if (request.headers.get("accept")?.includes("text/html")) {
            return caches.match("/login");
          }
        });
      })
  );
});
