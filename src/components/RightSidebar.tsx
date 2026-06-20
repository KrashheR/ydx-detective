import type { Language } from '../types';
import type { LeaderboardRow } from '../services/yandexSDK';
import { t } from '../i18n/ui';

interface Props {
  lang: Language;
  balance: number;
  accuracyPct: number;
  solvedCount: number;
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
  balance,
  accuracyPct,
  solvedCount,
  leaderboard,
}: Props) {
  const rows: LeaderboardRow[] =
    leaderboard ??
    [...LOCAL_BOARD, { name: 'you', score: balance }]
      .sort((a, b) => b.score - a.score)
      .map((r, i) => ({
        rank: i + 1,
        name: r.name,
        score: r.score,
        avatar: null,
        isCurrentPlayer: r.name === 'you',
      }));

  return (
    <aside className="flex h-full w-full flex-col gap-6 overflow-y-auto bg-surface p-4">
      <Metric label={t('balance', lang)}>
        <span className="text-2xl font-bold text-paper">
          ₽ {balance.toLocaleString()}
        </span>
      </Metric>

      <Metric label={t('accuracy', lang)}>
        <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-accent transition-[width] duration-500"
            style={{ width: `${accuracyPct}%` }}
          />
        </div>
        <span className="mt-1 block text-sm text-paper/70">
          {accuracyPct}% · {solvedCount}
        </span>
      </Metric>

      <Metric label={t('leaderboard', lang)}>
        <ol className="mt-1 space-y-1.5">
          {rows.map((row) => (
            <li
              key={`${row.rank}-${row.name}`}
              className={`flex items-center justify-between gap-2 rounded px-2 py-1 text-sm ${
                row.isCurrentPlayer ? 'bg-accent/15 text-paper' : 'text-paper/75'
              }`}
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="tabular-nums text-paper/50">{row.rank}.</span>
                {row.avatar && (
                  <img
                    src={row.avatar}
                    alt=""
                    className="h-5 w-5 shrink-0 rounded-full object-cover"
                  />
                )}
                <span className="truncate">{row.name}</span>
              </span>
              <span className="tabular-nums">{row.score.toLocaleString()}</span>
            </li>
          ))}
        </ol>
      </Metric>
    </aside>
  );
}

function Metric({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-1 text-xs font-semibold uppercase tracking-widest text-paper/50">
        {label}
      </h2>
      {children}
    </div>
  );
}
