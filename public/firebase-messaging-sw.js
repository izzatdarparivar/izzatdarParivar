// public/firebase-messaging-sw.js
// Firebase Cloud Messaging Service Worker
// This file MUST be served at the root path /firebase-messaging-sw.js

importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAkLw9892W8h5SVWwgtrXtzbCcIZTc3ECU",
  authDomain: "izzatdarparivar-ce388.firebaseapp.com",
  projectId: "izzatdarparivar-ce388",
  storageBucket: "izzatdarparivar-ce388.firebasestorage.app",
  messagingSenderId: "1003028220196",
  appId: "1:1003028220196:web:8ac689e82f28962356cbb1",
});

const messaging = firebase.messaging();

// Handle background messages (app is in background or closed)
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message", payload);

  const notificationTitle = payload.notification?.title || "New notification";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    data: payload.data || {},
    tag: payload.data?.tag || "default",
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
