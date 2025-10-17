import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
      buffer: 'buffer',
      path: 'path-browserify',
      os: 'os-browserify/browser',
      assert: 'assert',
      url: 'url',
      vm: 'vm-browserify',
    },
  },
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  optimizeDeps: {
    include: [
      'buffer',
      'process/browser',
      'crypto-browserify',
      'stream-browserify',
      'readable-stream',
    ],
  },
})
