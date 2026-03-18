import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const isDev = process.env.NODE_ENV !== 'production'
const basePath = process.env.VITE_BASE || '/'

export default defineConfig({
  base: basePath,
  plugins: [react()],
  ...(isDev ? {
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
        '/socket.io': {
          target: 'ws://localhost:3000',
          ws: true,
        },
      },
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups'
      }
    }
  } : {})
})