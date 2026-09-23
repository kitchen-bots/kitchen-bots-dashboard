import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    globals: true,
    include: ['tests/rules/**/*.test.ts'],
    pool: 'forks',
    testTimeout: 30000,
  },
});
