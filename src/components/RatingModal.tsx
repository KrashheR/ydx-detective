import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { Language } from '../types';
import { t } from '../i18n/ui';

type Phase = 'idle' | 'submitting' | 'done';

interface Props {
  lang: Language;
  /** Calls requestReview() — component handles submitting→done transition. */
  onRate: () => Promise<void>;
  /** "Не сейчас" / backdrop click / Escape. */
  onDismiss: () => void;
  /** "Больше не предлагать" — permanent suppress. */
  onNever: () => void;
  /** Called ~2 s after the done state animates in (to unmount the modal). */
  onRated: () => void;
}

const STARS = [-6, 3, -3, 5, -7] as const;

export function RatingModal({ lang, onRate, onDismiss, onNever, onRated }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const mountedRef = useRef(true);

  useEffect(() => () => { mountedRef.current = false; }, []);

  useEffect(() => {
    if (phase !== 'idle') return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onDismiss(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, onDismiss]);

  const handleRate = async () => {
    setPhase('submitting');
    await onRate();
    if (!mountedRef.current) return;
    setPhase('done');
    setTimeout(() => { if (mountedRef.current) onRated(); }, 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={phase === 'idle' ? onDismiss : undefined}
      className="fixed inset-0 z-[90] flex items-center justify-center p-6"
      style={{ background: 'rgba(17,24,39,.8)' }}
    >
      <motion.div
        initial={{ y: 26, rotate: -3, scale: 0.96, opacity: 0 }}
        animate={{ y: 0, rotate: -1, scale: 1, opacity: 1 }}
        exit={{ y: 20, scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        className="paper-sheet w-full max-w-[380px] px-[26px] pb-[22px] pt-[28px]"
        style={{ textAlign: 'start' }}
      >
        {/* Seal + eyebrow */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border-2 border-accent"
            style={{ transform: 'rotate(-8deg)' }}
          >
            <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full border border-accent font-serif text-[13px] font-bold leading-none text-accent">
              ★
            </div>
          </div>
          <div>
            <div className="font-serif text-[11px] font-semibold uppercase tracking-[2.5px] text-ink">
              {t('ratingEyebrow', lang)}
            </div>
            <div className="mt-px font-sans text-[10px] tracking-[1px] text-text-muted">
              {t('ratingRefNo', lang)}
            </div>
          </div>
        </div>

        <div className="my-[16px] h-px bg-gray-300" />

        {phase === 'idle' && (
          <>
            <h2 className="font-serif text-[22px] font-semibold leading-[1.3] text-ink">
              {t('ratingTitle', lang)}
            </h2>
            <p className="mt-[11px] font-sans text-[14px] leading-[1.6] text-ink/70">
              {t('ratingBody', lang)}
            </p>

            {/* Decorative ink stars */}
            <div className="my-[20px] flex justify-center gap-[7px]">
              {STARS.map((deg, i) => (
                <svg
                  key={i}
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  style={{ transform: `rotate(${deg}deg)`, opacity: 0.88 + i * 0.01 }}
                >
                  <path
                    d="M12 17.27 18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21z"
                    fill="#D97706"
                  />
                </svg>
              ))}
            </div>

            <button
              type="button"
              onClick={handleRate}
              className="h-[50px] w-full rounded-[9px] bg-accent font-sans text-[15px] font-bold tracking-[.3px] text-white transition-[filter] hover:brightness-110"
            >
              {t('ratingCta', lang)}
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="mt-[10px] h-[48px] w-full rounded-[9px] border-[1.5px] border-gray-300 bg-transparent font-sans text-[14px] font-semibold text-ink transition-colors hover:bg-black/[.04]"
            >
              {t('ratingLater', lang)}
            </button>
            <div
              role="button"
              tabIndex={0}
              onClick={onNever}
              onKeyDown={(e) => e.key === 'Enter' && onNever()}
              className="mt-[14px] cursor-pointer text-center font-sans text-[12px] font-medium text-text-muted underline underline-offset-2"
            >
              {t('ratingNever', lang)}
            </div>
          </>
        )}

        {phase === 'submitting' && (
          <div className="flex flex-col items-center gap-[18px] py-[28px]">
            <div className="h-[40px] w-[40px] animate-spin rounded-full border-[3px] border-gray-300 border-t-accent" />
            <p className="text-center font-sans text-[14px] font-medium text-ink/70">
              {t('ratingSubmitting', lang)}
            </p>
          </div>
        )}

        {phase === 'done' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-[16px] py-[22px]"
          >
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
              className="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-success text-[26px] text-white"
            >
              ✓
            </motion.div>
            <h3 className="text-center font-serif text-[18px] font-semibold text-ink">
              {t('ratingDoneTitle', lang)}
            </h3>
            <p className="text-center font-sans text-[13px] leading-[1.55] text-ink/65">
              {t('ratingDoneBody', lang)}
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
