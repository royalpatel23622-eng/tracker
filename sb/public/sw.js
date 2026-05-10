const CACHE = 'studybuddy-v1';
self.addEventListener('install', e => {
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
self.addEventListener('push', e => {
  const d = e.data?.json() ?? {};
  e.waitUntil(self.registration.showNotification(d.title || 'StudyBuddy', {
    body: d.body || 'Time to study!',
    icon: '/icon.png',
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/'));
});
