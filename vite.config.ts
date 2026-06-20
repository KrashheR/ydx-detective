/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Yandex Games serves the build from a relative path, so base must be './'.
export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    // jsdom is needed for the UI-smoke layer and for localStorage in the
    // persistence tests; pure engine/data tests run fine in it too.
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // Tests and content/fixtures are not themselves under test.
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/data/cases/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
    },
  },
});
