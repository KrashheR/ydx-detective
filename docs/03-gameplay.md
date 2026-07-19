# 03 · Геймплей и механики

> **🗺️ Ключевые файлы:** `src/App.tsx` (поток + `handleReject`/`handleOpenEvidence`), `src/store/gameStore.ts` (`selectCaseInvestigationGate`, `markEvidenceAsViewed`, `buyHint`, `startCase`), `src/engine/caseUnlockEngine.ts`.

Игровой поток рулится `App.tsx` (контроллер) + `selectCaseInvestigationGate`
(`gameStore.ts`) для гейтинга кнопок. Все мутации сессии — экшены стора.

## Сессия расследования (`ActiveSession`)

После загрузки игра всегда показывает стол и ждёт явного выбора дела, в том числе при
наличии сохранённой активной сессии.
При выборе дела `startCase` создаёт сессию. Она персистится рядом со статами, поэтому
при повторном выборе того же дела прогресс расследования восстанавливается. Поля:

- `selectedEvidenceIds` — заштампованные как противоречия карточки.
- `viewedEvidenceIds` — открытые/прочитанные хотя бы раз карточки.
- `revealedEvidenceIds` — карточки, чей истинный статус раскрыт подсказкой.
- `startedAtServerMs` — серверное время старта.

`startCase` **намеренно не** стирает существующую сессию для того же дела (resume).

## Поток штамповки

Отклонение заявления требует **обоснования**: нужно открыть улику и нажать «Отметить
как противоречие» (`toggleEvidenceStamp`). Попытка отклонить с нулём штампов выводит
подсказку _«Отклонение должно быть обосновано…»_ вместо сабмита (см. `handleReject` в
`App.tsx`, ключ `rejectNeedsProof`).

Штамп виден в модалке (`StampModal`) и на сетке (`EvidenceCard`). Истинный статус улики
(`isContradiction`) показывается только пост-вердикт в разборе.

## Гейтинг вердикта (`selectCaseInvestigationGate`)

Правило асимметрично (одинаково для бюджетных и классических дел):

- **Approve** доступен **всегда** — выплата по умолчанию не требует обоснования.
- **Reject** (блокировка выплаты) доступен только при ≥1 заштампованной карточке: чтобы
  отказать в выплате, нужны основания.

Селектор также возвращает `budget / opensRemaining / budgetExhausted` для счётчика и
запечатывания карточек в UI (актуально для бюджетных дел).

## Бюджет расследования (бюджетные дела)

Когда дело задаёт `investigationBudget: N`, игрок может открыть **максимум N** карточек
перед решением, а сплит награды смещается с 50/50 на **40 вердикт / 40 доказательства /
20 эффективность** (см. [04-economy-progression.md](04-economy-progression.md)).

- `markEvidenceAsViewed(id, caseData)` принимает дело и **возвращает boolean**: `false`
  — открытие отклонено (бюджет исчерпан на новой карточке). Уже открытые карточки всегда
  перечитываемы и никогда не отклоняются.
- `App.handleOpenEvidence` при `false` показывает тост `budgetExhausted` и не открывает
  модалку.
- Точки кода при изменении механики: `evaluateReward`, `selectCaseInvestigationGate`,
  `markEvidenceAsViewed`, проп `sealed` у `EvidenceCard`, `RewardBreakdown.efficiencyComponent`.

## Подсказки (`buyHint`)

`buyHint(caseData, kind, targetEvidenceId?)` раскрывает истинный статус одной карточки;
id дописывается в `revealedEvidenceIds`, поэтому раскрытие переживает resume. Различаются
только способом разблокировки:

- **Inspector Note (Записка инспектора)** — списывает `balance` (20% от `claimAmount`,
  `hints.inspectorNoteClaimPct`). No-op, если не хватает баланса. Сейчас раскрытие идёт
  через `showFullscreenAd` → reveal в колбэке.
- **Witness Canvass (Опрос свидетелей)** — бесплатна, гейтится rewarded-видео Yandex
  (`showRewardedAd` → reveal по `onRewarded`; в dev/офлайн выдаётся мгновенно).

**Выбор цели.** Игрок сам решает, какую карточку проверить, вместо «следующей по порядку»:
клик по кнопке подсказки в `CaseFile.tsx` включает режим прицеливания (state `targeting`,
хранится в компоненте, не в сторе) — нераскрытые карточки (`EvidenceCard.targetable`)
получают пульсирующую рамку-обводку (framer-motion, токен `accent`), баннер подсказывает
«Выберите улику для проверки». Клик по подсвеченной карточке = подтверждение покупки
(цена уже видна на кнопке); Esc или клик мимо области улик/подсказок отменяет режим без
списания. Для Witness Canvass цель фиксируется **до** показа ролика — `buyHint` замыкает
конкретный `targetEvidenceId` в колбэк `reveal`, поэтому гонка «открыл сам, пока крутилась
реклама» разрешается тем же guard'ом «уже раскрыто» в сторе. `targetEvidenceId`
опционален и валидируется в сторе (принадлежит делу, ещё не раскрыт) — при невалидной или
отсутствующей цели `buyHint` откатывается к старому поведению «следующая по порядку»,
поэтому старые вызовы без цели продолжают работать. Сеалед-карточки (бюджет исчерпан)
всё равно можно выбрать целью — подсказка не тратит бюджет открытий, только `hintsUsed`.
Подсказки никогда не уводят баланс ниже нуля («не хватает — не купишь»).

## Гейтинг кампании (анлоки дел)

Стандартные дела гейтятся `caseUnlockEngine`:

- **Требование уровня** — `standardCaseRequiredLevelById` в `gameConfig.ts`. Этот же map
  задаёт **порядок кампании**: дела сортируются по `(requiredLevel, caseNumber)`
  (`compareCasesByUnlockCriteria`). Уровень — это **тир сложности**, а не XP-стена: значения
  держатся низкими (макс. 16, всегда достижимы), поэтому реальный замок — строгая
  последовательность, и линейный игрок никогда не упирается в нехватку уровня. Дела без
  записи получают `defaultRequiredLevel` (30).
- **Последовательность** — следующее дело доступно, только если предыдущее завершено.
- Статусы: `available` / `locked` (`requires_level` | `complete_previous`) / `completed`.

Заблокированное дело показывает тост-причину (`formatCaseLockMessage`, `src/utils/caseDisplay.ts`).
**Игроку уровень как причина замка никогда не показывается** — `requires_level` и
`complete_previous` рендерятся одинаковой формулировкой «Закройте предыдущее дело»
(`completePreviousCase`): раз уровень всегда достижим, реальный (и единственный видимый) гейт —
последовательность. Внутреннее поле `reason` в `CaseUnlockInfo` (`caseUnlockEngine.ts`) при этом
не меняется — оно остаётся нужным для аналитики (`locked_case_click.lockReason`, `App.tsx`) и для
будущей «Кабинета следователя» (план 03, механика 2.5), где уровень получит реальную функцию.
Ежедневные дела не гейтятся уровнем — только кулдауном.

## Особые архивы (прототип этапа 4)

`SpecialArchivesEntry` добавляет постоянную точку входа в «Особые архивы» в левый сайдбар
и мобильное меню. `ThematicPacksModal` показывает статический каталог из
`src/data/thematicPacks.ts`: «Архив Пограничного Сектора», «Архив Закрытого Коллегиума»
и «Архив Подземного Отдела». Их 12 дел (`case-040…051`) лежат в
`src/data/cases/archives/<archive-id>/` и уже включены в стандартную
кампанию как L16-экспертные бюджетные fraud-расследования. Витрина даёт второй канал доступа
поверх обычной кампании:

- первое дело каждого архива открыто бесплатно;
- `Buy full archive` через Yandex IAP навсегда открывает весь пак и пишет pack id в
  `stats.archivePurchasedPackIds`;
- `Unlock next case with an ad` навсегда открывает одно следующее дело пака и пишет case id в
  `stats.archiveUnlockedCaseIds`;
- rewarded-разблокировка ограничена одним unlock на пак за серверный день; факт расхода хранится в
  `stats.archiveAdUnlockServerDayByPack`;
- archive entitlements override обычный campaign lock внутри `ThematicPacksModal`, но не меняют
  canonical campaign order и не переписывают `caseUnlockEngine`.

### Кривая сложности (прогрессия для удержания)

Кампания (50 стандартных дел) намеренно нарастает: число улик **не убывает** по порядку
кампании, и продвинутые типы улик вводятся постепенно. Инвариант закреплён тестом
`src/data/campaignProgression.test.ts`.

| Уровни | Улик | Роль | Дела |
| ------ | ---- | ---- | ---- |
| L1     | 2    | онбординг (только `photo`/`document`) | 001, 009 |
| L2–3   | 3    | базовые | 013, 018, 019, 020, 021 |
| L4–11  | 4    | стандартные | 003…024 |
| L12–13 | 5    | продвинутые | 025…028 |
| L14–16 | 6    | экспертные (+ больше бюджетных дел, фансервисная антология и особые архивы) | 029…051 |

Продвинутые типы улик **дебютируют поздно**: `bank_statement` (case-023, ~поз. 22),
`phone_records` (case-024, ~поз. 23), `social_media` (case-025, ~поз. 24). При добавлении
дел сохраняй монотонность числа улик и уровней — иначе падает тест прогрессии.

## Реклама в потоке

- **Интерстишл каждый 3-й вердикт** — `AD_EVERY_N_VERDICTS = 3` в `App.tsx`
  (`submitWithAdGate`), затем сабмит вердикта.
- **Удвоение награды** — после вердикта rewarded-видео удваивает `total`
  (`doubleLastReward`), no-op если `total ≤ 0`.
- **Restore funds** — добровольный оффер на столе при балансе < 500
  (`lowBalanceOfferThreshold`): rewarded-видео пополняет баланс до 2000. Ничего не
  блокирует; no-op, если баланс уже ≥ 2000.

Любое открытие/закрытие рекламы переключает глобальный `isPaused` (заморозка + оверлей
паузы). Детали платформы — [06-yandex-platform.md](06-yandex-platform.md).

## Промпт рейтинга

После **верного** вердикта, при ≥`rating.minCasesForPrompt` (3) закрытых дел и пока
число «Не сейчас» < `rating.suppressAfterDismissals` (3), показывается `RatingModal`
(не чаще раза за сессию, и только если `canReview()` Yandex это разрешает). «Не сейчас» →
`dismissRating`; «Больше не спрашивать» → `suppressRating`.

## Special Archives Data Source

Archive modal case rows are resolved from the shipped case JSON via `caseLoader`.
`src/data/thematicPacks.ts` stores archive metadata and the archive-to-case-id map, while
case titles, claimants, amounts, difficulty, and evidence counts come from
`src/data/cases/archives/<archive-id>/case-*.json`.
Per-case availability/completion state is matched by those case ids from `caseUnlockEngine`.
