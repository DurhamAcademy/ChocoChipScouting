// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  app: {
    head: {
      script: [
        {
          textContent: "window.global = window;"
        },
        {
          src: "//cdn.jsdelivr.net/npm/pouchdb@8.0.1/dist/pouchdb.js"
        },
        {
          src: "https://github.com/pouchdb-community/pouchdb-authentication/releases/download/v1.1.3/pouchdb.authentication.min.js"
        }
      ]
    }
  },
  modules: ['@nuxt/ui', './modules/databaseStarter'],
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
})
