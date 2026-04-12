import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 120_000,
    hookTimeout: 60_000,
    pool: 'forks',
    poolOptions: {
      forks: { singleFork: true },
    },
    include: ['src/tests/**/*.test.ts'],
    globalSetup: ['src/globalSetup.ts'],
    setupFiles: ['src/setup.ts'],
  },
});
