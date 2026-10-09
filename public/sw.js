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
      icon: "/favicon.ico",
      badge: "/favicon.ico",
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
