// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

var sw = true;
export default defineNuxtConfig({
  modules: [
    '@nuxt/image',
    '@vite-pwa/nuxt',
    '@nuxt/ui',
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        // @ts-expect-error
        config.plugins.push(vuetify({autoImport: true}))
      })
    },
  ],
  webpack: {
    aggressiveCodeRemoval: true,
    optimization: {
      minimize: true,
      splitChunks: {
        chunks: 'initial',
        cacheGroups: {
          vendor: {
            name: 'node_vendors',
            test: /[\\/]node_modules[\\/]/,
          }
        }
      }
    },
  },
  nitro: {
    preset: 'bun',
    compressPublicAssets: {
      brotli: false,
      gzip: true
    },

  },
  app: {
    head: {
      script: [
        {
          textContent: "window.global = window;"
        }
      ]
    }
  },
  build: {
    transpile: ['vuetify'],

  },
  // speedkit: {
  //
  //   detection: {
  //     performance: true,
  //     browserSupport: true
  //   },
  //
  //   performanceMetrics: {
  //     device: {
  //       hardwareConcurrency: { min: 2, max: 48 },
  //       deviceMemory: { min: 2 }
  //     },
  //     timing: {
  //       fcp: 800,
  //       dcl: 1200
  //     }
  //   },
  //
  //   componentAutoImport: false,
  //   componentPrefix: undefined,
  //
  //   /**
  //    * IntersectionObserver rootMargin for Components and Assets
  //    */
  //   lazyOffset: {
  //     component: '0%',
  //     asset: '0%'
  //   }
  //
  // },
  //
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
      '4k': 1921
    },

    domains: ['img.youtube.com', 'i.vimeocdn.com'],

    alias: {
      youtube: 'https://img.youtube.com',
      vimeo: 'https://i.vimeocdn.com',
    }
  },
  // buildModules: [
  //     'nuxt-speedkit',
  //     '@nuxtjs/pwa'
  // ],
  pwa: {
    strategies: sw ? 'injectManifest' : 'generateSW',
    srcDir: sw ? 'service-worker' : undefined,
    filename: sw ? 'sw.ts' : undefined,
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
  plugins: [
      '~/plugins/vuetify.ts'
  ],
  devtools: {
    enabled: true,

    timeline: {
      enabled: true
    }
  },
  ssr: false,
  vite: {
    vue: {
      template: {
        transformAssetUrls,
      }
    }
  },
  logLevel: "verbose",
  runtimeConfig:{
    tbaKey: process.env.NUXT_TBA_KEY,
    couchDB: {
      hostname: (process.env.NUXT_COUCH_DB_HOSTNAME === undefined) ? process.env.NUXT_COUCH_DB_HOSTNAME:"localhost",
      serverAdminUser: {
        username: process.env.NUXT_COUCH_DB_SERVER_ADMIN_USER_USERNAME,
        password: process.env.NUXT_COUCH_DB_SERVER_ADMIN_USER_PASSWORD
      }
    }
  },
  sourcemap: {
    server: true,
    client: true
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