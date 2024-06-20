/*
A file config. vuetify is used for the matches page currently
Ideally we will find a workaround with Nuxt shortly, however to allow the header capabilities we want for the moment this file is needed
 */

import { createVuetify } from 'vuetify';

export default defineNuxtPlugin(app => {
  const vuetify = createVuetify({
    // ... your configuration
  });
  app.vueApp.use(vuetify);
});
