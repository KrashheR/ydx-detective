import { motion } from 'framer-motion';
import type { Case, Language } from '../types';
import { loc, t } from '../i18n/ui';
import { asset } from '../utils/asset';
import { LanguageSelector } from './LanguageSelector';
import { formatCountdown } from './icons';

interface Props {
  standardCases: Case[];
  dailyCase: Case | undefined;
  dailyUnlocked: boolean;
  dailyMsRemaining: number;
  selectedId: string | null;
  completedIds: string[];
  lang: Language;
  onSelect: (c: Case) => void;
  onLanguage: (lang: Language) => void;
}

/** Left investigation-desk column: case list, daily banner, progress, language. */
export function LeftSidebar({
  standardCases,
  dailyCase,
  dailyUnlocked,
  dailyMsRemaining,
  selectedId,
  completedIds,
  lang,
  onSelect,
  onLanguage,
}: Props) {
  const total = standardCases.length + (dailyCase ? 1 : 0);
  const solved = completedIds.length;

  return (
    <aside className="flex h-full w-full flex-col gap-5 overflow-y-auto bg-surface p-4">
      <div>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-paper/50">
          {t('cases', lang)}
        </h2>
        <ul className="space-y-1.5">
          {standardCases.map((c) => {
            const active = c.id === selectedId;
            const done = completedIds.includes(c.id);
            return (
              <li key={c.id}>
                <motion.button
                  type="button"
                  whileHover={{ x: 2 }}
                  onClick={() => onSelect(c)}
                  className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
                    active
                      ? 'border-l-2 border-accent bg-accent/15 text-paper'
                      : 'text-paper/80 hover:bg-white/5'
                  }`}
                >
                  <img
                    src={asset(c.coverImage)}
                    alt=""
                    className="h-8 w-12 shrink-0 rounded-sm border border-white/10 object-cover"
                  />
                  <span className="min-w-0 flex-1 truncate">{loc(c.title, lang)}</span>
                  {done && <span className="text-success">✓</span>}
                </motion.button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Daily case banner — gold, URGENT stamp */}
      {dailyCase && (
        <button
          type="button"
          disabled={!dailyUnlocked}
          onClick={() => dailyUnlocked && onSelect(dailyCase)}
          className={`relative overflow-hidden rounded-md border p-3 text-left transition-colors ${
            dailyUnlocked
              ? 'border-gold/60 bg-gold/5 hover:border-gold'
              : 'border-white/10 bg-white/5 opacity-70 grayscale'
          } ${dailyCase.id === selectedId ? 'ring-1 ring-gold' : ''}`}
        >
          {dailyUnlocked && (
            <span
              className="ink-stamp absolute -right-4 top-2 rotate-12 rounded border-2 border-gold px-2 py-0.5 text-[10px] text-gold"
              aria-hidden
            >
              {t('urgent', lang)}
            </span>
          )}
          <div className="text-xs font-semibold uppercase tracking-wide text-gold">
            ⚡ {t('dailyCase', lang)}
          </div>
          <div className="mt-1 truncate pr-12 text-sm font-medium text-paper">
            {loc(dailyCase.title, lang)}
          </div>
          {!dailyUnlocked && (
            <div className="mt-1 text-xs text-paper/60">
              {t('returnsIn', lang)} {formatCountdown(dailyMsRemaining)}
            </div>
          )}
        </button>
      )}

      <div className="mt-auto space-y-4 pt-4">
        <div>
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest text-paper/50">
            {t('progress', lang)}
          </h2>
          <p className="text-sm text-paper/80">
            {solved}/{total} {t('solved', lang)}
          </p>
        </div>
        <div>
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest text-paper/50">
            {t('language', lang)}
          </h2>
          <LanguageSelector lang={lang} onChange={onLanguage} />
        </div>
      </div>
    </aside>
  );
}
