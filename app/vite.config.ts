import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Rolldown (Vite 8) handles code splitting automatically.
    // Raise the warning threshold to avoid noise from the charts bundle.
    chunkSizeWarningLimit: 1000,
  },
})
