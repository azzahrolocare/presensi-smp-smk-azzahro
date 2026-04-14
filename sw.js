const CACHE_NAME = 'presensi-azzahro-v1.0.2';
const OFFLINE_URL = './offline.html';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './offline.html',
  './manifest.json',
  './logo-smp-azzahro.png',
  './logo-smk-azzahro.png',
  'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js',
  './icon-apk-presensi-azzahro.png'
];

// Install: Simpan semua aset ke cache
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('SW: Menyiapkan Cache Az-Zahro...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate: Hapus cache lama
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('SW: Menghapus Cache Lama:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch: Logika cerdas untuk aset vs API
self.addEventListener('fetch', (e) => {
  // PENTING: Jangan masukkan permintaan ke Google Script ke dalam Cache
  // Biarkan file index.html yang menangani logika offline-nya sendiri
  if (e.request.url.includes('script.google.com')) {
    return; 
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(e.request).catch(() => {
        // Jika benar-benar offline dan meminta halaman
        if (e.request.mode === 'navigate' || (e.request.method === 'GET' && e.request.headers.get('accept').includes('text/html'))) {
          return caches.match(OFFLINE_URL);
        }
      });
    })
  );
});
