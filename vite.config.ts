import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Yandex Games serves the build from a relative path, so base must be './'.
export default defineConfig({
  base: './',
  plugins: [react()],
});
