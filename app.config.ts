export default defineAppConfig({
    ui: {
        primary: 'coral',
        gray: 'cool'
    },
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
    notifications: {
        // Show toasts at the top right of the screen
        position: 'top-0 right-0'
    }
})