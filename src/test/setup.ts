/**
 * Global test setup, loaded by Vitest before every test file (see vite.config).
 * Registers jest-dom matchers (and their TS types) and tears down the rendered
 * DOM after each test so component tests don't leak into one another.
 */
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
