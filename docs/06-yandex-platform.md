# 06 · Платформа Yandex и персистенс

> **🗺️ Ключевые файлы:** `src/services/yandexSDK.ts` (единственный адаптер `window.YaGames`), `src/services/metrica.ts` (единственный адаптер `window.ym` — аналитика), `src/services/persistence.ts` (снапшот + миграция), `src/config/gameConfig.ts` (`saveVersion`, `analytics`).

`src/services/yandexSDK.ts` — **единственное** место, трогающее `window.YaGames`. Движок
никогда не зовёт SDK напрямую. Любой сбой/отсутствие SDK молча переводит в офлайн-режим;
геймплей никогда не блокируется отсутствием SDK.

## Инициализация

`initYandex()` идемпотентна (`initPromise`). Опрашивает `window.YaGames` до 4с
(`<script>` грузится `async`), затем `getPlayer({ scopes: false })` (без промпта прав).
`canUseCloud()` истинно только когда SDK+player готовы и игрок не `lite` (анонимный).
`features.LoadingAPI.ready()` не вызывается сразу после SDK. Пока loader временно
отключён, оболочка в `main.tsx` вызывает `notifyGameReady()` сразу после гидратации.
При включённом loader это делает `BootScreen` после достижения 100%.

Используемая поверхность SDK:
- `getPlayer()` → `player.setData / getData` (облачные сейвы)
- `serverTime()` → авторитетное время для дейли-гейтинга
- `adv.showFullscreenAdv / showRewardedVideo` → жизненный цикл рекламы (pause guard)
- `getLeaderboards()` → лидерборд (best-effort)
- `feedback.canReview / requestReview` → нативный рейтинг (может отсутствовать)
- `environment.i18n.lang` → автоопределение языка

## Облачные сейвы и персистенс (`services/persistence.ts`)

**Dual-write:**
- **LocalStorage** пишется синхронно при каждом изменении (мгновенно, офлайн-безопасно).
- **Облако** — дебаунс ≤1 запись / `sync.debounceMs` (10с). Закрытие дела и `beforeunload`
  зовут `flushSync` в обход дебаунса.

**Чтение:** облако сначала (кросс-девайс), затем LocalStorage, иначе свежий дефолт. При
наличии облако перетирает локальный кэш. `isNew` (нет сейва нигде) — сигнал засеять язык
из локали Yandex.

Ключ хранения — `claimDetectiveSave` (и локально, и в облаке). Сериализуется только
рантайм-срез `PersistedState` = `{ version, stats, session }`.

## Миграция сейвов

`GAME_CONFIG.saveVersion` — текущая версия схемы персиста (сейчас **4**). `migrate()` в
`persistence.ts` спредит текущие дефолты под старые сейвы, добивая новые поля:
- v1 → v2: добавлены xp / streakCount / lastPlayedServerDay / unlockedAchievementIds в
  stats и revealedEvidenceIds в сессию.
- v2 → v3: добавлен `ratingDismissals` (бэкфиллится через `makeDefaultStats`).
- v3 → v4: добавлены mastery, отдел/услуги, недельный прогресс, daily-ad slot и
  thesis-links активной сессии.

Бампай версию и расширяй `migrate()` при любом изменении формы персиста.

## Серверное время — только для дейли-гейтинга

Дейли-лок/анлок и серверный день серий считаются против `getServerTimeMs()`
(Yandex `serverTime()`), **никогда** против часов устройства. Время устройства — только
офлайн-фолбэк, явно best-effort.

## Реклама и pause guard

Любое открытие/закрытие рекламы (fullscreen или rewarded) вещает через `onPauseChange`,
переключая глобальный `isPaused`, который замораживает игру и показывает оверлей паузы.
Каждый вызов размечен стабильным `placement`; адаптер отдельно фиксирует принятие предложения,
реальный показ, закрытие, награду и ошибку. Время открытой рекламы не входит в active time.

- `showFullscreenAd(onDone)` — интерстишл; `onDone` продолжает действие после закрытия.
  Применяется: каждый 3-й вердикт (`AD_EVERY_N_VERDICTS`), Inspector Note.
- `showRewardedAd(onReward)` — rewarded-видео; `onReward` срабатывает только при реальной
  награде. Применяется: restore funds, удвоение награды, Witness Canvass. В офлайн/dev (нет
  SDK) награда выдаётся мгновенно.

## Лидерборд

Имя — `LEADERBOARD_NAME = 'xp'` (`services/yandexSDK.ts`), должен быть создан в
консоли разработчика, иначе no-op. `submitLeaderboardScore(balance)` — fire-and-forget
после вердикта/restore/double. `fetchLeaderboard(topN=5, around=2)` тянет окно: глобальный
топ + полоса вокруг игрока (дедуп по rank, флаг текущего игрока по `userRank`). Возвращает
null при недоступности → UI фолбэчит.

## Язык

`getYandexLang()` → `environment.i18n.lang`. Стор маппит ведущий сабтег (напр. `pt-br` →
`pt`) на поддерживаемый язык; для первого игрока язык засевается из локали Yandex,
вернувшийся игрок сохраняет выбранный.

## Аналитика (Yandex Metrica)

`src/services/metrica.ts` — **единственное** место, трогающее `window.ym` (аналитический
близнец `yandexSDK.ts`). Цель — детально логировать игровой опыт каждого игрока, чтобы
тюнить экономику/геймплей по реальному поведению. Контракт деградации тот же: нет счётчика
/ `counterId` плейсхолдер → каждый вызов трекинга — молчаливый no-op, геймплей не блокируется,
тесты не требуют реального счётчика.

**Счётчик и инициализация.** ID счётчика — единый источник истины в
`GAME_CONFIG.analytics.counterId` (плейсхолдер `0` = выключено). `index.html` содержит
только лоадер, определяющий очередь `window.ym` и подгружающий `tag.js`; сам
`ym(id, 'init', …)` зовётся из `initMetrica()` (в `gameStore.init()`, после `initYandex()`).
`initMetrica()` идемпотентна; при falsy id или отсутствии `window.ym` адаптер остаётся
выключенным.

**Поверхность адаптера:**
- `initMetrica()` — поднять счётчик (один раз).
- `trackGoal(name, params?)` → `ym(id, 'reachGoal', …)` — событие воронки.
- `setUserParams(params)` → `ym(id, 'userParams', …)` — профиль игрока (уровень, баланс,
  xp, число дел, серия, язык, банкротство). Шлётся на буте и после действий, меняющих эти
  величины (`submitVerdict`, `restoreFunds`, `doubleLastReward`).
- `setAnalyticsAdPaused(paused)` — исключить рекламу из активного времени. Адаптер также
  слушает `visibilitychange`, `pagehide`, `pageshow` и `beforeunload`, фиксируя старт/конец
  сессии, интервалы активной игры и причины паузы/возобновления.

Каждая цель и профиль автоматически получают `economyVersion`, `contentVersion` и
`experimentGroup` из `GAME_CONFIG.analytics`; эти значения меняются только при выпуске
соответствующей версии или запуске эксперимента.

**Где эмитятся события.** Стор — эмиттер (как и для лидерборда): цели зовутся из действий
`gameStore.ts`, где уже посчитаны payload'ы. Имена целей — каталог `GOAL` в `metrica.ts`
(единый источник, держать в лок-степе с этой таблицей; переименование цели обнуляет её
историю в консоли Метрики).

| Цель (`GOAL`) | Откуда | Ключевые параметры |
| --- | --- | --- |
| `session_start`, `session_end` | lifecycle Метрики | visibility, restored, reason, activeTotalMs, exitedAfterAd |
| `active_interval`, `session_pause`, `session_resume` | visibility / реклама | durationMs, activeTotalMs, reason |
| `case_start` | `startCase` | caseId, type, difficulty, claimAmount, evidenceCount, budget |
| `investigation_interrupt`, `investigation_resume` | смена/закрытие/повторный вход в дело | caseId, reason, viewedCount, stampCount |
| `evidence_view` | `markEvidenceAsViewed` (только реально новое открытие) | caseId, evidenceId, evidenceType, viewedCount, budget |
| `evidence_stamp` | `toggleEvidenceStamp` | caseId, evidenceId, stamped, stampCount |
| `hint_buy` | `buyHint` (в колбэке реального раскрытия) | caseId, kind, cost, revealedId, balanceAfter |
| `verdict_submit` | `submitVerdict` | decision, verdictCorrect, verdict/proof/efficiency-компоненты, penalty, bonusPct, dailyMultiplierApplied, total, xpGained, proofRatio, falseStamps, opensUsed |
| `achievement_unlock` | `submitVerdict` (по одному на каждый новый ачив) | achievementId, caseId |
| `rank_up` | `submitVerdict` (при `promotedToLevel`) | newLevel, xp |
| `daily_claim` | `submitVerdict` (`type === 'daily'`) | caseId, total |
| `bankruptcy` | `submitVerdict` (когда `isBankrupt` переходит в true) | caseId, balance |
| `reward_double` | `doubleLastReward` | caseId, amount, balanceAfter |
| `funds_restore` | `restoreFunds` (в колбэке rewarded-видео) | previousBalance, restoredTo |
| `rating_action` | `dismissRating` / `suppressRating` / `App.tsx` (onRate) | action (`dismiss`/`never`/`rate`), dismissals |
| `ad_offer`, `ad_accept`, `ad_open`, `ad_close`, `ad_reward`, `ad_error` | UI + `yandexSDK.ts` | kind, placement, wasShown, rewarded, error |
| `service_view`, `service_select`, `service_buy`, `service_use` | `App.tsx` / `buyHint` | service, caseId, cost, balanceBefore/After |
| `shop_view`, `product_view`, `purchase_start`, `purchase_success`, `purchase_error`, `purchase_restore` | будущая поверхность магазина | productId, price, error |

**Конфиг** (`GAME_CONFIG.analytics`): `counterId`, `webvisor`, `economyVersion`,
`contentVersion`, `experimentGroup`. Персист не
меняется — трекинг always-on, без opt-out, `saveVersion` не бампается.

## Деплой

`npm run build`, затем загрузить **содержимое** `dist/` как ZIP в консоль Yandex Games.
Сборка использует относительный base (`./` в `vite.config.ts`), поэтому работает с
хостинг-пути платформы как есть. См. [08-build-test-deploy.md](08-build-test-deploy.md).
