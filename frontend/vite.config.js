import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5174,
    strictPort: false,
    proxy: {
      '/api': 'http://localhost:5000',
      '/py-api': 'http://127.0.0.1:8000'
    },
    open: true
  },
  preview: {
    port: 5173,
    strictPort: true
  },
  // Configure Vite to handle SPA routing
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom']
        }
      }
    }
  }
});
