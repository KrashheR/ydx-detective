import { motion } from 'framer-motion';
import type { Case, Language } from '../types';
import { loc, t } from '../i18n/ui';
import { formatCountdown } from './icons';

interface Props {
  standardCases: Case[];
  dailyCase: Case | undefined;
  dailyUnlocked: boolean;
  dailyMsRemaining: number;
  lang: Language;
  onSelect: (c: Case) => void;
  onDailyLocked: () => void;
}

/** Case-selection screen: physical folder covers laid out on the desk. */
export function CaseSelect({
  standardCases,
  dailyCase,
  dailyUnlocked,
  dailyMsRemaining,
  lang,
  onSelect,
  onDailyLocked,
}: Props) {
  const fmt = (n: number) => n.toLocaleString('ru-RU');

  return (
    <div className="flex w-full max-w-[480px] flex-col gap-[18px] pt-1.5">
      <div className="text-[11px] font-semibold tracking-[1.5px] text-text-muted">
        {t('selectCasePrompt', lang)}
      </div>

      {standardCases.map((c) => (
        <motion.button
          key={c.id}
          type="button"
          onClick={() => onSelect(c)}
          whileHover={{ y: -6 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative block text-left"
        >
          {/* Protruding folder tab */}
          <span className="absolute -top-[13px] left-[26px] h-6 w-[130px] rounded-t-[7px] bg-folder-edge" />
          {/* Folder cover */}
          <div
            className="paper-grain relative overflow-hidden border border-folder-edge bg-folder p-[24px_22px_26px] shadow-folder"
            style={{ borderRadius: '3px 12px 12px 12px' }}
          >
            <span
              aria-hidden
              className="absolute right-3.5 top-[18px] rotate-[-7deg] rounded-sm border-2 border-stamp px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-stamp opacity-85"
            >
              {t('confidential', lang)}
            </span>
            <div className="font-mono text-[11px] font-semibold tracking-[1px] text-folder-ink-soft">
              {c.id}
            </div>
            <div className="mt-2 max-w-[80%] font-serif text-[22px] font-semibold text-folder-ink">
              {loc(c.title, lang)}
            </div>
            <div className="mt-4 flex items-center gap-2.5">
              <span className="h-[38px] w-[38px] shrink-0 rounded-full border border-black/25 bg-black/[0.18]" />
              <div className="min-w-0">
                <div className="truncate text-[13px] font-semibold text-folder-ink">
                  {loc(c.claim.person, lang)}
                </div>
                <div className="text-[11px] font-medium text-folder-ink-soft">
                  {fmt(c.claimAmount)} ₽
                </div>
              </div>
            </div>
            <div className="my-[14px] mt-[18px] h-px bg-black/[0.18]" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-folder-ink-soft">
                {c.evidences.length} {t('documents', lang)}
              </span>
              <span className="text-xs font-bold text-folder-ink">
                {t('openCaseAction', lang)} →
              </span>
            </div>
          </div>
        </motion.button>
      ))}

      {/* Daily — premium gold cover */}
      {dailyCase && (
        <motion.button
          type="button"
          onClick={() => (dailyUnlocked ? onSelect(dailyCase) : onDailyLocked())}
          whileHover={{ y: -6 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative block text-left"
        >
          <span className="absolute -top-[13px] left-[26px] h-6 w-[130px] rounded-t-[7px] bg-[#a9781b]" />
          <div
            className="relative overflow-hidden border border-[#a9781b] p-[24px_22px_26px] shadow-folder"
            style={{
              borderRadius: '3px 12px 12px 12px',
              background: 'linear-gradient(135deg,#e6b85c,#d9a441)',
            }}
          >
            <span
              aria-hidden
              className="absolute -right-[30px] top-3.5 rotate-[34deg] bg-stamp px-10 py-1 font-mono text-[11px] font-bold tracking-[2px] text-white"
            >
              {t('urgent', lang)}
            </span>
            <div className="font-mono text-[11px] font-semibold tracking-[1px] text-[#5c3f08]">
              {t('dailyCase', lang)}
            </div>
            <div className="mt-2 max-w-[78%] font-serif text-[22px] font-semibold text-[#3a2705]">
              {loc(dailyCase.title, lang)}
            </div>
            <div className="mt-4 flex gap-2.5">
              <span className="rounded-md bg-[#3a2705] px-2.5 py-[5px] text-xs font-bold text-gold-text">
                ×5
              </span>
              <span className="rounded-md bg-[#3a2705]/20 px-2.5 py-[5px] text-xs font-bold text-[#3a2705]">
                ×2
              </span>
            </div>
            <div className="my-[14px] mt-[18px] h-px bg-[#3a2705]/20" />
            <div className="flex items-center justify-between">
              {dailyUnlocked ? (
                <>
                  <span className="font-mono text-xs font-semibold text-[#5c3f08]">
                    {dailyCase.evidences.length} {t('documents', lang)}
                  </span>
                  <span className="text-xs font-bold text-[#3a2705]">
                    {t('openCaseAction', lang)} →
                  </span>
                </>
              ) : (
                <>
                  <span className="font-mono text-xs font-semibold text-[#5c3f08]">
                    {t('returnsIn', lang)} {formatCountdown(dailyMsRemaining)}
                  </span>
                  <span className="text-xs font-bold text-[#3a2705]">⏳</span>
                </>
              )}
            </div>
          </div>
        </motion.button>
      )}
    </div>
  );
}
