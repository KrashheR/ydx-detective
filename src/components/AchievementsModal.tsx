import { motion } from 'framer-motion';
import type { Language } from '../types';
import { ACHIEVEMENTS } from '../data/achievements';
import { loc, t } from '../i18n/ui';

interface Props {
  lang: Language;
  unlockedIds: string[];
  onClose: () => void;
}

/** Full archive of achievements — unlocked ones inked, the rest greyed out. */
export function AchievementsModal({ lang, unlockedIds, onClose }: Props) {
  const unlocked = new Set(unlockedIds);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-5"
      style={{ background: 'rgba(8,11,17,.8)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative flex max-h-full w-full max-w-[420px] flex-col overflow-hidden bg-paper shadow-modal"
        style={{ borderRadius: 9 }}
        initial={{ y: 16, opacity: 0, scale: 0.985 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 16, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.2, 0.9, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dark folder-edge header */}
        <div className="flex items-center justify-between bg-folder-edge px-4 py-3">
          <span className="text-[13px] font-semibold text-white">
            {t('achievements', lang)}
            <span className="ml-2 font-mono text-xs font-normal text-white/70">
              {unlocked.size} / {ACHIEVEMENTS.length}
            </span>
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="px-1.5 text-lg leading-none text-white/85 hover:text-white"
          >
            ✕
          </button>
        </div>

        <ul className="space-y-2 overflow-auto p-[18px]">
          {ACHIEVEMENTS.map((a) => {
            const isUnlocked = unlocked.has(a.id);
            return (
              <li
                key={a.id}
                className={`flex items-start gap-3 rounded-md border p-3 ${
                  isUnlocked
                    ? 'border-gold/40 bg-gold/10'
                    : 'border-black/10 bg-black/[0.03] opacity-60'
                }`}
              >
                <span
                  className={`text-2xl ${isUnlocked ? '' : 'grayscale'}`}
                  aria-hidden
                >
                  {isUnlocked ? a.icon : '🔒'}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{loc(a.title, lang)}</p>
                  <p className="text-sm text-ink/70">{loc(a.description, lang)}</p>
                  <p className="mt-0.5 font-mono text-xs text-ink/45">
                    +{a.xpBonus} {t('xpGained', lang)} · +${a.currencyBonus}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </motion.div>
    </motion.div>
  );
}
