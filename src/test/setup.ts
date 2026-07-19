/**
 * Global test setup, loaded by Vitest before every test file (see vite.config).
 * Registers jest-dom matchers (and their TS types) and tears down the rendered
 * DOM after each test so component tests don't leak into one another.
 */
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { loadAllCases } from '../data/caseLoader';

// Production loads full case content on demand. Existing tests intentionally
// exercise the synchronous registry helpers, so populate that registry before
// each test module is collected.
await loadAllCases();

afterEach(() => {
  cleanup();
});
