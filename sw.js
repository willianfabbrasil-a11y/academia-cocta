// Offline cache: the app opens without internet; data syncs when the connection returns.
const CACHE = "cocta-v1.0.2";
const CORE = ["./", "index.html", "styles.css", "app.js", "config.js", "manifest.webmanifest",
  "vendor/supabase.js", "vendor/jsQR.js", "vendor/qrcode.js",
  "img/logo.webp", "img/icon-192.png", "img/icon-512.png", "img/icon-180.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  const key = req.mode === "navigate" ? "index.html" : req;
  // stale-while-revalidate: answer from cache, refresh in background
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(key, {ignoreSearch: req.mode === "navigate"});
    const net = fetch(req).then(r => { if (r.ok) c.put(key, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
