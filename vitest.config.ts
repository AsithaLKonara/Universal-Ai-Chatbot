import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    pool: 'forks',       // Isolate each test file in a forked process — fixes hanging handle warning
    forceRerunTriggers: ['**/prisma/schema.prisma'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
