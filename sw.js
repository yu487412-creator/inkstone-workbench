/* 端砚工作台 Service Worker：离线缓存 app shell */
// 每次改代码后，把 CACHE 名称里的版本号 +1，否则旧版 HTML 会被永久缓存
const CACHE = "inkstone-workbench-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* 网络优先，失败回退缓存（API 请求永不缓存） */
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // 跨域（API）不接管
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const cp = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, cp)).catch(()=>{});
        return res;
      })
      .catch(() => caches.match(e.request).then(m => m || caches.match("./index.html")))
  );
});
