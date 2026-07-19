import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Language } from '../types';
import type { LeaderboardRow } from '../services/yandexSDK';
import { evaluateRank } from '../engine/rankEngine';
import { formatInvestigatorLevel, t } from '../i18n/ui';
import { ACHIEVEMENTS } from '../data/achievements';
import { useCountUp } from '../hooks/useCountUp';

interface Props {
  lang: Language;
  /** Cumulative career XP — drives the investigator rank card. */
  xp: number;
  balance: number;
  accuracyPct: number;
  solvedCount: number;
  /** Wrong verdicts — shown next to total cases in the accuracy card. */
  errorsCount: number;
  /** Consecutive-day streak — shown when active (> 1). */
  streak: number;
  /** Consecutive first-time 100%-proof cases — shown when active (> 0). */
  perfectStreak: number;
  /** Ids of unlocked achievements — drives the archive button count. */
  unlockedAchievementIds: string[];
  onOpenAchievements: () => void;
  /** Real Yandex leaderboard rows, or null when unavailable (offline/dev). */
  leaderboard: LeaderboardRow[] | null;
}

/** Local fallback shown when the Yandex leaderboard is unavailable. */
const LOCAL_BOARD = [
  { name: 'sasha_k', score: 9420 },
  { name: 'marat99', score: 7180 },
  { name: 'elena.d', score: 6050 },
];

/** Right column: live analytics dashboard. */
export function RightSidebar({
  lang,
  xp,
  balance,
  accuracyPct,
  solvedCount,
  errorsCount,
  streak,
  perfectStreak,
  unlockedAchievementIds,
  onOpenAchievements,
  leaderboard,
}: Props) {
  const rank = evaluateRank(xp);
  const levelTitle = formatInvestigatorLevel(rank.level, lang);

  const displayBalance = useCountUp(balance);
  const displayAccuracyPct = useCountUp(accuracyPct);
  const displayXp = useCountUp(xp);
  const displayXpIntoRank = useCountUp(rank.xpIntoRank);

  const [balanceDelta, setBalanceDelta] = useState<{ id: number; amount: number } | null>(
    null,
  );
  const prevBalanceRef = useRef(balance);
  useEffect(() => {
    const diff = balance - prevBalanceRef.current;
    prevBalanceRef.current = balance;
    if (diff === 0) return;
    setBalanceDelta({ id: Date.now(), amount: diff });
    const timeout = window.setTimeout(() => setBalanceDelta(null), 900);
    return () => window.clearTimeout(timeout);
  }, [balance]);

  const rows: LeaderboardRow[] =
    leaderboard ??
    [...LOCAL_BOARD, { name: 'you', score: xp }]
      .sort((a, b) => b.score - a.score)
      .map((r, i) => ({
        rank: i + 1,
        name: r.name,
        score: r.score,
        avatar: null,
        isCurrentPlayer: r.name === 'you',
      }));

  return (
    <aside className="flex h-full w-full flex-col gap-3.5 overflow-y-auto rounded-xl border border-border bg-surface p-4 md:p-[18px]">
      <div className="text-[11px] font-semibold tracking-[1.5px] text-text-dim">
        {t('analytics', lang)}
      </div>

      {/* Investigator rank — desktop analytics column */}
      <Card className="hidden md:block">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs font-semibold text-text-light">
            {t('rank', lang)}
          </span>
          <span className="text-xs font-bold text-accent">{levelTitle}</span>
        </div>
        <div className="mt-[9px] h-[7px] overflow-hidden rounded bg-surface">
          <div
            className="h-full rounded bg-accent transition-[width] duration-500"
            style={{ width: `${Math.round(rank.progress * 100)}%` }}
          />
        </div>
        <div className="mt-1.5 text-[10px] font-medium text-text-dim">
          {rank.isMax || rank.xpForNext === null
            ? `${displayXp} ${t('xpGained', lang)}`
            : `${displayXpIntoRank} / ${rank.xpForNext} ${t('xpToPromote', lang)}`}
        </div>
      </Card>

      {/* Company balance */}
      <Card className="relative overflow-visible">
        <div className="text-[11px] font-medium text-text-dim">
          {t('companyBalance', lang)}
        </div>
        <div className="mt-1 font-mono text-[21px] font-bold text-success">
          ₽ {displayBalance.toLocaleString('ru-RU')}
        </div>
        <AnimatePresence>
          {balanceDelta && (
            <motion.div
              key={balanceDelta.id}
              className="pointer-events-none absolute right-3.5 top-2 font-mono text-[13px] font-bold text-success"
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: -14 }}
              exit={{ opacity: 0, y: -22 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              {balanceDelta.amount >= 0 ? '+' : '−'}
              {Math.abs(balanceDelta.amount).toLocaleString('ru-RU')} ₽
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Investigation accuracy */}
      <Card>
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-medium text-text-dim">
            {t('investigationAccuracy', lang)}
          </span>
          <span className="font-mono text-[18px] font-bold text-accent">
            {displayAccuracyPct}%
          </span>
        </div>
        <div className="mt-[9px] h-[7px] overflow-hidden rounded bg-surface">
          <div
            className="h-full bg-accent transition-[width] duration-500"
            style={{ width: `${accuracyPct}%` }}
          />
        </div>
        <div className="mt-1.5 text-[10px] font-medium text-text-dim">
          {solvedCount} {t('casesWord', lang)} · {errorsCount} {t('errorsWord', lang)}
        </div>
      </Card>

      {/* Daily streak (kept from extended feature set) */}
      {streak > 1 && (
        <Card>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-gold">
            <span aria-hidden>🔥</span>
            <span>
              {t('streak', lang)}: {streak} {t('streakDays', lang)}
            </span>
          </div>
        </Card>
      )}

      {perfectStreak > 0 && (
        <Card>
          <div className="text-sm font-semibold text-accent">
            {t('perfectStreak', lang)}: {perfectStreak}
          </div>
        </Card>
      )}

      {/* Achievements archive button */}
      <motion.button
        type="button"
        onClick={onOpenAchievements}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
        className="flex items-center justify-between rounded-[10px] border border-border bg-surface-2 px-3.5 py-3 text-left text-sm text-text-light transition-colors hover:border-black/15"
      >
        <span className="flex items-center gap-2">
          <span aria-hidden>🏅</span>
          {t('achievements', lang)}
        </span>
        <span className="font-mono text-text-dim">
          {unlockedAchievementIds.length} / {ACHIEVEMENTS.length}
        </span>
      </motion.button>

      {/* Weekly leaderboard */}
      <Card>
        <div className="mb-2 text-[11px] font-semibold tracking-[1px] text-text-dim">
          {t('leaderboardWeek', lang)}
        </div>
        <ol>
          {rows.map((row, i) => (
            <React.Fragment key={`${row.rank}-${row.name}`}>
              {i > 0 && row.rank > (rows[i - 1]?.rank ?? 0) + 1 && (
                <li
                  aria-hidden
                  className="select-none py-0.5 text-center font-mono text-xs text-text-dim"
                >
                  ⋯
                </li>
              )}
              <li
                className="flex items-center gap-2.5 border-b border-border py-[7px] last:border-0"
              >
              <span className="w-5 font-mono text-xs font-bold text-text-dim">
                {String(row.rank).padStart(2, '0')}
              </span>
              {row.avatar && (
                <img
                  src={row.avatar}
                  alt=""
                  className="h-5 w-5 shrink-0 rounded-full object-cover"
                />
              )}
              <span
                className={`min-w-0 flex-1 truncate text-xs font-semibold ${
                  row.isCurrentPlayer ? 'text-accent' : 'text-text-light'
                }`}
              >
                {row.name}
              </span>
              <span className="font-mono text-xs text-text-muted">
                {row.score.toLocaleString('ru-RU')}
              </span>
              </li>
            </React.Fragment>
          ))}
        </ol>
      </Card>
    </aside>
  );
}

function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[10px] border border-border bg-surface-2 p-3.5 ${className}`}
    >
      {children}
    </div>
  );
}
