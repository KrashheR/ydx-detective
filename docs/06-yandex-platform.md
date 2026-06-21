# 06 · Платформа Yandex и персистенс

> **🗺️ Ключевые файлы:** `src/services/yandexSDK.ts` (единственный адаптер `window.YaGames`), `src/services/persistence.ts` (снапшот + миграция), `src/config/gameConfig.ts` (`saveVersion`).

`src/services/yandexSDK.ts` — **единственное** место, трогающее `window.YaGames`. Движок
никогда не зовёт SDK напрямую. Любой сбой/отсутствие SDK молча переводит в офлайн-режим;
геймплей никогда не блокируется отсутствием SDK.

## Инициализация

`initYandex()` идемпотентна (`initPromise`). Опрашивает `window.YaGames` до 4с
(`<script>` грузится `async`), затем `getPlayer({ scopes: false })` (без промпта прав).
`canUseCloud()` истинно только когда SDK+player готовы и игрок не `lite` (анонимный).
`features.LoadingAPI.ready()` зовётся после успешной инициализации.

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

`GAME_CONFIG.saveVersion` — текущая версия схемы персиста (сейчас **3**). `migrate()` в
`persistence.ts` спредит текущие дефолты под старые сейвы, добивая новые поля:
- v1 → v2: добавлены xp / streakCount / lastPlayedServerDay / unlockedAchievementIds в
  stats и revealedEvidenceIds в сессию.
- v2 → v3: добавлен `ratingDismissals` (бэкфиллится через `makeDefaultStats`).

Бампай версию и расширяй `migrate()` при любом изменении формы персиста.

## Серверное время — только для дейли-гейтинга

Дейли-лок/анлок и серверный день серий считаются против `getServerTimeMs()`
(Yandex `serverTime()`), **никогда** против часов устройства. Время устройства — только
офлайн-фолбэк, явно best-effort.

## Реклама и pause guard

Любое открытие/закрытие рекламы (fullscreen или rewarded) вещает через `onPauseChange`,
переключая глобальный `isPaused`, который замораживает игру и показывает оверлей паузы.

- `showFullscreenAd(onDone)` — интерстишл; `onDone` продолжает действие после закрытия.
  Применяется: каждый 3-й вердикт (`AD_EVERY_N_VERDICTS`), Inspector Note.
- `showRewardedAd(onReward)` — rewarded-видео; `onReward` срабатывает только при реальной
  награде. Применяется: restore funds, удвоение награды, Witness Canvass. В офлайн/dev (нет
  SDK) награда выдаётся мгновенно.

## Лидерборд

Имя — `LEADERBOARD_NAME = 'balance'` (`services/yandexSDK.ts`), должен быть создан в
консоли разработчика, иначе no-op. `submitLeaderboardScore(balance)` — fire-and-forget
после вердикта/restore/double. `fetchLeaderboard(topN=5, around=2)` тянет окно: глобальный
топ + полоса вокруг игрока (дедуп по rank, флаг текущего игрока по `userRank`). Возвращает
null при недоступности → UI фолбэчит.

## Язык

`getYandexLang()` → `environment.i18n.lang`. Стор маппит ведущий сабтег (напр. `pt-br` →
`pt`) на поддерживаемый язык; для первого игрока язык засевается из локали Yandex,
вернувшийся игрок сохраняет выбранный.

## Деплой

`npm run build`, затем загрузить **содержимое** `dist/` как ZIP в консоль Yandex Games.
Сборка использует относительный base (`./` в `vite.config.ts`), поэтому работает с
хостинг-пути платформы как есть. См. [08-build-test-deploy.md](08-build-test-deploy.md).
