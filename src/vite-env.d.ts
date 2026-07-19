/// <reference types="vite/client" />

/**
 * Build-time case previews served by the `case-summaries` plugin in
 * vite.config.ts. `path` is the `import.meta.glob('./cases/**')` key of the
 * matching full-case chunk.
 */
declare module 'virtual:case-summaries' {
  const summaries: ReadonlyArray<
    import('./types').CaseSummary & { readonly path: string }
  >;
  export default summaries;
}
