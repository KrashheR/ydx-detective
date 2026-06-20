/**
 * Resolve a `public/` asset path against Vite's base URL.
 * On Yandex Games the build is served from a relative path (base './'), so
 * never hard-code a leading slash — always route image paths through here.
 */
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  const clean = path.replace(/^\//, '');
  return `${base}${clean}`;
}
