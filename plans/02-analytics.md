# План 02 — Аналитика (весь раздел 4 ревью)

**Инфраструктура готова**: адаптер `src/services/metrica.ts` (единственная точка `window.ym`),
каталог `GOAL`, `trackGoal()` / `setUserParams()`, release-параметры
(`economyVersion`/`contentVersion`/`experimentGroup`) подмешиваются автоматически. Работа = добавить
имена в `GOAL`, воткнуть вызовы в нужные точки, задокументировать в `docs/06-yandex-platform.md`
(таблица целей обязана оставаться в локстепе — правило из шапки `metrica.ts`).

**Уже есть (не дублировать):** `caseId` в `verdict_submit` ✅; полный ad-lifecycle
(`ad_offer/accept/open/close/error/reward`) ✅; `exitedAfterAd` в `session_end` ✅;
`daily_claim` ✅; `hint_buy` с cost/kind ✅; `rating_action` ✅; purchase-воронка
(`shop_view` … `purchase_restore`) ✅.

Все новые цели завести и в консоли Метрики (counter `110041851`). Имена — стабильные строки:
после релиза не переименовывать (осиротеет история).

---

## Этап 1 — Критичные (полдня–день, делать первым спринтом)

| Goal | Где стрелять | Параметры |
| --- | --- | --- |
| `reject_blocked` | `CaseFile.tsx:113` (показ тоста `rejectNeedsProof`) и `VerdictPanel.tsx:37` (первый рендер задизейбленной кнопки — стрелять 1 раз за сессию дела, флаг в локальном ref) | `caseId`, `viewedCount`, `stampedCount` |
| `budget_exhausted` | место показа тоста исчерпанного бюджета (grep по budget-toast в `CaseFile`/`App`) | `caseId`, `budget`, `opensUsed` |
| `locked_case_click` | обработчик клика по закрытой карточке дела/архива (компонент стола) | `caseId` / `packId`, `lockReason: 'sequence' \| 'level' \| 'archive_locked'`, `campaignPosition` |
| Агрегаты рекламы | userParams при закрытии интерстишла (`App.tsx:317,332` рядом с `showFullscreenAd`) + счётчик в persisted stats | см. Этап 4 |

Примечание к рекламе: счётчики `interstitialsSeenTotal`, `verdictsSinceLastAd` требуют места
хранения. Держать в `PlayerStats` (persisted, → **saveVersion bump + migrate**, объединить с бампом
из плана 01) либо, дешевле, в module-level счётчике за сессию + `adsPerSession` в `session_end`.
Рекомендация: `interstitialsSeenTotal` — в stats (нужен кумулятив для churn-анализа),
`adsPerSession`/`verdictsSinceLastAd` — сессионные, в параметры `session_end` и `ad_open`.
Частота интерстишлов сейчас тюнится через `advertising.interstitialMinActiveMs` (10 мин) — поле
`exitedAfterAd` уже есть, после накопления данных связать в отчёте Метрики.

## Этап 2 — Онбординг-воронка (полдня)

Цели: `boot_complete` → `first_case_start` → `first_evidence_view` → `first_stamp` → `first_verdict`.

1. `boot_complete` — в `App.tsx` после гидрации/`notifyGameReady`, параметр `bootDurationMs`
   (закрывает и техметрику `boot_duration_ms`).
2. `first_*` — не плодить отдельные ветки: стрелять обычные `case_start`/`evidence_view`/
   `evidence_stamp`/`verdict_submit` с параметром `isFirstEver: true`, вычисляемым из
   `stats` (`completedCaseIds.length === 0` и т.п.), плюс `msSinceBoot` для таймингов.
   Отдельные goal-имена завести только если в Метрике неудобно сегментировать по параметру —
   решить после первой недели данных.

## Этап 3 — Поведение и удержание (день)

| Goal | Где | Параметры |
| --- | --- | --- |
| `evidence_read_ms` | закрытие модалки улики (`StampModal` / контроллер в `App.tsx`) — timestamp открытия в ref | `caseId`, `evidenceId`, `evidenceType`, `durationMs` |
| `result_sheet_close` | закрытие ResultSheet | `caseId`, `durationMs`, `nextAction: 'next_case' \| 'desk' \| 'replay'` |
| `daily_seen` | первый рендер доступной ежедневки на столе (1/сессию) | `dailyCaseId` (пара к существующему `daily_claim` = конверсия) |
| `rating_prompt_shown` | показ промпта рейтинга (сейчас трекаются только действия — `rating_action`) | `completedCases`, `dismissalsSoFar` |
| `hint_offer_seen` | первый рендер кнопок подсказок в деле (1/дело) | `caseId`, `noteCost`, `canAfford` |

## Этап 4 — userParams (полдня)

Найти текущий вызов `setUserParams` (grep) и расширить:
`campaignPosition` (индекс в каноническом порядке кампании — взять из `caseUnlockEngine`),
`payerFlag` (после плана 05: куплен любой продукт), `adsWatchedTotal` (rewarded, кумулятив в stats),
`interstitialsSeenTotal`, `masteryGoldCount` (посчитать по `stats.results`).
Обновлять в тех же точках, где userParams шлются сейчас (закрытие дела / бут).

## Этап 5 — Техметрики (полдня)

| Goal | Где |
| --- | --- |
| `sdk_init_failed` | catch-ветки инициализации в `yandexSDK.ts` (init SDK / leaderboards / payments — сейчас молча `null`, `yandexSDK.ts:178-191`), параметр `subsystem` |
| `cloud_save_error` | catch записи снапшота в `persistence.ts` |
| `save_migrated` | `migrate()` в `persistence.ts`, параметры `fromVersion`, `toVersion` |

Осторожно: `metrica.trackGoal` сам no-op при отсутствии счётчика, но `yandexSDK.ts` не должен
получить циклический импорт — `yandexSDK` уже импортирует `trackGoal` (см. ad-lifecycle), значит ок.

---

## Верификация

- Тесты: у store/SDK уже есть spy-тесты на trackGoal — добавить ассерты на новые цели в
  соответствующие `*.test.ts` (reject_blocked, budget_exhausted, save_migrated с версиями).
- Dev-прогон с заглушкой `window.ym = console.log`-обёрткой: пройти онбординг-воронку и увидеть
  все события в консоли.
- `docs/06-yandex-platform.md`: дополнить таблицу целей и userParams (обязательный локстеп).
- Завести цели в консоли Метрики до релиза (иначе reachGoal копится, но не отображается как цель).
