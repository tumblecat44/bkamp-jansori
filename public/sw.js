// Service Worker for Push Notifications
self.addEventListener("push", function (event) {
  if (!event.data) return;

  let title = "잔소리 도착";
  let body = "";

  try {
    // JSON 형식이면 파싱
    const data = event.data.json();
    title = data.title || title;
    body = data.body || "";
  } catch (e) {
    // JSON이 아니면 텍스트로 처리
    body = event.data.text();
  }

  const options = {
    body: body,
    vibrate: [100, 50, 100],
    data: {
      url: "/",
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window" }).then(function (clientList) {
      for (const client of clientList) {
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url || "/");
      }
    })
  );
});
