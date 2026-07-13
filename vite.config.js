import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@engine': resolve(__dirname, './src/engine'),
      '@world': resolve(__dirname, './src/world'),
      '@pipeline': resolve(__dirname, './src/pipeline'),
      '@equipment': resolve(__dirname, './src/equipment'),
      '@manager': resolve(__dirname, './src/manager'),
      '@material': resolve(__dirname, './src/material'),
      '@config': resolve(__dirname, './src/config'),
      '@utils': resolve(__dirname, './src/utils')
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  }
});
