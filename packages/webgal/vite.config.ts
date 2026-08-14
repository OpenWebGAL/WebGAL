import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import loadVersion from 'vite-plugin-package-version';
import { resolve } from 'path';
import Info from 'unplugin-info/vite';

// https://vitejs.dev/config/

// @ts-ignore
const env = process.env.NODE_ENV;
console.log(env);

export default defineConfig({
  plugins: [
    react(),
    loadVersion(),
    Info(),
    // @ts-ignore
    // visualizer(),
  ],
  resolve: {
    alias: {
      '@': resolve('src'),
    },
  },
  build: {
    // sourcemap: true,
  },
});
