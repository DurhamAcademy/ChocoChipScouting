// https://nuxt.com/docs/api/configuration/nuxt-config
// import setupCouchDB from "~/hooks/setupCouchDB";

export default defineNuxtConfig({
  app: {
    head: {
      script: [
        {
          textContent: "window.global = window;"
        },
        {
          src: "//cdn.jsdelivr.net/npm/pouchdb@8.0.1/dist/pouchdb.min.js"
        },
        {
          src: "https://github.com/pouchdb-community/pouchdb-authentication/releases/download/v1.1.3/pouchdb.authentication.min.js"
        }
      ]
    }
  },
  modules: ['@nuxt/ui'],
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
    primary: "rose",
    notifications: {
      // Show toasts at the top right of the screen
      position: 'top-0 right-0'
    }
  }
})
