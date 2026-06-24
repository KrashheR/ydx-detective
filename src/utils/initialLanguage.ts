import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, type Language } from '../types';

const LOCAL_SAVE_KEY = 'claimDetectiveSave';

function isLanguage(value: unknown): value is Language {
  return typeof value === 'string'
    && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

/**
 * Best-effort locale available before cloud hydration. The persisted local
 * snapshot wins, then the browser locale, then Russian as the product default.
 */
export function detectInitialLanguage(
  storage: Pick<Storage, 'getItem'> | null = typeof localStorage === 'undefined' ? null : localStorage,
  browserLanguage = typeof navigator === 'undefined' ? '' : navigator.language,
): Language {
  try {
    const raw = storage?.getItem(LOCAL_SAVE_KEY);
    const saved = raw ? (JSON.parse(raw) as { stats?: { language?: unknown } }) : null;
    if (isLanguage(saved?.stats?.language)) return saved.stats.language;
  } catch {
    // Invalid or inaccessible local state must not block the splash.
  }

  const detected = browserLanguage.slice(0, 2).toLowerCase();
  return isLanguage(detected) ? detected : DEFAULT_LANGUAGE;
}
