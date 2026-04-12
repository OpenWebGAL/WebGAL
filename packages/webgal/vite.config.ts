import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import loadVersion from 'vite-plugin-package-version';
import { resolve } from 'path';
import Info from 'unplugin-info/vite';
import viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/

// @ts-ignore
const env = process.env.NODE_ENV;
const isTestMode = process.env.WEBGAL_TEST === 'true';
console.log(env);
if (isTestMode) {
  console.log('[WebGAL] Test mode enabled');
}

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
  define: {
    __WEBGAL_TEST__: JSON.stringify(isTestMode),
  },
  build: {
    // sourcemap: true,
  },
});
