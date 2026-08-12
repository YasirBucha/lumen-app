/* FCM requires this file at the hosting root. The app passes its public Firebase config in the registration URL. */
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js');

const configParam = new URL(self.location.href).searchParams.get('config');
if (configParam) {
  try {
    firebase.initializeApp(JSON.parse(configParam));
    const messaging = firebase.messaging();
    messaging.onBackgroundMessage((payload) => {
      const notification = payload.notification || {};
      self.registration.showNotification(notification.title || 'Lumen', {
        body: notification.body || 'A subscription needs your attention.',
        icon: '/icons/icon-192.svg',
        data: payload.data || {},
      });
    });
  } catch (error) {
    console.error('Lumen FCM worker failed to initialize', error);
  }
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const target = clients.find((client) => 'focus' in client);
      return target ? target.focus() : self.clients.openWindow('/alerts');
    }),
  );
});
