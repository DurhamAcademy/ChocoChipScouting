export default defineAppConfig({
  ui: {
    primary: 'coral',
    gray: 'cool',
  },
  buildModules: ['@nuxtjs/pwa'],
  pwa: {
    manifest: {
      name: 'DARC SIDE ChocoChip Scouting',
      short_name: 'ChocoChip Scouting',
      lang: 'en',
      display: 'standalone',
    },
    workbox: {
      enabled: true,
    },
  },
  notifications: {
    // Show toasts at the top right of the screen
    position: 'top-0 right-0',
  },
});
