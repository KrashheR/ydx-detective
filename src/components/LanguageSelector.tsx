import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SUPPORTED_LANGUAGES, type Language } from '../types';
import { LANGUAGE_LABELS, t } from '../i18n/ui';

interface Props {
  lang: Language;
  onChange: (lang: Language) => void;
}

/** Native-language dropdown with flags, per design spec (sidebar + menu). */
export function LanguageSelector({ lang, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const current = LANGUAGE_LABELS[lang];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-white/10 bg-bg px-3 py-2.5 text-sm hover:border-white/30 transition-colors"
        aria-label={t('language', lang)}
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <span className="text-base">{current.flag}</span>
          <span>{current.native}</span>
        </span>
        <span className="text-white/50">▾</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute z-30 mt-1 w-full overflow-hidden rounded-md border border-white/10 bg-surface shadow-lift"
          >
            {SUPPORTED_LANGUAGES.map((code) => {
              const label = LANGUAGE_LABELS[code];
              const active = code === lang;
              return (
                <li key={code}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(code);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-sm transition-colors hover:bg-white/5 ${
                      active ? 'text-accent' : 'text-paper/90'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{label.flag}</span>
                      <span>{label.native}</span>
                    </span>
                    {active && <span aria-hidden>✓</span>}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
