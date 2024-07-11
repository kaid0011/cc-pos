import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from "node:url";
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    },
  },
  plugins: [
    vue({
      template: { transformAssetUrls }
    }),
    quasar({
      sassVariables: './src/quasar-variables.sass',
      boot: ['./src/boot/capacitor'] // Correct path to the boot file
    }),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'My PWA Project',
        short_name: 'PWA',
        description: 'A Quasar Framework app with Vite',
        display: 'standalone',
        start_url: '/',
        background_color: '#ffffff',
        theme_color: '#027be3',
        icons: [
          {
            src: 'icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: 'icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              }
            }
          }
        ]
      }
    })
  ]
});
