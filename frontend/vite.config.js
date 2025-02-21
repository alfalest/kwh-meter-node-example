import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000', // Proxy ke backend
      '/ws': {
        target: 'ws://localhost:3001', // Proxy ke WebSocket
        ws: true,
      },
    },
  },
})
