import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SUPPORTED_LANGUAGES, type Language } from '../types';
import { LANGUAGE_LABELS, t } from '../i18n/ui';

interface Props {
  lang: Language;
  onChange: (lang: Language) => void;
}

/** Native-language dropdown (name + code) per the mockup's archive look. */
export function LanguageSelector({ lang, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const current = LANGUAGE_LABELS[lang];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-xs font-semibold text-text-light transition-colors hover:border-black/20"
        aria-label={t('language', lang)}
        aria-expanded={open}
      >
        <span>
          {t('language', lang)} · {current.native}
        </span>
        <span className="text-[11px] text-text-dim">▾</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-border bg-surface-2 shadow-lift"
          >
            {SUPPORTED_LANGUAGES.map((code) => {
              const label = LANGUAGE_LABELS[code];
              const active = code === lang;
              return (
                <li key={code} className="border-b border-border last:border-0">
                  <button
                    type="button"
                    onClick={() => {
                      onChange(code);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between gap-2 px-3 py-2.5 text-xs font-medium transition-colors hover:bg-surface ${
                      active ? 'text-accent' : 'text-text-light'
                    }`}
                  >
                    <span>{label.native}</span>
                    <span className="text-text-dim">{code.toUpperCase()}</span>
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
