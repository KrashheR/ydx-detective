# 06 · Платформы и персистенс

> **🗺️ Ключевые файлы:** `src/services/platformAdapter.ts` (единый контракт Yandex/CrazyGames/local), `src/services/yandexSDK.ts` (единственное место с `window.YaGames`), `src/services/metrica.ts` (единственное место с `window.ym`), `src/services/persistence.ts` (снапшот + миграция), `src/config/gameConfig.ts` (`saveVersion`, `analytics`).

`src/services/yandexSDK.ts` — **единственное** место, трогающее `window.YaGames`. Движок
никогда не зовёт SDK напрямую. Любой сбой/отсутствие SDK молча переводит в офлайн-режим;
геймплей никогда не блокируется отсутствием SDK.

## Инициализация

`initYandex()` идемпотентна (`initPromise`). Актуальный лоадер `/sdk.js` подключён в
`index.html` с `async`; адаптер опрашивает `window.YaGames` до 4с, затем вызывает
`getPlayer({ scopes: false })` (без промпта прав).
`canUseCloud()` истинно только когда SDK+player готовы и игрок не `lite` (анонимный).
`features.LoadingAPI.ready()` не вызывается сразу после SDK. Пока loader временно
отключён, оболочка в `main.tsx` вызывает `notifyGameReady()` сразу после гидратации.
При включённом loader это делает `BootScreen` после достижения 100%.

Используемая поверхность SDK:
- `getPlayer()` → `player.setData / getData` (облачные сейвы)
- `serverTime()` → авторитетное время для дейли-гейтинга
- `adv.showFullscreenAdv / showRewardedVideo` → жизненный цикл рекламы (pause guard)
- `getLeaderboards()` → лидерборд (best-effort)
- `getPayments()` → каталог IAP, покупка архива, restore purchases (best-effort)
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

`GAME_CONFIG.saveVersion` — текущая версия схемы персиста (сейчас **9**). `migrate()` в
`persistence.ts` спредит текущие дефолты под старые сейвы, добивая новые поля:
- v1 → v2: добавлены xp / streakCount / lastPlayedServerDay / unlockedAchievementIds в
  stats и revealedEvidenceIds в сессию.
- v2 → v3: добавлен `ratingDismissals` (бэкфиллится через `makeDefaultStats`).
- v3 → v4: добавлены mastery, отдел/услуги, недельный прогресс, daily-ad slot и
  thesis-links активной сессии.
- v4 → v5: добавлен `perfectCaseStreakCount` для подряд закрытых 100%-дел.
- v5 → v6: добавлены `archivePurchasedPackIds`, `archiveUnlockedCaseIds` и
  `archiveAdUnlockServerDayByPack` для прав доступа витрины архивов.
- v6 → v7: удалён `evidenceThesisLinks` из активной сессии (механика «тезисов заявления»
  вырезана целиком; старые сейвы просто теряют это поле при нормализации).
- v7 → v8: банкротство больше не гейт — `isBankrupt` принудительно сбрасывается в `false`
  (разблокировка застрявших на старом жёстком экране); добавлен кумулятивный счётчик
  `interstitialsSeenTotal` (бэкфиллится в 0).

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
  награде. Применяется: restore funds, удвоение награды, Witness Canvass и
  permanent unlock следующего архивного дела. В офлайн/dev (нет SDK) награда выдаётся мгновенно.

## In-app purchases

`yandexSDK.ts` поднимает `payments` best-effort через `getPayments({ signed: false })`.
Права на постоянные архивы обрабатываются на клиенте, поэтому нужны открытые `productId` в
ответе SDK; `signed: true` допустим только при отдельной серверной проверке подписи.
Если payments API недоступен, витрина архивов остаётся browse-only: каталог можно открыть,
но покупка и restore уходят в no-op UI без блокировки геймплея.

- `fetchPaymentsCatalog()` — читает каталог продуктов и цену для кнопки покупки архива.
- `purchaseProduct(productId)` — инициирует покупку полного архива; после успешного ответа UI
  пишет entitlement в `stats.archivePurchasedPackIds`.
- `restorePurchasedProductIds()` — читает уже купленные продукты платформы; UI маппит product ids
  на thematic packs и восстанавливает права локально/в облачном сейве.

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
`GAME_CONFIG.analytics.counterId` (плейсхолдер `0` = выключено). В `index.html` нет
запроса к Метрике: очередь `window.ym`, асинхронная загрузка `tag.js` и
`ym(id, 'init', …)` создаются внутри `initMetrica()`. `gameStore.init()` запускает их
через отложенную задачу только после гидратации сохранения, не ожидая результата, поэтому
медленный VPN или заблокированный `mc.yandex.ru` не задерживает старт игры.
`initMetrica()` идемпотентна; при falsy id адаптер остаётся выключенным, а при
недоступном `tag.js` события безопасно остаются в локальной очереди.

**Поверхность адаптера:**
- `initMetrica()` — поднять счётчик (один раз).
- `trackGoal(name, params?)` → `ym(id, 'reachGoal', …)` только для редких конверсий:
  `boot_complete`, first-case milestones, `case_complete`, onboarding, daily,
  rewarded completion и успешной покупки.
- `trackEvent(name, params?)` → `ym(id, 'params', …)` для повторяемой телеметрии. Каждый
  event получает `eventVersion`, `eventSeq`, `sessionId` и timestamp, поэтому открытия
  улик, штампы, вкладки и ad lifecycle не расходуют цели и не попадают под дедупликацию
  `reachGoal`.
- `setAnalyticsContext(snapshot)` подмешивает текущую попытку в lifecycle-события: при
  уходе со страницы сохраняются caseId, стадия, просмотренные/отштампованные улики и hints.
- `setAnalyticsUserId()` передаёт только opaque Yandex `getUniqueID()`; при offline/lite
  режиме используется persistent anonymous ID. Имена, аватары, email и любые PII не идут в
  Метрику.
- `setUserParams(params)` → `ym(id, 'userParams', …)` — профиль игрока (уровень, баланс,
  xp, число дел, серия, язык, банкротство). Шлётся на буте и после действий, меняющих эти
  величины (`submitVerdict`, `restoreFunds`, `doubleLastReward`).
- `setAnalyticsAdPaused(paused)` — исключить рекламу из активного времени. Адаптер также
  слушает `visibilitychange`, `pagehide`, `pageshow` и `beforeunload`, фиксируя старт/конец
  сессии, интервалы активной игры и причины паузы/возобновления.

Каждая цель и профиль автоматически получают `economyVersion`, `contentVersion` и
`experimentGroup` из `GAME_CONFIG.analytics`; эти значения меняются только при выпуске
соответствующей версии или запуске эксперимента.

**Ad-frequency агрегаты.** `adsPerSession`/`verdictsSinceLastAd` — module-level счётчики в
`metrica.ts` (сбрасываются при перезагрузке страницы, т.е. живут ровно одну сессию); `trackGoal`
инкрементирует их при `verdict_submit`/`ad_open` и подмешивает в `ad_open`/`session_end`.
Кумулятивный `interstitialsSeenTotal` (персистентный, за все сессии) живёт в `PlayerStats`
(с saveVersion 8) и инкрементируется только из `onOpen` реально показанного интерстишла;
неудачная/offline-заявка не маскируется под показ.

**V2 core loop.** После гидратации отправляется `boot_complete` c длительностью и источником
сейва. `case_start`/`verdict_submit` включают campaign position, попытку, время дела,
использованные подсказки и качество доказательств. UI отправляет `evidence_open` и
`evidence_close` (порядок, first-open, dwell time, способ навигации, безопасная разметка
contradiction), а также `result_view`/`result_action`. Это позволяет отдельно измерять
прочтение, решение и продолжение после награды.

**Где эмитятся события.** Стор и UI — эмиттеры (как и для лидерборда): доменные payload'ы
собираются рядом с действием. Имена событий — каталог `GOAL` в `metrica.ts`; только
`CONVERSION_GOAL_NAMES` синхронизируется с целями в консоли, остальные строки — event stream.

| Цель (`GOAL`) | Откуда | Ключевые параметры |
| --- | --- | --- |
| `session_start`, `session_end` | lifecycle Метрики | visibility, restored, reason, activeTotalMs, exitedAfterAd; `session_end` дополнительно несёт `adsPerSession`, `verdictsSinceLastAd` |
| `active_interval`, `session_pause`, `session_resume` | visibility / реклама | durationMs, activeTotalMs, reason |
| `case_start` | `startCase` | caseId, type, difficulty, claimAmount, evidenceCount, budget |
| `investigation_interrupt`, `investigation_resume` | смена/закрытие/повторный вход в дело | caseId, reason, viewedCount, stampCount |
| `evidence_view` | `markEvidenceAsViewed` (только реально новое открытие) | caseId, evidenceId, evidenceType, viewedCount, budget |
| `evidence_stamp` | `toggleEvidenceStamp` | caseId, evidenceId, stamped, stampCount |
| `hint_buy` | `buyHint` (в колбэке реального раскрытия) | caseId, kind, cost, revealedId, balanceAfter, targeted, targetIndex |
| `verdict_submit` | `submitVerdict` | decision, verdictCorrect, verdict/proof/efficiency-компоненты, penalty, bonusPct, dailyMultiplierApplied, total, xpGained, proofRatio, falseStamps, opensUsed |
| `achievement_unlock` | `submitVerdict` (по одному на каждый новый ачив) | achievementId, caseId |
| `rank_up` | `submitVerdict` (при `promotedToLevel`) | newLevel, xp |
| `daily_claim` | `submitVerdict` (`type === 'daily'`) | caseId, total |
| `daily_ad_unlock` | `unlockDailyViaAd` (после rewarded-награды) | — |
| `bankruptcy` | `submitVerdict` (когда `isBankrupt` переходит в true; информационный маркер — ничего не блокирует) | caseId, balance, `blocked: false` |
| `reward_double` | `doubleLastReward` | caseId, amount, balanceAfter |
| `funds_restore` | `restoreFunds` (в колбэке rewarded-видео) | previousBalance, restoredTo |
| `rating_action` | `dismissRating` / `suppressRating` / `App.tsx` (onRate) | action (`dismiss`/`never`/`rate`), dismissals |
| `ad_offer`, `ad_accept`, `ad_open`, `ad_close`, `ad_reward`, `ad_error` | UI + `yandexSDK.ts` | kind, placement, wasShown, rewarded, error; `ad_open` дополнительно несёт сессионные агрегаты `adsPerSession`/`verdictsSinceLastAd` (см. ниже) |
| `service_view`, `service_select`, `service_buy`, `service_use` | `App.tsx` / `buyHint` | service, caseId, cost, balanceBefore/After |
| `shop_view`, `product_view`, `purchase_start`, `purchase_success`, `purchase_error`, `purchase_restore` | `ThematicPacksModal` + `yandexSDK.ts` | productId, archiveId, price, error |
| `reject_blocked` | `App.tsx` (`handleReject`, при попытке отклонить без штампов; 1 раз за открытое дело) | caseId, viewedCount, stampedCount |
| `budget_exhausted` | `App.tsx` (`handleOpenEvidence`, когда `markEvidenceAsViewed` отказывает) | caseId, budget, opensUsed |
| `locked_case_click` | `App.tsx` (`handleSelectStandardCase`, клик по замкнутой карточке) | caseId, `lockReason: 'level' \| 'sequence'`, campaignPosition |
| `tab_switch` | `CaseFile` → callback `App.tsx` | caseId, from, to |

**Конфиг** (`GAME_CONFIG.analytics`): `counterId`, `webvisor`, `economyVersion`,
`contentVersion`, `experimentGroup`. Персист не
меняется — трекинг always-on, без opt-out, `saveVersion` не бампается.

**Синхронизация целей.** `scripts/upload-metrica-goals.mjs` сверяет каталог конверсий
`CONVERSION_GOAL_NAMES` из `metrica.ts`, читает существующие цели через Management API и создаёт только
отсутствующие. По умолчанию команда безопасно делает dry-run; существующие цели не
изменяются и не удаляются:

```bash
npm run metrika:goals          # показать отсутствующие цели
npm run metrika:goals:publish  # создать отсутствующие цели
npm run metrika:goals -- --list
```

Для API-доступа положить `YANDEX_METRICA_COUNTER_ID` и `YANDEX_OAUTH_TOKEN` со scopes
`metrika:read metrika:write` в локальный `.env.metrica.local`; `.env*.local` исключены
из git. Если ID не задан в env, скрипт использует `GAME_CONFIG.analytics.counterId`.

## Деплой

`npm run build`, затем загрузить **содержимое** `dist/` как ZIP в консоль Yandex Games.
Сборка использует относительный base (`./` в `vite.config.ts`), поэтому работает с
хостинг-пути платформы как есть. См. [08-build-test-deploy.md](08-build-test-deploy.md).
## Portal-neutral adapter and save v9

`platformAdapter.ts` selects CrazyGames when `window.CrazyGames.SDK` is present, otherwise the safe
Yandex/local implementation. It owns the shared lifecycle, locale, advertisements and cloud-data
contract. CrazyGames receives `gameplayStart` only after hydration makes the first real action
available, plus `gameplayStop` on teardown; rewarded/midgame ad callbacks drive the same pause guard.
Portal-specific Yandex IAP, rating and leaderboard features are disabled on CrazyGames.

Migration v8 → v9 adds `interactiveEvidenceProgress`, `finalSynthesisProgress` and `metaUnlocked` to
stats and `stamps` to an active session. Old selected evidence is preserved as a `claim_main` stamp,
then normalized to the evidence's exact atomic statement when that case resumes. Existing profiles
start with meta unlocked; only genuinely new profiles enter the three-case onboarding lock.

New Metrica goals are `evidence_analysis_start`, `evidence_analysis_hint`,
`evidence_analysis_complete`, `onboarding_complete`, `final_synthesis_complete` and
`final_synthesis_skip`. Completion events fire only on state transition, not on every progress save.
