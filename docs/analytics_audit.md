# Product Analytics Audit — «Где ложь? Симулятор детектива»

Дата ревью: 20 июля 2026

## 1. Итоговый вердикт

Текущая аналитика **не слабая технически**, но пока **недостаточна для уверенного решения о второй части**.

Оценка по слоям:

| Слой | Оценка | Комментарий |
|---|---:|---|
| Инженерная архитектура | 8/10 | Единый адаптер Метрики, стабильный каталог целей, тесты, graceful degradation, версии контента и экономики |
| Покрытие core loop | 6/10 | Начало дела, открытие/штамп улики, вердикт и реклама уже есть |
| Качество данных | 5/10 | Есть ошибочные семантики и потеря быстрых повторных событий из-за использования целей для всего |
| Анализ удержания и отвалов | 4/10 | Не хватает первого флоу, длительности расследования, чтения улик, abandon-контекста и действий после результата |
| Экспериментальная готовность | 3/10 | `experimentGroup` — статическая строка, а не реальное стабильное распределение пользователей |
| Готовность принять решение о сиквеле | 4/10 | Можно увидеть общие конверсии, но нельзя надёжно объяснить причины успеха/провала |

**Общая оценка: 5,5/10.**

До закупки заметного трафика нужен один обязательный аналитический спринт. После него Метрика сможет ответить, какие дела, улики, механики и рекламные точки работают. Для полного поведенческого анализа следует выгружать неагрегированные данные через Logs API и собирать продуктовые витрины.

---

## 2. Что уже реализовано хорошо

В `src/services/metrica.ts` есть централизованный адаптер с 40 целями. Все события автоматически получают:

- `economyVersion`;
- `contentVersion`;
- `experimentGroup`.

Есть следующие группы событий:

### Сессия

- `session_start` / `session_end`;
- `active_interval`;
- `session_pause` / `session_resume`;
- активное время исключает время показа рекламы;
- `session_end` содержит `exitedAfterAd`, `adsPerSession`, `verdictsSinceLastAd`.

### Core loop

- `case_start`;
- `investigation_interrupt` / `investigation_resume`;
- `evidence_view`;
- `evidence_stamp`;
- `verdict_submit` с подробной декомпозицией награды и точности.

### Экономика и прогресс

- подсказки и услуги;
- повышение ранга;
- достижения;
- банкротство как аналитический маркер;
- ежедневные дела;
- удвоение награды и восстановление средств.

### Реклама и покупки

- полный базовый ad lifecycle;
- магазин и продукт;
- purchase start/success/error/restore.

### Проблемные UX-сигналы

- попытка отклонить заявку без доказательств;
- исчерпание бюджета расследования;
- клик по закрытому делу;
- переключение вкладок.

### Инженерные плюсы

- Метрика не блокирует загрузку игры;
- отсутствие счётчика не ломает gameplay;
- имена целей собраны в одном каталоге;
- есть скрипт синхронизации целей с Management API;
- есть unit-тесты адаптера и ad lifecycle;
- `Webvisor`, clickmap и trackLinks включены.

Это хороший фундамент. Переписывать всё с нуля не нужно.

---

## 3. Критические проблемы текущей аналитики

## P0.1. Все действия отправляются как цели `reachGoal`

Сейчас и бизнес-конверсии, и частые поведенческие действия отправляются одинаково через `reachGoal`.

Проблема:

- Метрика фиксирует достижение одной и той же цели не чаще одного раза в секунду;
- быстрые `evidence_view`, `evidence_stamp`, `tab_switch` могут недосчитываться;
- уже занято 40 из стандартного лимита 200 целей;
- каталог будет быстро разрастаться при добавлении подробной телеметрии.

### Решение

Разделить API на два слоя:

```ts
trackGoal(name, params)   // только ключевые продуктовые конверсии
trackEvent(name, params)  // частая телеметрия через params/event payload
```

Оставить целями примерно 12–18 событий:

- `boot_complete`;
- `first_case_start`;
- `first_case_complete`;
- `case_complete`;
- `daily_complete`;
- `rewarded_complete`;
- `purchase_success`;
- `rating_success`;
- основные onboarding milestones;
- критические технические ошибки при необходимости.

Открытия улик, штампы, вкладки, показы офферов, result actions и технические логи отправлять как события с параметрами.

---

## P0.2. Нет устойчивой идентификации игрока между устройствами

Сейчас `userParams` отправляются без `UserID`, а Yandex SDK adapter не получает `player.getUniqueID()`.

Следствие:

- один авторизованный игрок на телефоне и компьютере может выглядеть как два пользователя;
- прогресс в облаке единый, а аналитическая история фрагментируется;
- анализ D1/D7 и пути по кампании становится менее точным.

### Решение

- добавить `getUniqueID()` в интерфейс YandexPlayer;
- передавать стабильный псевдонимизированный ID через `setUserID`;
- не передавать имя, аватар, email и другие персональные данные;
- для offline/dev использовать случайный persistent anonymous ID.

---

## P0.3. Нет boot funnel и boot duration

В игре нет событий:

- `boot_start`;
- `boot_complete`;
- `boot_failed`;
- длительности отдельных фаз загрузки.

Дополнительно обнаружен архитектурный drift: в проекте есть полноценный `BootScreen.tsx`, но production entry `src/main.tsx` рендерит `AppWithoutLoader`, а не `BootScreen`. Поэтому подготовленные boot signals фактически не участвуют в production flow.

### Решение

При старте bundle сохранить `performance.now()`. После hydrate и `notifyGameReady()` отправить:

```json
{
  "event": "boot_complete",
  "bootDurationMs": 1840,
  "sdkInitMs": 520,
  "saveHydrateMs": 310,
  "assetsWaitMs": 780,
  "sdkMode": "online",
  "saveSource": "cloud",
  "isNewPlayer": true
}
```

Ошибки и fallback должны иметь `subsystem`, `stage`, `errorClass`, но не полный сырой stack с потенциально чувствительными данными.

---

## P0.4. Нельзя измерить длительность расследования

В `ActiveSession` уже есть `startedAtServerMs`, но в `verdict_submit` не отправляется ни wall time, ни active time.

Нельзя ответить:

- какое дело слишком долгое;
- где игрок устал;
- отличаются ли завершившие и бросившие;
- какой контент лучше удерживает;
- сколько времени занимает первая ценность.

### Решение

Ввести на уровне попытки:

- `investigationId`;
- `attemptNumber`;
- `caseWallTimeMs`;
- `caseActiveTimeMs`;
- `timeToFirstEvidenceMs`;
- `timeToFirstStampMs`;
- `timeToVerdictMs`;
- `pauseTimeMs`;
- `resumeCount`.

---

## P0.5. Нет фактического чтения улик

`evidence_view` отправляется только при первом открытии карточки. Нет:

- времени внутри модалки;
- повторных открытий;
- порядка просмотра;
- времени до штампа;
- навигации назад/вперёд;
- признака поверхностного просмотра.

### Решение

Добавить:

```text
evidence_open
  caseId, investigationId, evidenceId, evidenceType,
  firstOpen, openIndex, msSinceCaseStart, source

evidence_close
  caseId, investigationId, evidenceId,
  dwellMs, stampedOnClose, navigationMethod
```

Для анализа конкретных улик также передавать безопасную статическую разметку:

- `isContradiction`;
- `evidencePosition`;
- `difficultyTier`;
- `contentVersion`.

Истину можно передавать в аналитику: игрок её не увидит, а аналитик сможет считать precision/recall без ручного join с JSON.

---

## P0.6. Выход из игры во время дела теряет контекст

`investigation_interrupt` отправляется только при:

- переключении на другое дело;
- возврате на стол.

При закрытии вкладки есть `session_end`, но он не содержит:

- текущего `caseId`;
- просмотренных улик;
- штампов;
- этапа расследования;
- времени в текущем деле.

### Решение

Добавить `setAnalyticsContext()` и поддерживать актуальный snapshot:

```json
{
  "surface": "investigation",
  "caseId": "case-014",
  "investigationId": "...",
  "viewedCount": 3,
  "stampedCount": 1,
  "hintsUsed": 0,
  "caseActiveMs": 74000
}
```

Этот контекст подмешивать в `session_pause`, `session_end` и технические ошибки.

---

## P0.7. `interstitialsSeenTotal` сейчас считает не показы

В `App.tsx` вызывается `store.recordInterstitialShown()` **до** `showFullscreenAd()`.

Если:

- SDK отсутствует;
- реклама вернула ошибку;
- `wasShown === false`;

счётчик всё равно увеличивается.

Кроме того, после инкремента не вызывается `reportUserParams`, поэтому поле ещё и не попадает в профиль пользователя.

### Решение

- переименовать текущую семантику в `interstitialRequestsTotal`, если она нужна;
- `interstitialsSeenTotal` увеличивать только в `onOpen` либо в `onClose` при `wasShown === true`;
- отправлять обновлённый user profile после успешного показа;
- отдельно считать `interstitialErrorsTotal` и `interstitialNotShownTotal`.

---

## P0.8. Нет реального onboarding funnel

Сейчас generic events не позволяют удобно выделить первый опыт.

Нужна воронка:

```text
boot_complete
→ desk_view
→ first_case_card_click
→ first_case_start
→ first_claim_read
→ first_evidence_open
→ first_stamp
→ first_verdict_submit
→ first_result_view
→ second_case_start
```

Для каждого шага:

- `msSinceBoot`;
- `isFirstEver`;
- `campaignPosition`;
- `deviceCategory` и `language` доступны из Метрики;
- `sourceSurface`.

Самые важные продуктовые точки:

- понял ли игрок, что нужно читать заявление;
- понял ли, что нужно ставить штамп;
- понял ли разницу Approve/Reject;
- дочитал ли разбор;
- начал ли второе дело.

---

## 4. Проблемы средней важности

### P1.1. `verdict_submit` недостаточно описывает попытку

Добавить:

- `investigationId`;
- `attemptNumber`;
- `campaignPosition`;
- `completedCasesBefore`;
- `caseActiveTimeMs`;
- `hintsUsed`;
- `selectedService`;
- `budgetRemaining`;
- `balanceBefore` / `balanceAfter`;
- `masteryEarned`;
- `stampCount`;
- `contradictionsFound` / `totalContradictions`;
- `resultType`: first completion / replay improvement / replay no improvement.

### P1.2. Нет аналитики экрана результата

Добавить:

```text
result_view
result_action
```

Параметры `result_action`:

- `action: next_case | desk | double_reward`;
- `resultDwellMs`;
- `verdictCorrect`;
- `mastery`;
- `reward`;
- `nextCaseAvailable`.

Это главный показатель удовлетворённости после core reward moment.

### P1.3. Рейтинг трекается до результата нативного диалога

Сейчас `rating_action: rate` отправляется до `requestReview()`. Нельзя понять, реально ли пользователь оставил оценку.

Добавить:

- `rating_prompt_shown`;
- `rating_request_started`;
- `rating_request_result` с `feedbackSent`, `error`, `canReviewReason`.

### P1.4. `product_view` фактически является кликом на покупку

Событие вызывается в `handlePurchaseArchive`, то есть не при показе карточки товара.

Разделить:

- `product_impression` — карточка действительно видна;
- `product_click` — нажатие;
- `purchase_start`;
- `purchase_success`;
- `entitlement_granted`.

Добавить price/currency/archiveId и payer status.

### P1.5. События услуг не различают успех и отказ

`service_select` отправляется до валидации. Попытка может завершиться отсутствием цели, нехваткой денег или другим guard.

Добавить `result: success | insufficient_balance | no_target | unavailable | ad_error`.

### P1.6. Нет показов daily и locked content

Для конверсии нужны пары:

- `daily_impression` → `daily_start` → `daily_complete`;
- `archive_impression` → `archive_open` → `product_impression` → purchase;
- `case_card_impression` → click → start.

### P1.7. `experimentGroup` не является экспериментом

Сейчас значение жёстко равно `baseline`.

Нужно:

- стабильное назначение группы по user ID;
- сохранение назначения;
- версия эксперимента;
- дата начала;
- один пользователь не должен прыгать между группами;
- holdout/control;
- изменение только одного существенного фактора на эксперимент.

---

## 5. Рекомендуемая аналитическая архитектура V2

## 5.1. Общий envelope каждого события

```ts
interface AnalyticsEnvelope {
  eventName: string;
  eventVersion: number;
  eventId: string;
  eventSeq: number;
  sessionId: string;
  investigationId?: string;
  timestampMs: number;

  userId?: string;
  isNewPlayer: boolean;
  completedCasesBefore: number;
  campaignPosition?: number;

  economyVersion: string;
  contentVersion: string;
  appVersion: string;
  experimentId?: string;
  experimentGroup?: string;

  language: string;
  sdkMode: 'online' | 'offline';
  saveSource: 'cloud' | 'local' | 'new';
}
```

`sessionId` и `eventSeq` нужны для восстановления точного порядка даже при одинаковой секундной отметке времени.

## 5.2. Typed schema вместо `Record<string, unknown>`

Создать `AnalyticsEventMap`:

```ts
interface AnalyticsEventMap {
  boot_complete: BootCompletePayload;
  case_start: CaseStartPayload;
  evidence_open: EvidenceOpenPayload;
  evidence_close: EvidenceClosePayload;
  evidence_stamp: EvidenceStampPayload;
  verdict_submit: VerdictSubmitPayload;
  result_action: ResultActionPayload;
  // ...
}
```

И API:

```ts
trackEvent<K extends keyof AnalyticsEventMap>(
  name: K,
  payload: AnalyticsEventMap[K],
): void
```

Это исключит дрейф параметров и опечатки.

## 5.3. События и цели

### Цели Метрики

Использовать для ключевых конверсий и ретаргетинга:

- onboarding milestones;
- case complete;
- D0 activation;
- rewarded completion;
- purchase success;
- rating success.

### Event stream

Использовать для поведения:

- evidence open/close/stamp;
- tab switch;
- offer impressions;
- UI actions;
- context snapshots;
- technical events.

### Logs API

Ежедневно выгружать таблицы Events и Sessions. Минимальные поля:

```text
Events:
  watchID, visitID, clientID, dateTime, goalsID, params,
  URL, deviceCategory, browser, operatingSystem

Sessions:
  visitID, clientID, dateTime, isNewUser, visitDuration,
  traffic source, UTM, device, country, goals arrays
```

Хранилище на первом этапе:

- ClickHouse — лучший вариант для событий;
- PostgreSQL подойдёт при небольшом объёме;
- даже ежедневный parquet/csv в object storage лучше, чем только UI Метрики.

---

## 6. Обязательный каталог событий до запуска трафика

| Приоритет | Событие | Зачем |
|---|---|---|
| P0 | `boot_complete` | Конверсия загрузки, скорость старта |
| P0 | `boot_failed` | Потери до показа игры |
| P0 | `desk_view` | Первая доступная игровая поверхность |
| P0 | `case_card_click` | Выбор контента |
| P0 | расширенный `case_start` | Позиция, попытка, first-ever |
| P0 | `evidence_open` | Полный порядок исследования |
| P0 | `evidence_close` | Реальное чтение |
| P0 | расширенный `evidence_stamp` | Качество решения по каждой улике |
| P0 | `case_abandon` / context at session end | Причины отвала |
| P0 | расширенный `verdict_submit` | Полная оценка дела |
| P0 | `result_view` | Дошёл до reward moment |
| P0 | `result_action` | Продолжил или вышел |
| P0 | исправленный ad lifecycle | Честная рекламная аналитика |
| P0 | `sdk_init_failed` | Технический health |
| P0 | `cloud_load_error` / `cloud_save_error` | Потери прогресса |
| P0 | `unhandled_error` | Крэши и тупики |
| P1 | `daily_impression` | Конверсия daily |
| P1 | `hint_offer_impression` | Видел ли предложение |
| P1 | `hint_attempt_result` | Почему не использовал |
| P1 | `rating_prompt_shown/result` | Реальная воронка рейтинга |
| P1 | `product_impression/click` | Покупочная воронка |
| P1 | `language_change` | Проблемы локализации |
| P2 | `tab_switch` как event | Навигационные паттерны |
| P2 | `achievement_view` | Ценность мета-системы |
| P2 | weekly flow events | LiveOps и возвраты |

---

## 7. User parameters V2

Отправлять после boot, завершения дела, рекламы, покупки и значимых изменений прогрессии:

```text
UserID
isNewPlayer
level
xp
balance
completedCases
campaignPosition
correctVerdictsTotal
accuracyBucket
masteryGoldCount
hintsUsedTotal
rewardedCompletedTotal
interstitialsSeenTotal
purchaseCount
payerFlag
archiveCount
streak
language
lastCaseId
lastCaseResult
```

Не отправлять сырые массивы всех завершённых дел в `userParams`: это высокая кардинальность. Детальный прогресс должен жить в event stream.

---

## 8. Дашборды, которые нужны владельцу продукта

## 8.1. Executive dashboard

- New Users / DAU / WAU;
- D1 / D3 / D7 retention;
- среднее активное время;
- дел на пользователя;
- first case completion;
- second case start;
- ad impressions per DAU;
- rewarded completion rate;
- revenue per DAU из кабинета Yandex Games;
- crash/boot failure rate.

## 8.2. Onboarding funnel

```text
boot_complete
→ desk_view
→ case_1_start
→ first_evidence_open
→ first_stamp
→ first_verdict
→ result_view
→ case_2_start
```

Разрезы:

- mobile / desktop / tablet;
- язык;
- источник трафика;
- браузер;
- новый/вернувшийся игрок.

## 8.3. Campaign funnel

Для каждого `campaignPosition`:

- impression;
- click;
- start;
- complete;
- next case start;
- D1 return after completion.

## 8.4. Case quality dashboard

На каждое дело:

- start-to-complete;
- abandon rate;
- correct verdict rate;
- median active duration;
- p75/p90 duration;
- hint rate;
- false stamp rate;
- proof recall;
- mastery distribution;
- result-to-next conversion;
- replay rate.

## 8.5. Evidence quality dashboard

На каждую улику:

- first-open rate;
- median dwell time;
- re-open rate;
- stamp rate;
- correct stamp rate;
- time to stamp;
- hint reveal rate;
- доля abandon после этой улики.

Интерпретация:

- короткое чтение + высокий false stamp → вводящий в заблуждение визуал/текст;
- долгое чтение + низкий stamp на contradiction → слишком неочевидная улика;
- высокий hint rate → сложность выше ожидаемой;
- низкий open rate → позиция/бюджет не дают игрокам увидеть важный контент.

## 8.6. Ads dashboard

По placement:

- offer → click/request → open → close → reward;
- error / not shown;
- exit within 10/30/60 sec;
- next action after ad;
- session duration before/after;
- retention by cumulative ad pressure;
- interstitials per completed case.

## 8.7. Technical dashboard

- boot p50/p75/p95;
- SDK fallback rate;
- cloud load/save errors;
- case JSON load errors;
- unhandled error rate;
- ошибки по браузерам/устройствам.

---

## 9. План запуска трафика

## Этап A. Instrumentation QA

До внешнего трафика:

1. Исправить P0-события.
2. Создать реальные цели в кабинете Метрики.
3. Подключить `setUserID`.
4. Проверить события на production draft Yandex Games.
5. Сделать автоматический analytics smoke test.
6. Проверить, что события не дублируются из-за React StrictMode.
7. Проверить mobile/desktop и все пять языков.
8. Зафиксировать event dictionary и не переименовывать поля после запуска.

## Этап B. Smoke traffic

Первые 300–1000 новых игроков.

Цель этапа — не оценка бизнеса, а проверка данных:

- сходятся ли starts/completes;
- нет ли невозможных последовательностей;
- есть ли пропуски событий;
- корректны ли user IDs;
- работает ли Logs API;
- видны ли source/device/language разрезы.

## Этап C. Product baseline

Набрать минимум несколько тысяч новых пользователей и не менять core loop в середине окна наблюдения.

Смотреть:

- onboarding;
- первые 3 дела;
- D1/D7;
- content difficulty;
- рекламный churn;
- технические потери.

## Этап D. A/B тесты

Последовательно тестировать:

1. Первый туториал / объяснение штампа.
2. Порядок и сложность первых дел.
3. Формат ResultSheet.
4. Частоту интерстишлов.
5. Цену и UX Inspector Note.
6. Daily placement.

Не смешивать несколько крупных изменений в одном тесте.

---

## 10. Как принять решение о второй части

Не использовать один KPI. Решение должно учитывать четыре блока.

## 10.1. Спрос

- игроки доходят хотя бы до 3–5 дел;
- после финала доступного контента кликают по архивам/закрытым делам;
- есть replays, daily returns или запрос на новый контент;
- высокий `result_action=next_case`.

## 10.2. Удовлетворённость

- хороший first-case completion;
- correct verdict растёт по мере обучения;
- мало reject-blocked после первого дела;
- рейтинг запрашивается и реально отправляется;
- игроки читают разбор результата.

## 10.3. Удержание

- D1/D7 устойчивы по когортам;
- удержание не держится только на рекламе или случайном трафике;
- возвращаются и после прохождения первых дел.

## 10.4. Экономика

- реклама не разрушает next-case conversion;
- rewarded placements имеют понятную ценность;
- стоимость привлечения соотносится с доходом/долгосрочной ценностью;
- производство нового дела окупается лучше, чем привлечение игрока в отдельную игру.

### Решение

- **Сильный core + спрос на контент:** сначала расширять текущую игру новыми делами/архивами.
- **Сильный core, но выявлены фундаментальные ограничения сеттинга/механики:** проектировать отдельную существенно переработанную часть.
- **Слабый onboarding, но сильное удержание после первого дела:** не делать сиквел, сначала чинить первые минуты.
- **Низкое удержание даже у завершивших 2–3 дела:** вторая часть с тем же core loop рискованна.
- **Высокий спрос на закрытый контент и хорошая D7:** лучший сигнал для расширения франшизы.

---

## 11. Важное ограничение Yandex Games по второй части

Правила Yandex Games не разрешают публиковать отдельную игру, которая полностью или частично дублирует другую игру того же разработчика.

Продолжение принимается отдельно только при **полной переработке сеттинга и/или механик**. Если это просто новые дела, новый сюжет и тот же core loop, безопасная стратегия — обновлять текущую игру или добавлять архивы/главы внутри неё.

Следовательно, с продуктовой и платформенной точки зрения базовый план должен быть таким:

1. раскрутить и измерить текущую игру;
2. добавить контентные главы/архивы в неё;
3. отдельную «часть 2» делать только при действительно новой механике или заметно другом сеттинге.

---

## 12. Рекомендуемый порядок разработки

### Спринт 1 — обязательно до трафика

1. Разделить goals и events.
2. Подключить stable UserID.
3. Boot funnel и technical errors.
4. Investigation ID, attempt, durations.
5. Evidence open/close.
6. Result view/action.
7. Context on session end.
8. Исправить interstitial seen counter.
9. Расширить verdict payload.
10. Analytics QA и event schema tests.

### Спринт 2 — после smoke traffic

1. Daily funnel.
2. Rating funnel.
3. Hint offer/result funnel.
4. Product impressions и entitlement.
5. UserParams V2.
6. Logs API export.
7. Product dashboards.
8. Реальная A/B assignment система.

---

## 13. Definition of Done аналитики

Аналитика считается готовой к закупке трафика, когда:

- можно восстановить путь одного анонимного игрока по событиям;
- у каждого события есть schema/version;
- у каждой попытки дела есть `investigationId`;
- известно активное время дела и улик;
- известен этап выхода;
- показы рекламы отличаются от запросов и ошибок;
- onboarding funnel строится без ручных догадок;
- case/evidence dashboards строятся автоматически;
- цели реально созданы в Метрике;
- Logs API выгружается хотя бы раз в сутки;
- smoke tests проверяют обязательные события;
- нет дубликатов из React StrictMode;
- документация и runtime catalog синхронизированы.

