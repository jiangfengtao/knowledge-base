// 晓桃自学英语 - Service Worker (优化版)
const CACHE_VERSION = "xiaotao-v2";
const STATIC_CACHE = `xiaotao-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `xiaotao-runtime-${CACHE_VERSION}`;
const PAGE_CACHE = `xiaotao-page-${CACHE_VERSION}`;

// 预缓存的静态资源
const PRECACHE_URLS = [
  "/",
  "/login",
  "/blog",
  "/about",
  "/videos",
  "/timeline",
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
      .then((cache) =>
        Promise.allSettled(
          PRECACHE_URLS.map((url) =>
            cache.add(url).catch(() => {
              // 预缓存失败不影响安装
            })
          )
        )
      )
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
            .filter(
              (name) =>
                name !== STATIC_CACHE &&
                name !== RUNTIME_CACHE &&
                name !== PAGE_CACHE
            )
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

  // 只处理同源请求
  if (url.origin !== self.location.origin) return;

  // API 请求：网络优先，不缓存
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // GET 请求以外的请求直接放行
  if (request.method !== "GET") return;

  // 静态资源：缓存优先（长期缓存）
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|avif|webp)$/)
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) =>
        cache.match(request).then(
          (cached) =>
            cached ||
            fetch(request).then((response) => {
              // 只缓存有效的响应
              if (response.status === 200) {
                cache.put(request, response.clone());
              }
              return response;
            })
        )
      )
    );
    return;
  }

  // HTML 页面：stale-while-revalidate 策略
  // 先返回缓存（快），同时在后台更新缓存（新）
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      caches.open(PAGE_CACHE).then(async (cache) => {
        const cached = await cache.match(request);

        // 后台更新
        const networkFetch = fetch(request)
          .then((response) => {
            if (response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cached);

        // 有缓存就先返回缓存，没有就等网络请求
        return cached || networkFetch;
      })
    );
    return;
  }

  // 其他资源：网络优先，回退缓存
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
