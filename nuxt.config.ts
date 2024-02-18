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
      '@nuxt/ui',
      (_options, nuxt) => {
        nuxt.hooks.hook('vite:extendConfig', (config) => {
          // @ts-expect-error
          config.plugins.push(vuetify({autoImport: true}))
        })
      }
  ],
  buildModules: ['@nuxtjs/pwa'],
  pwa: {
    manifest: {
      name: 'DARC SIDE Webapp',
      short_name: '6502 App',
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
  ssr: true,
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
  logLevel: "verbose",
  runtimeConfig: {
    couchDB: {
      hostname: (process.env.couchDBHostname===undefined)?process.env.couchDBHostname:"localhost",
      serverAdminUser: {
        username: process.env.COUCHDB_SERVER_USER,
        password: process.env.COUCHDB_SERVER_PASSWORD
      }
    }
  }
})
