import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const FILE_WATCH_POLL_INTERVAL_MS = 100

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
      interval: FILE_WATCH_POLL_INTERVAL_MS,
    },
  },
})
