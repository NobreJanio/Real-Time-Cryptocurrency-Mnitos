import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    chunkSizeWarningLimit: 1000, // Aumenta o limite de aviso para 1000kB
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          d3: ['d3'],
          recharts: ['recharts'],
          uplot: ['uplot'],
          utils: ['date-fns', 'axios']
        }
      }
    }
  }
})