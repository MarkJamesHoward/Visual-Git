import { defineConfig } from "astro/config";
import lit from "@astrojs/lit";
import react from "@astrojs/react";
import basicSsl from '@vitejs/plugin-basic-ssl';

import sentry from "@sentry/astro";
import partytown from "@astrojs/partytown";


// https://astro.build/config
export default defineConfig({
  integrations: [lit(), react(), sentry(
    sentry({
      dsn: "https://90318fced9c82413d217d540f511d477@o4507897151356928.ingest.us.sentry.io/4507898945601536",
      sourceMapsUploadOptions: {
        project: "visual-git-website",
        authToken: process.env.SENTRY_AUTH_TOKEN,
      },
    })
  ),     partytown({
    // Example: Add dataLayer.push as a forwarding-event.
    config: {
      forward: ['dataLayer.push'],
    },
  }),
],
  vite: {
    define: {
      __BUILD_NUMBER__: JSON.stringify(process.env.BUILD_NUMBER || 'dev'),
    },
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          // Suppress ambiguous external namespace warnings for lit
          if (warning.code === 'AMBIGUOUS_EXTERNAL_NAMESPACES' && warning.message.includes('lit')) {
            return;
          }
          warn(warning);
        }
      }
    }
  },
});