# 04 · Экономика и прогрессия

> **🗺️ Ключевые файлы:** `src/config/gameConfig.ts` (весь тюнинг), `src/engine/rewardEngine.ts`, `src/engine/rankEngine.ts`, `src/engine/streakEngine.ts`, `src/engine/achievementsEngine.ts` + `src/data/achievements.ts`.

Весь тюнинг живёт в `src/config/gameConfig.ts` (`GAME_CONFIG`) — правь экономику там,
не в движках. Движки (`engine/*`) — чистые детерминированные функции.

## Две экономики (раздельны)

- **balance** — расходуемая валюта (награды → рост, подсказки/банкротство → трата).
  Это же значение публикуется в лидерборд `balance`.
- **xp** — постоянный карьерный прогресс, только растёт, двигает лестницу уровней.

Никогда не конфлать их.

## Формула награды (`evaluateReward`)

`BaseReward = claimAmount × (daily ? 5 : 1)`.

| Компонент | Формула | Условие |
| --------- | ------- | ------- |
| Вердикт | `verdictShare × base` | только если `decision === correctDecision` |
| Доказательства | `proofShare × base × (correctStamps / totalContradictions)` | дело с **0** противоречий → полный proof (защита от деления на ноль) |
| Эффективность | `efficiencyShare × base × (unusedOpens / budget)` | только бюджетные дела **и** верный вердикт |
| Бонус | `(rank% + streak%)` от **позитивной** базы (вердикт+доказательства+эффективность) | никогда не применяется к штрафу |
| Штраф | `falseStampPenalty (50)` за каждую **ложно** заштампованную карточку | безусловно |

Доли (`GAME_CONFIG.reward`):
- Классические дела: `verdictShare 0.5 / proofShare 0.5` (без эффективности).
- Бюджетные дела (`reward.budgeted`): `0.4 / 0.4 / efficiency 0.2` — суммы = 1.0, потолок
  позитива остаётся 100% базы. Классические дела не затронуты.

Прочее: `dailyMultiplier 5`. Итог (`total`) может быть **отрицательным**.
`opensUsed` передаётся в `evaluateReward` из `session.viewedEvidenceIds.length`; при
отсутствии **дефолт = полный бюджет (нулевая эффективность)**.

## XP и уровни (`rankEngine` + `progression`)

XP начисляется за каждое закрытое дело:

- Неверный вердикт → маленький фиксированный `wrongVerdictXp` (2).
- Верный вердикт → `xpDifficultyWeight[difficulty] × (0.5 + 0.5 × proofRatio)`
  (вес: easy 10 / medium 20 / hard 35). Грязный-но-верный получает пол, чистый — максимум.
- Ежедневка → ×`dailyXpMultiplier` (2).

Кумулятивный XP маппится в уровень через `progression.ranks` (лестница **level_01…level_30**,
пороги по `xpThreshold`). Каждый уровень даёт аддитивный `rewardBonusPct` (0% на ур.1 →
30% на ур.30). Названия уровней — i18n-ключи **`level_<id>`** (`level_01`…`level_30`:
Стажёр → … → топ; см. `src/i18n/ui.ts`).

Тонкости:
- Бонус ранга, применённый к делу, читается **до** добавления XP этого дела (отражает
  статус на момент решения, `rankBefore`).
- Детект повышения использует **пост-бонусный** XP (`finalXp`), так что бонусный XP от
  ачивки тоже может перешагнуть порог.
- `evaluateRank` возвращает `level` (1-based), `rewardBonusPct`, `xpIntoRank`, `xpForNext`,
  `progress`, `isMax`.

## Серии (`streakEngine` + `streak`)

Последовательные **серверные** дни (`floor(serverMs / 24h)`) с ≥1 закрытым делом.
`+bonusPctPerDay` (5%) за день, кап `bonusCapPct` (+50%). Реплеи в тот же день не
стакаются; пропуск дня (или часы назад) сбрасывают в 1. Вычисляется только в
`submitVerdict` против серверного времени.

## Достижения (`achievementsEngine` + `data/achievements.ts`)

Одноразовые анлоки, вычисляются против пост-кейс статов после каждого вердикта. Каждая
даёт одноразовый бонус XP + валюты, пишется в `stats.unlockedAchievementIds`. Новые
всплывают на ResultSheet; архив открывается из правого сайдбара.

Текущий каталог (id → условие → XP/валюта):

| id | Условие | Бонус |
| -- | ------- | ----- |
| `first-fraud` | Верно отклонил первое мошенничество | +15 XP / +200 |
| `solved-10` | Закрыто ≥10 дел | +50 XP / +500 |
| `perfect-proof-hard` | 100% точность доказательств на hard-деле | +40 XP / +400 |
| `streak-5` | Серия ≥5 дней | +30 XP / +300 |
| `clean-hands-10` | ≥10 дел без единого ложного штампа | +40 XP / +400 |

Метаданные (icon/title/desc на 5 языках + бонусы) — в `data/achievements.ts`; предикаты
по id — в `achievementsEngine.ts`. Отсутствующий предикат = ачивка просто никогда не
анлокается (безопасно).

## Ежедневное дело

`type === 'daily'` даёт ×5 к награде и ×2 к XP. Доступность считает
`evaluateDailyAvailability` против **серверного** времени; кулдаун `daily.cooldownMs`
(24ч). Пул ежедневок ротируется по индексу серверного дня (`getDailyCase(dayIndex)`).
`lastDailyClaimServerMs` фиксируется при закрытии ежедневки.

## Банкротство

Баланс ≤ `economy.bankruptcyThreshold` (0) ставит `isBankrupt`, что гейтит прогрессию за
rewarded-видео «восстановить средства» → сброс до `restoreFundsTo` (2000). Стартовый
баланс нового игрока — `startingBalance` (2000). В dev/офлайн `showRewardedAd` выдаёт
награду мгновенно, игра остаётся играбельной.

## Разбор награды (`RewardBreakdown`)

`submitVerdict` возвращает `RewardBreakdown`: `verdictComponent`, `proofComponent`,
`efficiencyComponent`, `penalty`, `dailyMultiplierApplied`, `bonusComponent`, `bonusPct`,
`total`. Стор оборачивает его в `VerdictOutcome` (+ `xpGained`, `promotedToLevel`,
`newAchievementIds`) для ResultSheet.
