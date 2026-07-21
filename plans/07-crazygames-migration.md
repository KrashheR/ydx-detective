# 07 — Миграция с Yandex Games на CrazyGames и подготовка публикации

> Статус: план реализации, составлен 2026-07-21 по текущему коду и официальной документации
> CrazyGames SDK v3. Этот файл предназначен как техническое задание агенту.
>
> Агент: выполняй этапы по порядку, отмечай `[x]` только после проверки, после каждого этапа
> обновляй строку **«Статус этапа»**. Не коммить и не пушь: готовые изменения оставляй человеку
> для ревью. Перед началом перечитай `AGENTS.md` и соответствующий документ из `docs/`.

## 1. Цель и итоговая архитектура

Подготовить игру к публикации на CrazyGames, полностью удалить runtime-поддержку Yandex Games и
оставить два режима исполнения:

1. `crazygames` — CrazyGames HTML5 SDK v3, Data Module, lifecycle и реклама CrazyGames;
2. `local` — безопасная локальная разработка/тесты через `localStorage`, без портального SDK.

После миграции:

- `src/services/crazyGamesSDK.ts` — единственное место, которое обращается к
  `window.CrazyGames.SDK`;
- `src/services/platformAdapter.ts` — портал-нейтральный контракт `crazygames | local`, без
  импорта Yandex-кода и без экспортов с именами `initYandex` / `getYandexLang`;
- `src/services/yandexSDK.ts`, его тесты, `/sdk.js`, `window.YaGames`, `window.ym`, Yandex Metrica,
  Yandex Payments, Yandex feedback и Yandex leaderboard удалены;
- на CrazyGames сохранения читаются и пишутся только через Data Module; прямой `localStorage`
  используется только адаптером `local`;
- игра корректно работает в Basic Launch, где реклама выключена, и может быть переключена в
  Full Launch без повторной переделки архитектуры.

## 2. Зафиксированные продуктовые решения

Эти решения считаются частью задания. Не расширять объём работ без согласования.

### 2.1. Basic Launch и Full Launch

- Первую публикацию готовим для **Basic Launch**: SDK интегрирован, но rewarded-CTA скрыты, а
  midgame-реклама не влияет на продолжение игры. В Basic Launch CrazyGames всё равно отключает
  монетизацию.
- Добавить build-time флаг `VITE_CRAZYGAMES_ADS_ENABLED` с безопасным значением по умолчанию
  `false`. Значение `true` используется только после допуска к Full Launch и проверки в Preview/QA.
- Отсутствие рекламы, `adsDisabledBasicLaunch`, `unfilled`, `adblock` и `adCooldown` никогда не
  замораживают игру и не выдают rewarded-награду.

### 2.2. Покупки и архивные права

- Yandex Payments удалить полностью.
- Для первого релиза не интегрировать Xsolla: IAP на CrazyGames — invite-only возможность.
- Кнопки покупки и восстановления покупок скрыть, чтобы не показывать неработающий интерфейс.
- `archivePurchasedPackIds` и доменные методы выдачи archive entitlement пока сохранить как
  портал-нейтральный задел под будущую Xsolla-интеграцию; не выдавать новые права без подтверждённой
  покупки.
- Если CrazyGames позже даст доступ к IAP, оформить отдельный план: CrazyGames user ID, Xsolla,
  статусы заказов, восстановление прав и запрет покупок в CrazyGames mobile app.

### 2.3. Лидерборд

- Удалить Yandex leaderboard API и автоматическую отправку XP.
- CrazyGames leaderboard не включать в первый релиз: функция invite-only, а клиентская отправка
  требует конфигурации и ключа в Developer Portal.
- Не показывать фиктивную «глобальную/недельную» таблицу как данные платформы. Локальную карьерную
  сводку можно оставить, но назвать её локальным прогрессом через i18n.
- После приглашения CrazyGames сделать отдельный этап для одного weekly leaderboard; XP —
  рекомендуемая метрика, `DESC`, с ограничениями и cooldown в портале.

### 2.4. Рейтинг и обратная связь

- Удалить `RatingModal`, `canReview`, `requestReview`, `GAME_CONFIG.rating`, rating-эффекты в
  `App.tsx` и связанные строки i18n. Оценка/feedback остаются интерфейсом портала CrazyGames.
- Удалить `ratingDismissals` из актуальной формы `PlayerStats`; миграция старого сейва должна
  спокойно проигнорировать поле.

### 2.5. Аналитика

- Полностью удалить загрузку Yandex Metrica, `window.ym`, counter ID, Management API-скрипт и npm
  команды `metrika:*`.
- Переименовать `metrica.ts` в портал-нейтральный `analytics.ts`. Сохранить только то, что нужно
  самой игре: каталог событий, active-time/ad-frequency счётчики и no-op транспорт. Это уменьшит
  churn в местах вызова и сохранит расчёт частоты интерстишлов.
- Для первого релиза использовать метрики Developer Dashboard CrazyGames. ByteBrew или другой
  внешний транспорт — отдельная задача с privacy/consent review.

### 2.6. Время для daily-механик

CrazyGames SDK не предоставляет аналог Yandex `serverTime()`. В этой миграции:

- переименовать `getServerTimeMs()` в `getCurrentTimeMs()` и использовать `Date.now()`;
- переименовать persisted-поля, где `Server` обещает несуществующую гарантию;
- явно задокументировать, что daily cooldown и streak теперь best-effort и зависят от часов
  устройства;
- не добавлять внешний backend только ради времени. Если защита daily от перевода часов станет
  продуктовым требованием, это отдельная серверная задача.

## 3. Что уже есть и почему заготовку нельзя считать готовой

Текущий `platformAdapter.ts` уже содержит `crazyAdapter`, но в нём есть блокирующие ошибки:

- SDK выбирается по наличию `window.CrazyGames.SDK`, без проверки `SDK.environment`; на стороннем
  домене среда `disabled`, и вызовы SDK бросают ошибки;
- `environment` ошибочно типизирован как объект с `locale`, хотя в SDK v3 это строка
  `local | crazygames | disabled`; locale нужно брать из актуального system info;
- Data Module ошибочно типизирован как async/object API; реально это sync API, совместимое с
  `localStorage`, и оно хранит строки — snapshot нужно `JSON.stringify`/`JSON.parse`;
- адаптер делает dual-write в собственный `localStorage`, хотя CrazyGames требует полностью
  полагаться на Data Module для гостей и авторизованных игроков;
- пауза и `onShown` срабатывают до `adStarted`; CrazyGames требует ставить на паузу/глушить звук
  только после фактического старта рекламы;
- `gameplayStart` вызывается сразу после гидратации и остаётся активным почти весь сеанс, включая
  меню/результаты;
- `loadingStart/loadingStop`, `game.settings.muteAudio` и корректные ad error payload отсутствуют;
- при отсутствии rewarded SDK текущий код бесплатно выдаёт награду — это нельзя оставлять в
  production fallback;
- Yandex-only рейтинг, платежи, лидерборд, Metrica и множество Yandex-имён остаются в коде и
  документации.

Текущий каталог `dist/` занимает примерно **15 MB / 406 файлов**, что укладывается в лимит mobile
homepage (20 MB) и лимит 1500 файлов, но это только предварительная точка отсчёта. После чистой
сборки размеры и initial download нужно измерить заново.

## 4. Этапы реализации

### Этап 0 — Базовая фиксация и узкие тесты

- [ ] Проверить состояние рабочего дерева, не затирать чужие изменения.
- [ ] Запустить текущие `npm run typecheck` и `npm test`; записать исходный результат ниже.
- [ ] Зафиксировать свежие `du -sh dist`, число файлов и самые тяжёлые файлы после `npm run build`.
- [ ] Создать список runtime-вхождений Yandex командой:

  ```bash
  rg -n "YaGames|Yandex|yandex|window\.ym|metrika|mc\.yandex" \
    src index.html package.json vite.config.ts README.md AGENTS.md docs scripts
  ```

**Статус этапа:** не начат.

### Этап 1 — Правильная граница CrazyGames SDK v3

Ключевые файлы: `index.html`, новый `src/services/crazyGamesSDK.ts`,
`src/services/platformAdapter.ts`, `src/services/platformAdapter.test.ts`, `src/index.ts`.

- [ ] В `index.html` удалить `<script src="/sdk.js">` и подключить перед игровым module script:

  ```html
  <script src="https://sdk.crazygames.com/crazygames-sdk-v3.js"></script>
  ```

- [ ] Создать минимальные локальные TypeScript-типы только для реально используемой поверхности
  SDK v3: `environment`, `init`, `game`, `game.settings`, settings listener, `ad`, `data`,
  `user.systemInfo`.
- [ ] Реализовать идемпотентный `initCrazyGames()`. После `await SDK.init()` разрешать вызовы SDK
  только при `environment === 'local' || environment === 'crazygames'`; `disabled`, отсутствие
  скрипта и init error переводят приложение в `local` без падения.
- [ ] Сделать `crazyGamesSDK.ts` единственным владельцем `window.CrazyGames`.
- [ ] Сузить `PlatformAdapter.id` до `'crazygames' | 'local'`; удалить импорт `yandexSDK`.
- [ ] Переименовать публичные методы и все импорты:

  - `initYandex` → `initPlatform`;
  - `notifyGameReady` → `notifyLoadingStop`;
  - добавить `notifyLoadingStart`;
  - `getYandexLang` → `getPlatformLocale`;
  - `getServerTimeMs` → `getCurrentTimeMs`.

- [ ] Не определять портал только до `init()`: хранить завершённое состояние адаптера, чтобы
  StrictMode/двойной init не создавал гонки и повторные listeners.
- [ ] Обновить публичные экспорты `src/index.ts`.
- [ ] Написать тесты: SDK отсутствует, init reject, environment disabled, environment local,
  environment crazygames, повторный init.
- [ ] Удалить `src/services/yandexSDK.ts` и `src/services/yandexSDK.test.ts` только после переноса
  всех общих типов (`AdPlacement` и доменные типы не должны жить в портальном файле).

**Gate:** `npm run typecheck` и узкий `vitest` для нового SDK/адаптера.

**Статус этапа:** не начат.

### Этап 2 — Data Module, миграция сейва и время

Ключевые файлы: `src/services/crazyGamesSDK.ts`, `src/services/persistence.ts`,
`src/services/persistence.test.ts`, `src/types/index.ts`, `src/store/gameStore.ts`, движки daily/
streak, `src/config/gameConfig.ts`.

- [ ] Реализовать Data Module как синхронное строковое хранилище:

  - `data.getItem(key): string | null`;
  - `data.setItem(key, JSON.stringify(snapshot))`;
  - `JSON.parse` только внутри безопасной границы;
  - повреждённая строка, quota/1 MB, `dataModuleDisabled` и другие ошибки не ломают boot.

- [ ] На CrazyGames не читать и не писать `window.localStorage` напрямую. Для guest-пользователя
  это уже делает сам Data Module; при login SDK сам переносит/переключает данные.
- [ ] В режиме `local` сохранить один storage key `claimDetectiveSave` в `localStorage`.
- [ ] Упростить persistence: писать актуальную строку при каждой мутации; не держать собственный
  10-секундный cloud debounce поверх SDK, потому что Data Module сам debounce-ит записи.
- [ ] Boot-порядок: `initPlatform()` должен завершиться до первого чтения Data Module — SDK
  подгружает account save во время init.
- [ ] При конфликте не сливать два snapshot: Data Module является единственным source of truth на
  CrazyGames. Local fallback используется только когда активен адаптер `local`.
- [ ] Поднять `GAME_CONFIG.saveVersion` **9 → 10** и расширить `migrate()`.
- [ ] Переименовать inaccurate persisted-поля и их ссылки, сохранив значения из v9:

  - `lastDailyClaimServerMs` → `lastDailyClaimMs`;
  - `lastPlayedServerDay` → `lastPlayedDay`;
  - `dailyAdUnlockServerDay` → `dailyAdUnlockDay`;
  - `serviceFreeUseServerDay` → `serviceFreeUseDay`;
  - `archiveAdUnlockServerDayByPack` → `archiveAdUnlockDayByPack`;
  - `startedAtServerMs` → `startedAtMs`.

- [ ] Удалить `ratingDismissals` из актуального default/type; v9 поле игнорировать при миграции.
- [ ] Заменить daily/streak clock на `getCurrentTimeMs()`/`Date.now()` и обновить комментарии,
  названия локальных переменных и тесты. Не называть это серверным временем.
- [ ] Проверить snapshot size и добавить тест/guard, что сериализованный обычный сейв значительно
  меньше лимита 1 MB.
- [ ] В Developer Portal при загрузке обязательно выбрать **Progress Save: Data Module = Yes**.

**Gate:** тесты `persistence`, `gameStore`, daily/reward/streak + `npm run typecheck`.

**Статус этапа:** не начат.

### Этап 3 — Locale, loading и gameplay lifecycle

Ключевые файлы: `src/main.tsx`, `src/BootScreen.tsx` (если возвращается в entry), `src/App.tsx`,
`src/store/gameStore.ts`, `src/utils/initialLanguage.ts`, `index.html`, SDK/adapter tests.

- [ ] После init читать locale из актуального `SDK.user.systemInfo`; нормализовать ведущий subtag.
- [ ] Для нового игрока: supported platform locale → язык игры; unsupported/missing → **English**.
  Для вернувшегося игрока сохранять его выбор.
- [ ] В `index.html` поменять `lang` и статический loader fallback с `ru` на `en`; сохранить RTL
  для Arabic.
- [ ] Вызвать `game.loadingStart()` после успешного init и до гидратации/критических ресурсов.
- [ ] Вызвать `game.loadingStop()` ровно один раз, когда интерактивный стол/меню уже отрисован и
  доступен.
- [ ] Не считать меню геймплеем. Вызвать `gameplayStart()` при входе в реально интерактивное дело
  (первый core-loop), а `gameplayStop()` при возврате на стол, result screen, блокирующей паузе и
  unmount. Evidence modal внутри дела остаётся gameplay.
- [ ] Не эмитить start/stop на `visibilitychange`: CrazyGames сам обрабатывает уход фокуса.
- [ ] Сделать lifecycle state machine идемпотентной: повторный `start`/`stop` не отправляет дубли.
- [ ] Подписаться на `game.settings.muteAudio`. Это значение имеет приоритет над внутренней
  настройкой звука. Сейчас игра фактически без аудио — всё равно хранить platform-muted state и
  listener, чтобы будущий звук не нарушил Full Launch.
- [ ] Опционально, после основной интеграции: `setGameContext` с `caseId`, campaign position и
  этапом дела; очищать при выходе. Не передавать claim text и персональные данные.
- [ ] Проверить требование Full Launch «до gameplay не более одного клика»: текущий путь
  loader → стол → выбор первого дела должен укладываться в один осмысленный клик.

**Gate:** unit lifecycle sequences + App smoke test + ручной console-log SDK на localhost.

**Статус этапа:** не начат.

### Этап 4 — Реклама CrazyGames и Basic Launch fallback

Ключевые файлы: `src/services/crazyGamesSDK.ts`, `src/services/platformAdapter.ts`,
`src/store/gameStore.ts`, `src/App.tsx`, rewarded UI-компоненты, i18n, tests.

- [ ] Заменить callback-контракт рекламы на явный результат: `finished | unavailable | error`
  плюс нормализованный error code. Reward выдавать только при `finished`.
- [ ] Для `midgame` и `rewarded`:

  - request сам по себе не ставит игру на паузу;
  - `adStarted` → `gameplayStop`, `isPaused = true`, mute, `onShown`/счётчик показа;
  - `adFinished` → снять pause/mute, продолжить игру; rewarded получает награду;
  - `adError` → снять pause только если был `adStarted`, продолжить midgame transition, награду не
    выдавать;
  - каждый terminal callback выполняется не более одного раза.

- [ ] Midgame запрашивать только в естественных паузах после результата/между делами. Не вводить
  собственный жёсткий трёхминутный cooldown: CrazyGames управляет частотой; текущий продуктовый
  гейт можно оставить только как ограничитель, а не как попытку обойти SDK cooldown.
- [ ] При `VITE_CRAZYGAMES_ADS_ENABLED=false`:

  - не показывать rewarded-кнопки double reward, restore funds, Witness Canvass, daily skip и
    archive unlock;
  - midgame transition всегда продолжает работу без рекламы;
  - не показывать пустой/disabled CTA «посмотреть видео».

- [ ] При ads enabled и `unfilled/adblock/adCooldown` показать короткий локализованный toast
  «Видео сейчас недоступно, попробуйте позже», не менять экономику.
- [ ] Проверить, что ни одно обязательное действие/прохождение дела не требует rewarded ads.
- [ ] Если аудио будет добавлено до публикации, реально приостанавливать все audio contexts на
  `adStarted`, а не только показывать pause overlay.
- [ ] Покрыть тестами все callback-порядки, Basic mode, adblock/unfilled и отсутствие двойной
  награды при повторном callback.

**Gate:** adapter/store/App ad tests + ручная проверка local SDK overlay и Preview Tool.

**Статус этапа:** не начат.

### Этап 5 — Удаление Yandex-only функций и нейтрализация аналитики

Ключевые файлы: `src/App.tsx`, `src/store/gameStore.ts`, `src/components/RatingModal.tsx`,
`src/components/RightSidebar.tsx`, `src/components/ThematicPacksModal.tsx`, `src/i18n/ui.ts`,
`src/config/gameConfig.ts`, `src/services/metrica.ts`, `scripts/upload-metrica-goals.mjs`,
`package.json`.

- [ ] Удалить rating modal/flow/store actions/config/i18n/test branches.
- [ ] Удалить payments API из adapter/App, скрыть purchase/restore UI; оставить browsing архива и
  разрешённые без IAP способы доступа.
- [ ] Удалить Yandex leaderboard fetch/submit. Переписать `RightSidebar`, чтобы локальный блок не
  выдавал себя за глобальную weekly-таблицу.
- [ ] Перенести `AdPlacement`, `PaymentsProduct` (если ещё нужен как доменный placeholder) и
  `LeaderboardRow` (если ещё нужен локально) из портального файла в нейтральные types либо удалить.
- [ ] Переименовать `metrica.ts`/test в `analytics.ts`/test; удалить tag loader, `window.ym`,
  `counterId`, user ID и Yandex-specific goal publishing.
- [ ] Удалить `scripts/upload-metrica-goals.mjs` и `metrika:*` из `package.json`.
- [ ] Оставить `trackEvent/trackGoal` как no-op transport + локальные session/active-time counters
  или сузить API после проверки всех потребителей.
- [ ] Проверить, что сборка не делает запросов к `mc.yandex.ru`, `yandex.ru` и `/sdk.js`.

**Gate:** обновлённые App/store/analytics tests + `npm run typecheck`.

**Статус этапа:** не начат.

### Этап 6 — CrazyGames QA: responsive, initial download и внешние ресурсы

Ключевые файлы: `index.html`, `src/index.css`, responsive-компоненты, `public/`, build scripts.

- [ ] Самохостить Inter и IBM Plex в WOFF2 и удалить Google Fonts/preconnect. Это уменьшает
  внешний network/privacy риск и делает первый рендер стабильнее.
- [ ] Проверить только относительные пути в bundle; `base: './'` сохранить.
- [ ] Убедиться, что в игре нет собственной fullscreen-кнопки, cross-promotion, брендинга Yandex,
  внешней рекламы и ссылок на playable-версии других порталов.
- [ ] Добавить mobile anti-selection CSS, не ломая доступность кнопок и прокрутку:
  `user-select: none`/`-webkit-user-select: none`; отдельно проверить удержание/двойной tap.
- [ ] Проверить safe-area padding в CrazyGames App и `viewport-fit=cover` на mobile/tablet.
- [ ] Ручная визуальная матрица при `devicePixelRatio: 1`:

  - desktop iframe: 821×462, 907×510, 1077×606, 1216×684;
  - desktop fullscreen: 1280×720, 1366×768, 1536×864, 1920×1080;
  - mobile/tablet: 800×450, 1080×607;
  - Chrome и Edge обязательно; Safari — best effort.

- [ ] Проверить touch/mouse/keyboard, RTL Arabic, все пять языков и English fallback.
- [ ] Сделать чистую production-сборку и проверить:

  - total ≤ 250 MB;
  - files ≤ 1500;
  - initial download до первого `gameplayStart` ≤ 20 MB (цель mobile homepage; абсолютный Basic
    предел 50 MB);
  - время до реального gameplay в Preview ≤ 20 секунд;
  - тяжёлые case/evidence assets продолжают грузиться лениво.

- [ ] Добавить воспроизводимую команду/скрипт формирования ZIP, где `index.html` лежит в корне
  архива, и краткий release report с размером/числом файлов.

**Gate:** `npm run build` + smoke из распакованного ZIP по HTTP, не через `file://`.

**Статус этапа:** не начат.

### Этап 7 — Тесты, документация и zero-Yandex audit

- [ ] Заменить `yandexSDK.test.ts` на тесты CrazyGames SDK v3.
- [ ] Обновить mocks в `App.test.tsx`, `gameStore.test.ts`, persistence/adapter tests.
- [ ] Добавить регресс-тесты save v9 → v10, строкового Data Module и corrupt save.
- [ ] Добавить тесты lifecycle, locale, SDK disabled, Basic Launch и rewarded terminal callbacks.
- [ ] Переименовать `docs/06-yandex-platform.md` → `docs/06-crazygames-platform.md` и хирургически
  обновить `docs/README.md`, `01`, `02`, `03`, `04`, `08`, `README.md`, `AGENTS.md`, package
  description, source comments и type comments.
- [ ] В `AGENTS.md` заменить платформенные инварианты: единственный `window.CrazyGames`, Data
  Module source of truth, device-time limitation, ads only through SDK.
- [ ] Обновить docs map и все относительные ссылки на переименованный документ.
- [ ] В актуальном runtime/docs следующий аудит должен быть пустым:

  ```bash
  rg -n "YaGames|Yandex|yandexSDK|window\.ym|mc\.yandex|metrika" \
    src index.html package.json vite.config.ts README.md AGENTS.md docs scripts
  ```

  Исторические дизайн-handoff/старые планы можно не переписывать, если они не входят в runtime и
  явно помечены архивными.
- [ ] Финальные обязательные ворота репозитория:

  ```bash
  npm run typecheck
  npm test
  npm run build
  ```

**Статус этапа:** не начат.

### Этап 8 — Материалы и отправка в Developer Portal

Это смешанный этап: код готовит агент, портал и финальные маркетинговые решения подтверждает человек.

- [ ] Создать `release/crazygames/README.md` с версией, changelog, controls, supported languages,
  orientation, save/ads flags, известными ограничениями и QA checklist.
- [ ] Подготовить English metadata: название, short/long description, инструкции и управление;
  затем локализованные варианты при необходимости.
- [ ] Подготовить три согласованных cover:

  - landscape 1920×1080;
  - portrait 800×1200;
  - square 800×800.

  На cover допускается только название игры; без рамок, store/platform logos, «Play now» и чужих
  защищённых материалов.
- [ ] Подготовить два preview video без звука, 15–20 секунд, ≤ 50 MB: landscape 1080p 16:9 и
  portrait 1080p 2:3; без заставки, чёрных полос, курсора и promotional text.
- [ ] Загрузить ZIP в Developer Portal Preview Tool.
- [ ] В submission включить Data Module progress save, указать landscape/mobile support и все
  реально проверенные языки.
- [ ] Пройти QA Tool: SDK init, Data save/reload, guest flow, lifecycle events, Basic ads disabled,
  responsive, browser console/network errors.
- [ ] Перед Basic Launch оставить `VITE_CRAZYGAMES_ADS_ENABLED=false`.
- [ ] После двухнедельного Basic Launch оценить dashboard: gameplay conversion, average playtime,
  D1 retention и feedback. Не включать Full Launch рекламу до приглашения/одобрения CrazyGames.
- [ ] Для Full Launch собрать `ads=true`, снова пройти ad QA и проверить rewarded UX/adblock.

**Статус этапа:** не начат.

## 5. Definition of Done

Работа считается завершённой только когда одновременно выполнено следующее:

- [ ] В runtime нет Yandex SDK, Metrica, Yandex Payments/feedback/leaderboard и Yandex network calls.
- [ ] CrazyGames SDK v3 инициализируется один раз и безопасно деградирует в local mode.
- [ ] Data Module хранит JSON-строку, является единственным storage на CrazyGames и переживает
  reload; v9 save мигрирует в v10.
- [ ] Locale берётся из CrazyGames system info; unsupported locale даёт English.
- [ ] `loadingStart/loadingStop` и `gameplayStart/gameplayStop` видны в Preview Tool в правильном
  порядке, без дублей и без меню как gameplay.
- [ ] Игра ставится на паузу/глушится только на `adStarted`; rewarded не выдаётся при ошибке.
- [ ] Basic Launch не показывает неработающие rewarded CTA.
- [ ] Покупки, rating prompt и platform leaderboard не притворяются доступными.
- [ ] ZIP работает с относительными путями, укладывается в лимиты и проходит viewport/browser QA.
- [ ] `npm run typecheck`, `npm test`, `npm run build` зелёные.
- [ ] Документация описывает CrazyGames как единственную целевую платформу.
- [ ] Preview/QA Tool не показывает блокирующих ошибок.

## 6. Риски и решения, которые нельзя замаскировать кодом

| Риск | Решение |
| --- | --- |
| Нет серверного времени CrazyGames | Device time как явно задокументированный best-effort; backend — отдельный проект |
| IAP недоступны без приглашения | Не показывать purchase UI; Xsolla не имитировать |
| Leaderboard invite-only | Не показывать глобальные данные; интегрировать после допуска |
| Ads отключены в Basic Launch | Rewarded CTA скрыты; midgame всегда продолжает transition |
| Data Module выключен в submission | Считать release blocker; включить Progress Save toggle и проверить Preview |
| SDK `disabled` на стороннем домене | Не вызывать SDK, использовать local adapter, не падать |
| Старый dual-write может перетирать account save | На CrazyGames полностью доверять Data Module после init |
| Внешние шрифты замедляют first frame | Самохостить WOFF2 |
| Большое число evidence assets | Сохранить lazy chunks/assets и измерять initial download до gameplayStart |

## 7. Официальные источники CrazyGames

Проверены 2026-07-21:

- [SDK v3 Introduction](https://docs.crazygames.com/sdk/intro/) — подключение скрипта,
  `await SDK.init()`, среды `local/crazygames/disabled`.
- [Game module](https://docs.crazygames.com/sdk/game/) — loading/gameplay lifecycle,
  `muteAudio`, game context.
- [Data module](https://docs.crazygames.com/sdk/data/) — string/localStorage-подобный API,
  guest/account sync, source of truth и лимит 1 MB.
- [Video ads SDK](https://docs.crazygames.com/sdk/video-ads/) и
  [Advertisement requirements](https://docs.crazygames.com/requirements/ads/) — callback lifecycle,
  pause/mute только с `adStarted`, Basic Launch/adblock/error handling.
- [Technical requirements](https://docs.crazygames.com/requirements/technical/) — размеры, число
  файлов, relative paths, браузеры, mobile и initial download до `gameplayStart`.
- [Gameplay requirements](https://docs.crazygames.com/requirements/gameplay/) — English fallback,
  viewport matrix, fullscreen/cross-promotion restrictions, максимум один клик до gameplay.
- [Account integration](https://docs.crazygames.com/requirements/account-integration/) — Data Module
  как рекомендуемый progress save без собственного account backend.
- [Requirements overview](https://docs.crazygames.com/requirements/intro/) и
  [Basic Launch metrics](https://docs.crazygames.com/resources/basic-launch-metrics/) — Basic/Full
  Launch и метрики отбора.
- [Game covers](https://docs.crazygames.com/requirements/game-covers/) — размеры cover и preview
  video.
- [In-game purchases](https://docs.crazygames.com/sdk/in-game-purchases/) и
  [Leaderboards](https://docs.crazygames.com/sdk/leaderboards/) — обе функции invite-only.

