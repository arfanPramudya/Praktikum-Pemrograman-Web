import { defineConfig } from 'vite'

export default defineConfig({
  // Vite configuration
  server: {
    port: 5173,
    open: true,
    strictPort: false,
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
  },
  // Environment variable prefix
  envPrefix: 'VITE_',
})
