import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/testdrive?schema=public',
      JWT_ACCESS_SECRET: 'test-secret-at-least-32-chars-length-long!!',
      JWT_REFRESH_SECRET: 'test-refresh-secret-at-least-32-chars-long!!',
      ACCESS_TOKEN_TTL: '15m',
      REFRESH_TOKEN_TTL: '7d',
    },
  },
});

