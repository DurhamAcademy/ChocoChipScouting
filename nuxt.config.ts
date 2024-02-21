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
  plugins: [
      '~/plugins/vuetify.ts'
  ],
  devtools: { enabled: true },
  ssr: false,
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  logLevel: "verbose",
  runtimeConfig:{
    TBA_Key: process.env.TBA_KEY,
  },
  colorMode: {
    preference: 'light' //eventually we will add color mode preference
  },
  tailwindcss:{
    config:{
      theme: {
        extend: {
          width: {
            '7/24': '29.1666666667%',
          },
          colors: {
            coral: {
              '50': '#fef3f2',
              '100': '#fee4e2',
              '200': '#fececa',
              '300': '#fcaca5',
              '400': '#f88379',
              '500': '#ee5245',
              '600': '#db3527',
              '700': '#b9281c',
              '800': '#99251b',
              '900': '#7f251d',
              '950': '#450f0a',
            }
          }
        }
      }
    }
  }
})
