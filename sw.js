/* Web Push service worker for https://bols.dpdns.org */
self.addEventListener("install", event => { self.skipWaiting(); });
self.addEventListener("activate", event => { event.waitUntil(self.clients.claim()); });
self.addEventListener("push", event => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; }
  catch (_) { payload = { body: event.data ? event.data.text() : "有新通知" }; }
  const title = String(payload.title || "無垠伺服器通知");
  const options = {
    body: String(payload.body || "你有一則新通知"),
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: `${payload.type || "message"}-${payload.channel || "server"}-${Date.now()}`,
    renotify: false,
    data: { url: String(payload.url || "https://bols.dpdns.org/") }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
self.addEventListener("notificationclick", event => {
  event.notification.close();
  const targetUrl = new URL(String(event.notification.data?.url || "https://bols.dpdns.org/"), self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      if (client.url.startsWith(self.location.origin) && "focus" in client) {
        await client.focus();
        if ("navigate" in client && client.url !== targetUrl) await client.navigate(targetUrl);
        return;
      }
    }
    await self.clients.openWindow(targetUrl);
  })());
});
