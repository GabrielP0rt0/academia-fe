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
  },
  // Preview server configuration (for production preview)
  preview: {
    port: 5173,
    // Vite preview also handles SPA routing automatically
  },
})

