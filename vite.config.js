import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    // Vite automatically handles SPA routing in development
    // All routes will fallback to index.html
    strictPort: false,
  },
  // Preview server configuration (for production preview)
  preview: {
    port: 5173,
    // Vite preview also handles SPA routing automatically
    strictPort: false,
  },
  // Ensure proper build output
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})

