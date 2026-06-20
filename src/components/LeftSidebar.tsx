import type { Case, Language } from '../types';
import { loc, t, type UIKey } from '../i18n/ui';
import { evaluateRank } from '../engine/rankEngine';
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
  /** Cumulative career XP — drives the investigator progress card. */
  xp: number;
  onSelect: (c: Case) => void;
  onDailyLocked: () => void;
  onLanguage: (lang: Language) => void;
}

/** Left investigation-desk column: brand, language, case list, progress. */
export function LeftSidebar({
  standardCases,
  dailyCase,
  dailyUnlocked,
  dailyMsRemaining,
  selectedId,
  completedIds,
  lang,
  xp,
  onSelect,
  onDailyLocked,
  onLanguage,
}: Props) {
  const rank = evaluateRank(xp);
  const rankTitle = t(`rank_${rank.id}` as UIKey, lang);

  return (
    <aside className="flex h-full w-full flex-col gap-[15px] overflow-y-auto rounded-xl border border-border bg-surface p-4 md:p-[18px]">
      {/* Brand */}
      <div>
        <div className="text-[15px] font-bold tracking-[2px] text-[#f3f4f6]">
          CLAIM DETECTIVE
        </div>
        <div className="mt-0.5 text-[11px] font-medium tracking-[1px] text-text-dim">
          {t('department', lang)}
        </div>
      </div>

      {/* Language selector */}
      <LanguageSelector lang={lang} onChange={onLanguage} />

      <div className="border-t border-border" />
      <div className="text-[11px] font-semibold tracking-[1.5px] text-text-dim">
        {t('casesInWork', lang)}
      </div>

      {/* Standard cases */}
      {standardCases.map((c) => {
        const active = c.id === selectedId;
        const done = completedIds.includes(c.id);
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelect(c)}
            className={`rounded-[9px] border bg-surface-2 p-3 text-left transition-colors ${
              active ? 'border-accent' : 'border-border hover:border-white/25'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[13px] font-semibold text-[#f3f4f6]">
                {loc(c.title, lang)}
              </span>
              {active ? (
                <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-accent" />
              ) : (
                done && <span className="shrink-0 text-success">✓</span>
              )}
            </div>
            <div className="mt-[3px] text-[11px] font-medium text-text-dim">
              {c.id} · {active ? t('active', lang) : c.difficulty}
            </div>
          </button>
        );
      })}

      {/* Daily case — gold, URGENT stamp */}
      {dailyCase && (
        <button
          type="button"
          onClick={() => (dailyUnlocked ? onSelect(dailyCase) : onDailyLocked())}
          className={`relative overflow-hidden rounded-[9px] border p-3 text-left ${
            dailyUnlocked ? 'border-gold' : 'border-border opacity-[0.55]'
          } ${dailyCase.id === selectedId ? 'ring-1 ring-gold' : ''}`}
          style={
            dailyUnlocked
              ? { background: 'linear-gradient(135deg,#2a2113,#1f2937)' }
              : { background: '#111827' }
          }
        >
          {dailyUnlocked && (
            <span
              aria-hidden
              className="absolute -right-6 top-[9px] rotate-[34deg] bg-stamp px-[26px] py-0.5 font-mono text-[9px] font-bold tracking-wider text-white"
            >
              {t('urgent', lang)}
            </span>
          )}
          <div className="text-xs font-bold tracking-[0.5px] text-gold-text">
            {t('dailyCase', lang)}
          </div>
          <div className="mt-[7px] flex items-center justify-between gap-2">
            <span className="font-mono text-[11px] font-semibold text-gold">
              {formatCountdown(dailyMsRemaining)}
            </span>
            <span className="rounded-[5px] bg-gold px-[7px] py-0.5 text-[11px] font-bold text-gold-dark">
              ×5
            </span>
          </div>
        </button>
      )}

      {/* Investigator progress */}
      <div className="mt-auto rounded-[9px] border border-border bg-surface-2 p-[13px]">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs font-semibold text-[#d1d5db]">
            {t('investigator', lang)}
          </span>
          <span className="text-xs font-bold text-accent">{rankTitle}</span>
        </div>
        <div className="mt-[9px] h-[7px] overflow-hidden rounded bg-surface">
          <div
            className="h-full rounded bg-accent transition-[width] duration-500"
            style={{ width: `${Math.round(rank.progress * 100)}%` }}
          />
        </div>
        <div className="mt-1.5 text-[10px] font-medium text-text-dim">
          {rank.isMax || rank.xpForNext === null
            ? `${xp} ${t('xpGained', lang)}`
            : `${rank.xpIntoRank} / ${rank.xpForNext} ${t('xpToPromote', lang)}`}
        </div>
      </div>
    </aside>
  );
}
