import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Debug: Log when config is evaluated
console.log('[VITE CONFIG] Configuration file loaded at:', new Date().toISOString());

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    host: true,
    // Increase HMR timeout
    hmr: {
      overlay: true,
      timeout: 30000,
    },
    watch: {
      // Aggressive ignore patterns
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/build/**',
        '**/.vite/**',
        '**/coverage/**',
        '**/.cache/**',
        // Add your config files to prevent self-watching
        '**/vite.config.ts',
        '**/tsconfig.json',
        '**/tsconfig.node.json',
        '**/*.log',
      ],
      // Use polling as fallback (less efficient but more reliable)
      usePolling: false,
      // Increase debounce interval
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100,
      },
    },
  },

  // Prevent config file changes from causing restarts
  clearScreen: false,

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Optimize dependencies to prevent re-bundling
  optimizeDeps: {
    include: ['react', 'react-dom'],
    // Force optimization on server start
    force: true,
  },

  // Add build options that might help
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
