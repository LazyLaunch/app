import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import node from '@astrojs/node'

export default defineConfig({
  output: 'server',
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  adapter: node({
    mode: 'standalone',
  }),
  security: {
    checkOrigin: true,
  },
})
