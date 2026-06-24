import { describe, expect, it } from 'vitest';
import { detectInitialLanguage } from './initialLanguage';

const storage = (value: string | null): Pick<Storage, 'getItem'> => ({
  getItem: () => value,
});

describe('detectInitialLanguage', () => {
  it('prefers the persisted player language before hydration', () => {
    const saved = JSON.stringify({ stats: { language: 'en' } });
    expect(detectInitialLanguage(storage(saved), 'ru-RU')).toBe('en');
  });

  it('uses a supported browser locale when there is no save', () => {
    expect(detectInitialLanguage(storage(null), 'tr-TR')).toBe('tr');
  });

  it('falls back safely for malformed state and unsupported locales', () => {
    expect(detectInitialLanguage(storage('{broken'), 'de-DE')).toBe('ru');
  });
});
