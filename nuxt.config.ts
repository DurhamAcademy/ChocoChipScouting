// https://nuxt.com/docs/api/configuration/nuxt-config
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'



export default defineNuxtConfig({
  // webpack: {
  //   aggressiveCodeRemoval: true,
  //   optimization: {
  //     minimize: true,
  //     splitChunks: {
  //       chunks: 'initial',
  //       cacheGroups: {
  //         vendor: {
  //           name: 'node_vendors',
  //           test: /[\\/]node_modules[\\/]/,
  //         }
  //       }
  //     }
  //   },
  // },
  // nitro: {
  //   compressPublicAssets: {
  //     brotli: true,
  //     gzip: true
  //   },
  // },
  app: {
    head: {
      script: [
        {
          textContent: "window.global = window;"
        }
        // {
        //   src: "https://cdn.jsdelivr.net/npm/pouchdb@8.0.1/dist/pouchdb.js"
        // },
        // {
        //   src: "https://github.com/pouchdb-community/pouchdb-authentication/releases/download/v1.1.3/pouchdb.authentication.min.js"
        // }
      ]
    }
  },
  build: {
    transpile: ['vuetify'],

  },
  modules: [
      '@nuxt/image',
    '@nuxtjs/pwa',
    '@nuxt/ui',
      (_options, nuxt) => {
        nuxt.hooks.hook('vite:extendConfig', (config) => {
          // @ts-expect-error
          config.plugins.push(vuetify({autoImport: true}))
        })
      },

  ],
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
  // image: {
  //   screens: {
  //     default: 320,
  //     xxs: 480,
  //     xs: 576,
  //     sm: 768,
  //     md: 996,
  //     lg: 1200,
  //     xl: 1367,
  //     xxl: 1600,
  //     '4k': 1921
  //   },
  //
  //   domains: ['img.youtube.com', 'i.vimeocdn.com'],
  //
  //   alias: {
  //     youtube: 'https://img.youtube.com',
  //     vimeo: 'https://i.vimeocdn.com',
  //   }
  // },
  buildModules: [
  //     'nuxt-speedkit',
  //     '@nuxtjs/pwa'
  ],
  pwa: {
    manifest: {
      name: 'DARC SIDE Webapp',
      short_name: '6502 App',
      lang: 'en',
      display: 'standalone'
    },
    meta: {
      name:"DARC SIDE App",
      theme_color: "#ee5245"
    },
    workbox: {
      enabled: true
    }
  },
  plugins: [
      '~/plugins/vuetify.ts'
  ],
  devtools: {enabled: true},
  ssr: true,
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
    couchDB: {
      hostname: (process.env.couchDBHostname===undefined)?process.env.couchDBHostname:"localhost",
      serverAdminUser: {
        username: process.env.COUCHDB_SERVER_USER,
        password: process.env.COUCHDB_SERVER_PASSWORD
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
