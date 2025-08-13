import { precacheAndRoute } from 'workbox-precaching'
import { setCatchHandler, registerRoute } from 'workbox-routing'
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
} from 'workbox-strategies'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { BackgroundSyncPlugin } from 'workbox-background-sync'
import { warmStrategyCache } from 'workbox-recipes'

// Precache all manifest assets
const seen = new Set()
const cleaned = (self.__WB_MANIFEST || []).filter((entry) => {
  const url = entry.url.split('?')[0]
  if (seen.has(url)) return false
  seen.add(url)
  return true
})
precacheAndRoute(cleaned)

const offlineFallbackPage = '/offline.html'

// Cache important fallback assets during install
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker installing...')
  self.skipWaiting()
  event.waitUntil(
    caches.open('offline-fallbacks').then((cache) => {
      console.log('🔄 Caching offline fallbacks...')
      return cache.addAll([
        offlineFallbackPage,
        '/assets/logo0.png',
        '/assets/welcompage2.jpg',
        '/manifest.json',
        '/', // Main app shell - critical for SPA routing
        '/main.css', // If exists
      ]).catch(err => {
        console.log('⚠️ Some resources failed to cache (this is normal):', err)
      })
    })
  )
})

self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activated')
  clients.claim()
  
  // Clean up old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName.includes('old-cache-name')) {
            console.log('🗑️ Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Offline HTML fallback for document navigations
setCatchHandler(async ({ event }) => {
  const cache = await caches.open('offline-fallbacks')
  
  // For navigation requests (page loads), serve offline fallback or cached page
  if (event.request.destination === 'document') {
    console.log('🔄 Navigation request for:', event.request.url)
    
    const url = new URL(event.request.url)
    
    // For SPA routes, always serve the main app shell
    if (url.pathname !== '/' && !url.pathname.includes('.')) {
      console.log('📱 SPA route detected, serving main app shell')
      const mainApp = await cache.match('/')
      if (mainApp) {
        console.log('✅ Serving cached main app for SPA routing')
        return mainApp
      }
    }
    
    // Try to serve cached version of the requested page first
    const cachedResponse = await cache.match(url.pathname)
    if (cachedResponse) {
      console.log('📚 Serving cached page:', url.pathname)
      return cachedResponse
    }
    
    // If no cached page, serve the main app shell for SPA routing
    const mainApp = await cache.match('/')
    if (mainApp) {
      console.log('🏠 Serving main app shell as fallback')
      return mainApp
    }
    
    // Last resort: offline fallback page
    console.log('🚫 Serving offline fallback page')
    return (await cache.match(offlineFallbackPage)) || Response.error()
  }
  
  console.log('❌ Non-document request failed:', event.request.url)
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

// SPA routing - enhanced for offline navigation
registerRoute(
  ({ request }) => request.mode === 'navigate',
  async ({ event }) => {
    try {
      // Try network first with short timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)
      
      const response = await fetch(event.request, {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      
      // Cache successful responses for offline use
      if (response && response.status === 200) {
        const cache = await caches.open('pages')
        cache.put(event.request, response.clone())
      }
      
      return response
    } catch (error) {
      console.log('🔄 Navigation offline - serving cached SPA root for:', event.request.url)
      
      // For offline navigation, always serve the root index.html
      // This allows React Router to handle all routing client-side
      const cache = await caches.open('offline-fallbacks')
      
      // Try to get the main app shell
      const cachedRoot = await cache.match('/')
      if (cachedRoot) {
        console.log('✅ Serving cached SPA root')
        return cachedRoot
      }
      
      // Fallback to any cached HTML
      const precacheCache = await caches.open('workbox-precache-v2')
      const keys = await precacheCache.keys()
      for (const request of keys) {
        if (request.url.includes('index.html')) {
          const cachedResponse = await precacheCache.match(request)
          if (cachedResponse) {
            console.log('✅ Serving precached index.html')
            return cachedResponse
          }
        }
      }
      
      // Last resort: offline page
      return cache.match(offlineFallbackPage) || Response.error()
    }
  }
)

// Images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
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

// Login API - allow offline access since we have offline credentials
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/login'),
  new NetworkFirst({
    cacheName: 'login-api-cache',
    networkTimeoutSeconds: 5,
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  })
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
