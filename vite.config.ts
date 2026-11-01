import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { cloudflare } from "@cloudflare/vite-plugin"

if (!process.env.CLOUDFLARE_DEV_REGISTRY_PATH) {
  process.env.CLOUDFLARE_DEV_REGISTRY_PATH = '/tmp/cloudflare/dev-registry'
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), cloudflare()],
  server: {
    host: true,
  },
})