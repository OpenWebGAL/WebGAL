import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import loadVersion from 'vite-plugin-package-version';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import Info from 'unplugin-info/vite';
import pixiPerformAutoImport from './src/plugins/pixi-perform-auto-import';

// https://vitejs.dev/config/

export default defineConfig({
  plugins: [
    react(),
    loadVersion(),
    Info(),
    pixiPerformAutoImport({
      scriptDir: resolve('src/Core/gameScripts/pixi/performs'),
      managerDir: resolve('src/Core/util/pixiPerformManager'),
      outputFile: 'initRegister.ts',
      watchDebounce: 100,
      clearWhenClose: false,
    }),
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
