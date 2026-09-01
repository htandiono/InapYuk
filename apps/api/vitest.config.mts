import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    fileParallelism: false,
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    include: ['__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/generated/**', 'src/test/**'],
    },
  },
  resolve: {
    alias: {
      '@': import.meta.dirname + '/src',
    },
  },
});
