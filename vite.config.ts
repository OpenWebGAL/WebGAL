import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import loadVersion from 'vite-plugin-package-version'
import { resolve } from 'path'
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), loadVersion()],
    resolve: {
        alias: {
            '@/': resolve(__dirname, './src'),
        },
    },
})
