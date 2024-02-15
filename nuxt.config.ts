// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  app: {
    head: {
      script: [
        {
          textContent: "window.global = window;"
        },
        {
          src: "https://cdn.jsdelivr.net/npm/pouchdb@8.0.1/dist/pouchdb.js"
        },
        {
          src: "https://github.com/pouchdb-community/pouchdb-authentication/releases/download/v1.1.3/pouchdb.authentication.min.js"
        }
      ]
    }
  },
  build: {
    transpile: ['vuetify'],
  },
  modules: [
      '@nuxt/image',
      '@nuxt/ui',
  ],
  buildModules: ['@nuxtjs/pwa'],
  pwa: {
    manifest: {
      name: 'Fire hydrant surveyor',
      short_name: 'Hydrant Surveyor',
      lang: 'en',
      display: 'standalone',
    },
    workbox: {
      enabled: true
    }
  },
  plugins: [
      '~/plugins/vuetify.ts'
  ],
  devtools: { enabled: true },
  ssr: false,
  ui: {
    global: true,
    primary: "rose",
    gray: "cool",
    notifications: {
      // Show toasts at the top right of the screen
      position: 'top-0 right-0'
    }
  },
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  logLevel: "verbose"
})
