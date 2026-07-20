/// <reference types="vitest/config" />
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { parseCase } from './src/data/caseSchema';

const CASES_DIR = path.resolve(__dirname, 'src/data/cases');
const VIRTUAL_ID = 'virtual:case-summaries';
const RESOLVED_VIRTUAL_ID = '\0' + VIRTUAL_ID;

function listCaseFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listCaseFiles(full);
    return entry.name.endsWith('.json') ? [full] : [];
  });
}

/**
 * Serves `virtual:case-summaries`: every case JSON is Zod-validated at build
 * time (a malformed case fails the build instead of a player's session) and
 * boiled down to the `CaseSummary` shape the desk shelf renders. Only these
 * summaries ship in the entry bundle — full cases stay in lazy per-case chunks
 * created by the `import.meta.glob` in caseLoader.ts. The `path` field matches
 * that glob's keys (relative to src/data, posix separators) so the loader can
 * map a case id to its chunk.
 */
function caseSummariesPlugin(): Plugin {
  return {
    name: 'case-summaries',
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_VIRTUAL_ID : undefined;
    },
    load(id) {
      if (id !== RESOLVED_VIRTUAL_ID) return undefined;
      const summaries = listCaseFiles(CASES_DIR).map((file) => {
        this.addWatchFile(file);
        let parsed;
        try {
          // Some authored case files include a UTF-8 BOM. Vite's native JSON
          // loader accepts it, so the generated summary manifest must too.
          const source = readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
          const raw: unknown = JSON.parse(source);
          parsed = parseCase(raw);
        } catch (error) {
          throw new Error(`[case-summaries] Invalid case file ${file}: ${String(error)}`);
        }
        return {
          path: './' + path.relative(path.dirname(CASES_DIR), file).split(path.sep).join('/'),
          id: parsed.id,
          type: parsed.type,
          difficulty: parsed.difficulty,
          claimAmount: parsed.claimAmount,
          title: parsed.title,
          claim: { person: parsed.claim.person },
          coverImage: parsed.coverImage,
          ...(parsed.personImage !== undefined ? { personImage: parsed.personImage } : {}),
          evidenceCount: parsed.evidences.length,
          ...(parsed.investigationBudget !== undefined
            ? { investigationBudget: parsed.investigationBudget }
            : {}),
          ...(parsed.campaignOrder !== undefined ? { campaignOrder: parsed.campaignOrder } : {}),
          ...(parsed.requiredLevel !== undefined ? { requiredLevel: parsed.requiredLevel } : {}),
        };
      });
      return `export default ${JSON.stringify(summaries)};`;
    },
  };
}

// Yandex Games serves the build from a relative path, so base must be './'.
export default defineConfig({
  base: './',
  plugins: [caseSummariesPlugin(), react()],
  build: {
    rollupOptions: {
      output: {
        // Long-lived vendor chunks: framework code changes far less often than
        // game code, so returning players hit the CDN cache for the big libs.
        manualChunks: {
          react: ['react', 'react-dom'],
          motion: ['framer-motion'],
        },
      },
    },
  },
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
