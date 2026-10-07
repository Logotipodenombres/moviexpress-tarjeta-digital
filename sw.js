const CACHE_NAME = 'moviexpress-card-v2'
const BASE = self.registration.scope
const CORE_ASSETS = ['', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'].map((asset) => new URL(asset, BASE).href)

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('moviexpress-card-') && key !== CACHE_NAME).map((key) => caches.delete(key))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(BASE)) return
  event.respondWith(
    fetch(event.request).then((response) => {
      if (response.ok && (event.request.mode === 'navigate' || CORE_ASSETS.includes(event.request.url))) {
        const copy = response.clone()
        event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(event.request.mode === 'navigate' ? BASE : event.request, copy)))
      }
      return response
    }).catch(() => caches.match(event.request.mode === 'navigate' ? BASE : event.request))
  )
})
