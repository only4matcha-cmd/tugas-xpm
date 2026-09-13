// Service Worker untuk menangani background event (opsional untuk push notification dasar)
self.addEventListener('install', (event) => {
    console.log('Service Worker terpasang.');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker aktif.');
});

