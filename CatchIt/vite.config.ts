import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      devOptions: {
        enabled: true,
        type: 'module',
      },
      includeAssets: ['icons/*.png', 'gtfs-static/*.json'],
      manifest: {
        name: 'Catch It',
        short_name: 'Catch It',
        description: 'Galway City Bus Tracker',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icons/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.nationaltransport\.ie/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'gtfs-rt-cache',
              expiration: {
                maxAgeSeconds: 60,
                maxEntries: 10,
              },
            },
          },
          {
            urlPattern: /^https:\/\/maps\.googleapis\.com/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'maps-cache',
              expiration: {
                maxAgeSeconds: 600,
                maxEntries: 20,
              },
            },
          },
        ],
      },
    }),
  ],
})
