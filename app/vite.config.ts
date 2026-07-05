import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'EntrenadorVirtual',
        short_name: 'Entrenador',
        description: 'Tu entrenador personal de gimnasio',
        theme_color: '#863bff',
        background_color: '#09090b',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'es',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Pre-cache JS/CSS/fonts/small assets only — exercise images are too
        // large to precache and are handled by runtimeCaching below.
        globPatterns: ['**/*.{js,css,html,ico,svg,woff,woff2}', 'icon-*.png'],
        runtimeCaching: [
          {
            // Exercise images: cache on first visit, serve from cache thereafter
            urlPattern: /\/images\/ejercicios\/.+\.png$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'exercise-images',
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Supabase API: network-first with offline fallback
            urlPattern: /^https:\/\/.*supabase\.co\//i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              networkTimeoutSeconds: 10,
            },
          },
        ],
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
})
