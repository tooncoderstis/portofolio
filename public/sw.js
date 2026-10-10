const CACHE_VERSION = "v1";
const PRECACHE = `portofolio-precache-${CACHE_VERSION}`;
const RUNTIME = `portofolio-runtime-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline";
const PRECACHE_URLS = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE);

      await Promise.all(
        PRECACHE_URLS.map(async (url) => {
          try {
            const response = await fetch(url, { cache: "reload" });
            if (response.ok) await cache.put(url, response);
          } catch {
            // lewati aset yang gagal di-precache
          }
        }),
      );

      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      const keep = new Set([PRECACHE, RUNTIME]);

      await Promise.all(
        keys.filter((key) => !keep.has(key)).map((key) => caches.delete(key)),
      );

      await self.clients.claim();
    })(),
  );
});

function isStaticAsset(pathname) {
  return (
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/icons") ||
    /\.(?:css|js|woff2?|png|jpg|jpeg|svg|gif|webp|avif|ico)$/.test(pathname)
  );
}

async function networkFirstNavigation(request) {
  try {
    return await fetch(request);
  } catch {
    const offline = await caches.match(OFFLINE_URL);

    return offline ?? Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(request);

  if (cached) {
    fetch(request)
      .then((response) => {
        if (response && response.ok) cache.put(request, response.clone());
      })
      .catch(() => {});

    return cached;
  }

  const response = await fetch(request);

  if (response && response.ok) cache.put(request, response.clone());

  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
  }
});

self.addEventListener("push", (event) => {
  let data = { title: "Notifikasi hub", body: "", url: "/hub" };

  try {
    if (event.data) {
      data = Object.assign(data, event.data.json());
    }
  } catch {
    // biarkan memakai nilai default
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      data: { url: data.url || "/hub" },
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target =
    (event.notification.data && event.notification.data.url) || "/hub";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(target) && "focus" in client) {
            return client.focus();
          }
        }

        return self.clients.openWindow(target);
      }),
  );
});
