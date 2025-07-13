import { precacheAndRoute } from 'workbox-precaching'
import {
  setCatchHandler,
  setDefaultHandler,
  registerRoute,
} from 'workbox-routing'
import {
  CacheFirst,
  NetworkOnly,
  NetworkFirst,
  StaleWhileRevalidate,
} from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { BackgroundSyncPlugin } from 'workbox-background-sync'
import { warmStrategyCache } from 'workbox-recipes';

const bgSyncPlugin = new BackgroundSyncPlugin('api-queue', {
  maxRetentionTime: 24 * 60,
})

const offlineFallbackPage = '/offline.html'

precacheAndRoute(self.__WB_MANIFEST || [])

self.addEventListener('install', (event) => {
  clients.claim();
  event.waitUntil(
    caches.open('offline-fallbacks').then((cache) =>
      cache.addAll([
        offlineFallbackPage,
        '/logo0.png',
        '/manifest.json',
        '/', // fallback for React SPA
      ])
    )
  )
})

setCatchHandler(async ({ event }) => {
  const cache = await caches.open('offline-fallbacks')
  if (event.request.destination === 'document') {
    return (await cache.match(offlineFallbackPage)) || Response.error()
  }
  return Response.error()
})

//=== precache key pages
const cacheFallbackStrategy = new CacheFirst()
warmStrategyCache({
  urls: [
    '/',
    '/home',
    '/volunteer',
    '/registervolunteer',
    '/activity-notes',
    '/addactivity',
    '/activitytabs',
    '/searchactivity',
    '/addproject',
    '/searchproject',
    '/report',
    '/addrisk',
    '/addhazard',
    '/groupadmin',
    '/fieldstaff',
    '/teamlead',
    '/registerroles',
    '/login',
    '/activitychecklist',
    '/activitytabs',
    '/activityvolunteers',
    '/activityoutcome',
    '/activityrisk',
    '/activityhazard',
    '/activitycomplete',
    '/offline.html',
  ],
  strategy: cacheFallbackStrategy,
})


// === Offline SPA Routing ===
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
)

// === Static assets: CSS, JS, Workers
registerRoute(
  ({ request }) => ['style', 'script', 'worker'].includes(request.destination),
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
)

// === Google Fonts
registerRoute(
  ({ url }) =>
    url.origin.includes('googleapis') || url.origin.includes('gstatic'),
  new CacheFirst({
    cacheName: 'google-fonts',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
)

// === API: Volunteers (sync offline later)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/volunteers'),
  new NetworkFirst({
    cacheName: 'volunteers-api-cache',
    plugins: [bgSyncPlugin, new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
)

// === API: Generic
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 5,
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
)

console.log('✅ Custom Service Worker Loaded')
