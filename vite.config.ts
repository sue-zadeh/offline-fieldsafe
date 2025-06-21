import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'robots.txt',
        'logo0.png',
        // REMOVE: 'assets/icons/*' to avoid conflict
      ],
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
        globPatterns: ['**/*.{js,css,html,png,svg,webmanifest,ico}'],
        navigateFallback: '/offline.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts' },
          },
          {
            urlPattern: /\/assets\/icons\/.*\.png$/i,
            handler: 'CacheFirst',
            options: { cacheName: 'app-icons' },
          },
          {
            urlPattern: /^\/api\/.*$/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'api-cache' },
          },
        ],
      },
    }),
  ],
})
