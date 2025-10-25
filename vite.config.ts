import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: [
      '@farcaster/miniapp-sdk',
      'wagmi',
      'viem',
      '@tanstack/react-query',
      'zustand',
    ],
    exclude: [
      '@base-org/account', // Fix for import assertion error
    ],
    esbuildOptions: {
      target: 'esnext',
    },
  },
  server: {
    host: true,
    fs: {
      strict: false,
    },
    hmr: {
      overlay: false,
    },
  },
  build: {
    target: 'esnext',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-wagmi': ['wagmi', 'viem', '@tanstack/react-query'],
          'vendor-farcaster': ['@farcaster/miniapp-sdk'],
          'vendor-state': ['zustand'],
        },
      },
    },
  },
})