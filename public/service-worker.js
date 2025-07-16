import { precacheAndRoute } from 'workbox-precaching'
import {
  setCatchHandler,
  registerRoute,
} from 'workbox-routing'
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
} from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { BackgroundSyncPlugin } from 'workbox-background-sync'
import { warmStrategyCache } from 'workbox-recipes'

// Precache all manifest assets
precacheAndRoute(self.__WB_MANIFEST || [])

const offlineFallbackPage = '/offline.html'

// Cache important fallback assets during install
self.addEventListener('install', (event) => {
  self.skipWaiting()
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

self.addEventListener('activate', () => {
  clients.claim()
})

// Offline HTML fallback for document navigations
setCatchHandler(async ({ event }) => {
  const cache = await caches.open('offline-fallbacks')
  if (event.request.destination === 'document') {
    return (await cache.match(offlineFallbackPage)) || Response.error()
  }
  return Response.error()
})

// Pre-cache route pages for offline navigation
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

// SPA routing
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
)

// CSS/JS/Workers
registerRoute(
  ({ request }) => ['style', 'script', 'worker'].includes(request.destination),
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
)

// Google Fonts
registerRoute(
  ({ url }) =>
    url.origin.includes('googleapis') || url.origin.includes('gstatic'),
  new CacheFirst({
    cacheName: 'google-fonts',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
)

// Block login while offline
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/login'),
  async ({ event }) => {
    if (!self.navigator.onLine) {
      return new Response(
        JSON.stringify({ error: 'Login requires internet connection' }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }
    return fetch(event.request)
  },
  'GET'
)

// Volunteers API with background sync
const bgSyncPlugin = new BackgroundSyncPlugin('api-queue', {
  maxRetentionTime: 24 * 60,
})

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/volunteers'),
  new NetworkFirst({
    cacheName: 'volunteers-api-cache',
    plugins: [
      bgSyncPlugin,
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  })
)

// Other API endpoints
registerRoute(
  ({ url }) =>
    url.pathname.startsWith('/api/') && !url.pathname.startsWith('/api/login'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 5,
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
)

console.log('✅ Custom Service Worker Loaded')
