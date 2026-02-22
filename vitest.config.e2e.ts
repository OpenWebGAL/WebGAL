import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['test/e2e/**/*.test.ts'],
    testTimeout: 30_000,
    hookTimeout: 30_000,
    globalSetup: ['test/e2e/globalSetup.ts'],
    setupFiles: ['test/e2e/setup.ts'],
  },
})
