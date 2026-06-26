import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy API calls to Vercel dev server when running `npm run dev:full`
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
