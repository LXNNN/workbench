const CACHE = "ws-cache-v2";
const ASSETS = [".", "index.html", "icon-192.png", "icon-512.png", "manifest.webmanifest"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  // 跨域请求（如热榜 API、外部资源）不进缓存，始终走网络 —— 保证爆款视频每日刷新、数据最新
  if (url.origin !== self.location.origin) return;
  // 同源资源：网络优先，失败再回退缓存（断网时仍可打开，联网即拿到最新版）
  e.respondWith(
    fetch(e.request).then((resp) => {
      const copy = resp.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
      return resp;
    }).catch(() => caches.match(e.request).then((c) => c || caches.match("index.html")))
  );
});
