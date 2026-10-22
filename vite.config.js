import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // in dev, the leaderboard server runs on its own (cd server && npm install && npm start)
    proxy: { '/api': 'http://localhost:3000' },
  },
})
