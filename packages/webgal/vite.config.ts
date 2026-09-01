import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import loadVersion from 'vite-plugin-package-version';
import { resolve } from 'path';
import Info from 'unplugin-info/vite';
import viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/

// @ts-ignore
const env = process.env.NODE_ENV;
console.log(env);

export default defineConfig({
  plugins: [
    react(),
    loadVersion(),
    Info(),
    viteCompression({
      filter: /^(.*assets).*\.(js|css|ttf)$/,
    }),
    // @ts-ignore
    // visualizer(),
  ],
  resolve: {
    alias: {
      '@': resolve('src'),
    },
  },
  // angular-expressions accesses Node's `global` during expression compilation.
  // Map it to the browser's standard globalThis in the generated bundle.
  define: {
    global: 'globalThis',
  },
  build: {
    // sourcemap: true,
  },
});
