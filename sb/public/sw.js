// ── StudyBuddy Service Worker ─────────────────────────────────
// Handles: caching, scheduled background notifications
// Notifications fire even when the app tab is closed
// ─────────────────────────────────────────────────────────────

const CACHE = 'studybuddy-v2';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});

// ── Scheduled notification store ─────────────────────────────
// Map of { id → timeoutId } so we can cancel them
const scheduled = new Map();

// ── Message handler: app sends schedule commands ──────────────
self.addEventListener('message', e => {
  const { type, notifications } = e.data || {};

  if (type === 'SCHEDULE_NOTIFICATIONS') {
    // Cancel all existing timers first
    scheduled.forEach(id => clearTimeout(id));
    scheduled.clear();

    // Schedule each notification
    (notifications || []).forEach(n => {
      const delay = n.fireAt - Date.now();
      if (delay < 0) return; // already past
      const tid = setTimeout(() => {
        self.registration.showNotification(n.title, {
          body:  n.body,
          icon:  '/icon.png',
          badge: '/icon.png',
          tag:   n.tag,
          requireInteraction: false,
          data: { url: '/' },
        });
      }, delay);
      scheduled.set(n.tag, tid);
    });
  }

  if (type === 'CANCEL_NOTIFICATION') {
    // Block was ticked — cancel its pending alert
    const tid = scheduled.get(e.data.tag);
    if (tid !== undefined) {
      clearTimeout(tid);
      scheduled.delete(e.data.tag);
    }
  }
});

// ── Notification click → open app ────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      if (list.length) return list[0].focus();
      return clients.openWindow('/');
    })
  );
});
