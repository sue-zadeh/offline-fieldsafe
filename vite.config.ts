import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'logo0.png'],
      manifest: {
        name: 'FieldSafe',
        short_name: 'FieldSafe',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0a0e2c',
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
        globPatterns: ['**/*.{js,css,html,png,svg,webmanifest,ico}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/(fonts\.googleapis|gstatic)\.com\//,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts' },
          },
          {
            urlPattern: /\/assets\/icons\/.*\.png$/i,
            handler: 'CacheFirst',
            options: { cacheName: 'app-icons' },
          },
          {
            urlPattern: /\/api\/v.*$/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache' },
          },
        ],
        additionalManifestEntries: [
          { url: '/volunteer', revision: null },
          { url: '/registervolunteer', revision: null },
          { url: '/activity-notes', revision: null },
          { url: '/addactivity', revision: null },
          { url: '/searchactivity', revision: null },
          { url: '/projects', revision: null },
          { url: '/addproject', revision: null },
          { url: '/searchproject', revision: null },
          { url: '/report', revision: null },
          { url: '/addrisk', revision: null },
          { url: '/addhazard', revision: null },
          { url: '/groupadmin', revision: null },
          { url: '/fieldstaff', revision: null },
          { url: '/teamlead', revision: null },
          { url: '/registerroles', revision: null },
          { url: '/home', revision: null },
          { url: '/login', revision: null },
          { url: '/activitychecklist', revision: null },
          { url: '/activitytabs', revision: null },
          { url: '/activityvolunteers', revision: null },
          { url: '/activityoutcome', revision: null },
          { url: '/activityrisk', revision: null },
          { url: '/activityhazard', revision: null },
          { url: '/activitycomplete', revision: null },
          { url: '/navbar', revision: null },
        ],
      },
    }),
  ],
})
