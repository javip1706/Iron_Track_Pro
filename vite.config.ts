import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
<<<<<<< HEAD
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'IronTrack Pro - Rutinas de Gimnasio',
        short_name: 'IronTrack',
        description: 'Tu compañero de gimnasio inteligente para crear rutinas y registrar entrenamientos',
=======
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'IronTrack Pro',
        short_name: 'IronTrack',
        description: 'Tu compañero de gimnasio inteligente',
>>>>>>> f85590b40641f2c44eaee5c7a1ec0c3d003c23b9
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
<<<<<<< HEAD
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'apple touch icon'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
=======
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
>>>>>>> f85590b40641f2c44eaee5c7a1ec0c3d003c23b9
          }
        ]
      }
    })
  ],
<<<<<<< HEAD
  build: {
    outDir: 'dist',
    sourcemap: false
  }
=======
>>>>>>> f85590b40641f2c44eaee5c7a1ec0c3d003c23b9
});