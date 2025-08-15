import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      srcDir: 'public',
      filename: 'service-worker.js',
      includeAssets: [
        'favicon.svg',
        'robots.txt',
        'logo0.png',
        'logo-lil.png',
        'offline.html',
        // Removed large images - they'll be cached on-demand via runtime caching
      ],
      devOptions: {
        enabled: true, // ✅ see service worker working in dev mode
      },
      manifest: {
        name: 'FieldSafe',
        short_name: 'FieldSafe',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0094B6',
        icons: [
          {
            src: '/assets/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/assets/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\/.*$/], // Don't fallback for API routes
        globPatterns: ['**/*.{js,css,html,png,svg,json}'], // Removed jpg to avoid large files
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB limit instead of default 2MB
        additionalManifestEntries: [
          { url: '/', revision: null }, // Add explicit root entry
          { url: '/volunteer', revision: null },
          { url: '/registervolunteer', revision: null },
          { url: '/activitytabs', revision: null },
          { url: '/addactivity', revision: null },
          { url: '/searchactivity', revision: null },
          { url: '/projects', revision: null },
          { url: '/AddProject', revision: null },
          { url: '/addobjective', revision: null },
          { url: '/addrisk', revision: null },
          { url: '/addhazard', revision: null },
          { url: '/searchproject', revision: null },
          { url: '/report', revision: null },
          { url: '/groupadmin', revision: null },
          { url: '/fieldstaff', revision: null },
          { url: '/teamlead', revision: null },
          { url: '/registerroles', revision: null },
          { url: '/home', revision: null },
          { url: '/login', revision: null },
          { url: '/activitychecklist', revision: null },
          { url: '/activityvolunteers', revision: null },
          { url: '/activityoutcome', revision: null },
          { url: '/activityrisk', revision: null },
          { url: '/activityhazard', revision: null },
          { url: '/activitycomplete', revision: null },
          { url: '/navbar', revision: null },
        ],
        runtimeCaching: [
          // API requests - NetworkFirst with fallback
          {
            urlPattern: /^https?:\/\/localhost:5000\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 100 },
            },
          },
          {
            urlPattern: /\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache-local',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 100 },
            },
          },
          // Images
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: { 
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
              },
            },
          },
          // Large images with shorter timeout
          {
            urlPattern: /\.(jpg|jpeg)$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'large-image-cache',
              networkTimeoutSeconds: 2,
              expiration: { 
                maxEntries: 20,
                maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days for large images
              },
            },
          },
        ],
      },
    }),
  ],

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
