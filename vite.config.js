import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Any request starting with /letters, /analyze, or /predict
      // will be forwarded to the target.
      '/letters': 'http://localhost:5000',
      '/analyze': 'http://localhost:5000',
      '/predict': 'http://localhost:5000',
    }
  }
})
