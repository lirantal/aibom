import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    viteSingleFile()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Inline all assets
    assetsInlineLimit: 100000000,
    // Single chunk
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})
