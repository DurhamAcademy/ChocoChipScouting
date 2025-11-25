// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';

export default defineNuxtConfig({
  modules: [
    '@nuxt/image',
    '@vite-pwa/nuxt',
    '@nuxt/ui',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', config => {
        // @ts-expect-error
        config.plugins.push(vuetify({ autoImport: true }));
      });
    },
  ],

  nitro: {
    preset: 'bun',
    compressPublicAssets: {
      brotli: false,
      gzip: true,
    },
  },

  app: {
    head: {
      script: [
        {
          textContent: 'window.global = window;',
        },
      ],
    },
  },

  build: {
    transpile: ['vuetify'],
  },

  image: {
    screens: {
      default: 320,
      xxs: 480,
      xs: 576,
      sm: 768,
      md: 996,
      lg: 1200,
      xl: 1367,
      xxl: 1600,
      '4k': 1921,
    },

    domains: ['img.youtube.com', 'i.vimeocdn.com'],

    alias: {
      youtube: 'https://img.youtube.com',
      vimeo: 'https://i.vimeocdn.com',
    },
  },

  pwa: {
    strategies: 'injectManifest',
    srcDir: 'service-worker',
    filename: 'sw.ts',
    registerType: 'autoUpdate',
    manifest: {
      name: 'DARC SIDE Scouting Webapp',
      short_name: '6502 Scout',
      theme_color: '#ee5245',
      icons: [
        {
          src: 'darcsidelogo.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'icon.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'icon.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    },
    workbox: {
      navigateFallback: '/dashboard',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
      // you don't need to include this: only for testing purposes
      // if enabling periodic sync for update use 1 hour or so (periodicSyncForUpdates: 3600)
      periodicSyncForUpdates: 20,
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallback: '/dashboard',
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },
  },

  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
    },
  },

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
    tbaKey: process.env.NUXT_TBA_KEY,
    couchDB: {
      hostname: process.env.NUXT_COUCH_DB_HOSTNAME || 'localhost',
      serverAdminUser: {
        username: process.env.NUXT_COUCH_DB_SERVER_ADMIN_USER_USERNAME,
        password: process.env.NUXT_COUCH_DB_SERVER_ADMIN_USER_PASSWORD,
      },
    },
  },

  sourcemap: {
    server: true,
    client: true,
  },

  colorMode: {
    preference: 'light', // default value of $colorMode.preference
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
            },
          },
        },
      },
    },
  },

  compatibilityDate: '2025-01-14',
});
