# 03 · Геймплей и механики

> **🗺️ Ключевые файлы:** `src/App.tsx` (поток + `handleReject`/`handleOpenEvidence`), `src/store/gameStore.ts` (`selectCaseInvestigationGate`, `markEvidenceAsViewed`, `buyHint`, `startCase`), `src/engine/caseUnlockEngine.ts`.

Игровой поток рулится `App.tsx` (контроллер) + `selectCaseInvestigationGate`
(`gameStore.ts`) для гейтинга кнопок. Все мутации сессии — экшены стора.

## Сессия расследования (`ActiveSession`)

После загрузки игра **сразу открывает дело**, минуя стол: если есть сохранённая активная
сессия — она возобновляется, иначе открывается первое разблокированное непройденное дело
кампании. Автооткрытие срабатывает один раз за сессию (`autoOpenedRef` в `App.tsx`); если
подходящего дела нет (кампания пройдена), игрок как раньше попадает на стол. Стол
доступен по кнопке «назад к столу» из папки дела.
При выборе дела `startCase` создаёт сессию. Она персистится рядом со статами, поэтому
при повторном выборе того же дела прогресс расследования восстанавливается. Поля:

- `selectedEvidenceIds` — заштампованные как противоречия карточки.
- `viewedEvidenceIds` — открытые/прочитанные хотя бы раз карточки.
- `revealedEvidenceIds` — карточки, чей истинный статус раскрыт подсказкой.
- `startedAtServerMs` — серверное время старта.

`startCase` **намеренно не** стирает существующую сессию для того же дела (resume).

## Поток штамповки

Отклонение заявления требует **обоснования**: на любой открытой улике можно нажать «Отметить
как противоречие» (`toggleEvidenceStamp`). Ошибочная отметка подтверждающей улики учитывается
как ложный штамп и снижает награду. Попытка отклонить с нулём штампов выводит
подсказку _«Отклонение должно быть обосновано…»_ вместо сабмита (см. `handleReject` в
`App.tsx`, ключ `rejectNeedsProof`).

Штамп виден в модалке (`StampModal`) и на сетке (`EvidenceCard`). Истинный статус улики
(`isContradiction`) показывается только пост-вердикт в разборе.

На мобильном просмотр улики — полноэкранный bottom-sheet: шапка и нижняя кнопка штампа
остаются на месте, прокручивается только документ. Стрелки и горизонтальный свайп переходят
по уликам в порядке `caseData.evidences`; каждое новое открытие всё равно проходит через
`App.handleOpenEvidence` и бюджетный `markEvidenceAsViewed`. В RTL физическое направление
свайпа и стрелки зеркалятся. На табе улик доступна локальная сворачиваемая выжимка заявления
(`client.meta` + начало истории), не меняющая persist-форму.

## Финал дела: три слоя (`CaseResolutionSheet` → `ResultSheet`)

После **верного** вердикта дело закрывается не сводкой, а человеком. Порядок жёсткий и
отвечает на три вопроса подряд:

1. **Что почувствовал человек?** — `CaseResolutionSheet`: штамп `ОДОБРЕНО`/`ОТКАЗАНО`, портрет
   заявителя (`personImage`), его единственная реплика (`resolution.finalLine`) и, ровно
   в 15 делах из 56, одна строка Веры (`resolution.veraLine`). Наград, процентов и XP на этом
   экране нет.
2. **Почему решение верное?** — компактный разбор по кнопке «Почему такое решение?»:
   `resolution.reasoningChain`, максимум три звена, каждое подписано ярлыком
   («Что было правдой» → «Что не совпало» → «Почему этого достаточно»; для одобряемых дел —
   «Что вызывало подозрение» → «Чем это объясняется» → «Почему этого достаточно») и привязано
   к конкретным уликам через `evidenceIds`.
3. **Что изменилось в большой истории?** — `resolution.arcReveal`, визуально отделённая карточка
   «Новая запись в Архиве №17». Появляется только в сюжетных делах (28 из 56); в остальных
   третьего слоя нет.

Кнопка «Продолжить» передаёт управление `ResultSheet` — награда, точность и XP живут там и
только там. При **неверном** вердикте `CaseResolutionSheet` не показывается вовсе: часть реплик
содержит косвенное признание и выдала бы разгадку до пересмотра дела. Это гарантируется схемой
(`resolution.verdict` обязан совпадать с `correctDecision`) и `caseResolution.test.ts`.

Контент `resolution` авторится не в файлах дел, а в `scripts/data/resolutions/*.json` и
раскладывается по делам через `node scripts/apply-resolutions.mjs` — см.
[docs/07](07-authoring-content.md).

## Гейтинг вердикта (`selectCaseInvestigationGate`)

Правило асимметрично (одинаково для бюджетных и классических дел):

- **Approve** доступен **всегда** — выплата по умолчанию не требует обоснования.
- **Reject** (блокировка выплаты) доступен только при ≥1 заштампованной карточке: чтобы
  отказать в выплате, нужны основания.

Селектор также возвращает `budget / opensRemaining / budgetExhausted` для счётчика и
запечатывания карточек в UI (актуально для бюджетных дел).

На мобильном активном расследовании вердикт всегда находится в fixed action-bar над safe area;
там же показаны число штампов и расход открытий бюджетного дела. Десктопный `VerdictPanel`
остаётся инлайновым. Боковые колонки на мобильном расследовании скрыты, а контент папки получает
нижний отступ высотой action-bar.

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
  (`showRewardedAd` → reveal по `onRewarded`; в dev/офлайн выдаётся мгновенно). Лимита
  «раз за дело» нет: ролик можно смотреть повторно, пока остаются нераскрытые карточки.

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

## Бюро особых дел (сюжетные паки, штампы, наборы)

Вся коммерческая часть живёт в одном полноэкранном разделе `BureauScreen` с тремя вкладками:
**Архивы** (`BureauArchives`), **Штампы** (`BureauWorkshop`) и **Наборы** (`BureauBundles`).
Входов два: кнопка «Бюро особых дел» в `TopBar` (всегда видна, с бейджем NEW пока куплены не все
архивы) и карточка-витрина `SpecialArchivesEntry` в `RightSidebar` / `MobileDeskMenu`. Раздел
заменяет собой стол, а не накрывает его модалкой: `App.tsx` держит `bureauTab` (`null` = стол).

Логика доступа к делам пака вынесена из UI в `src/engine/archiveAccessEngine.ts`
(`getArchiveCaseStatus`, `countAccessibleArchiveCases`, `getNextRewardedCase`) — её читают и
витрина, и карточка на столе.

`THEMATIC_PACKS` в `src/data/thematicPacks.ts` содержит
**только три сюжетных пака** — «СНТ „Ромашка“. Тайна тринадцатого участка», «Поезд №13. Билет до
станции Тихая» и «Санаторий „Прибой“. Последняя смена», по 10 дел каждый (`dacha-romashka-01…10`,
`night-train-01…10`, `sanatorium-priboy-01…10`, `src/data/cases/packs/<pack-id>/`,
`type: "archive"`). Три прежних экспертных архива переехали в
`RETIRED_THEMATIC_PACKS`: на витрину они не попадают, но их данные и 12 дел (`case-040…051`)
остаются в проекте и по-прежнему занимают позиции 39–50 стандартной кампании. Восстановление
покупок и снятие forced-рекламы работают и для снятых с витрины паков (`ALL_THEMATIC_PACKS`).
Витрина даёт второй канал доступа поверх обычной кампании:

- первое дело каждого архива открыто бесплатно;
- `Buy full archive` через Yandex IAP навсегда открывает весь пак и пишет pack id в
  `stats.archivePurchasedPackIds`;
- `Unlock next case with an ad` навсегда открывает одно следующее дело пака и пишет case id в
  `stats.archiveUnlockedCaseIds`;
- rewarded-разблокировка ограничена одним unlock на пак за серверный день; факт расхода хранится в
  `stats.archiveAdUnlockServerDayByPack`;
- archive entitlements override обычный campaign lock внутри `archiveAccessEngine`, но не меняют
  canonical campaign order и не переписывают `caseUnlockEngine`;
- на странице архива CTA меняется местами: пока бесплатный пробник не пройден первичен
  «Играть первое дело бесплатно», после прохождения — покупка («Продолжить расследование»).

### Навигация внутри архива

Пока открыто дело архивного пака, десктопная левая колонка (`LeftSidebar`) показывает **дела
этого же пака**, а не кампанию: `getArchivePackForCase(caseId)` определяет пак,
`listArchiveCases()` — его дела со статусом доступа. Там же появляется ссылка
«← К обычным делам» (`backToCampaign`), единственный явный выход на стол.

«Следующее дело» из `ResultSheet` при этом ведёт внутрь пака —
`getNextArchiveCase(stats, pack, currentId, unlocks)` берёт следующее доступное непройденное
дело того же пака (при необходимости возвращаясь к пропущенным раньше). Если в паке ничего
не осталось, игрок попадает **в Бюро на полку архивов**, а не на стол кампании: всё оставшееся
там за пейволом. Определение пака идёт строго по `THEMATIC_PACKS` — `RETIRED_THEMATIC_PACKS`
всё ещё указывают на дела кампании 40–51, и матч по ним сломал бы обычную прогрессию.

Открытие архивного дела с левой колонки проходит тот же пейвол, что и из Бюро: `openCase()`
проверяет `listArchiveCases(...)` и на `locked` уводит в Бюро вместо запуска дела.

### Наборы (bundles)

`src/data/bundles.ts` описывает три bundle-покупки: `bundle.stamps` (все шуточные подписи),
`bundle.archives` (три архива) и `bundle.complete` (три архива + все подписи). Bundle не
является отдельной сущностью прогресса —
он **выдаёт содержимое** (`grantBundlePurchase` → `grantArchivePurchases` + `grantStampTextPurchases`)
и пишет id в `stats.purchasedBundleIds`. Цена «до» и процент скидки всегда **выводятся** из
`fallbackPriceRub` содержимого (`getBundleListPriceRub` / `getBundleDiscountPercent`, floor), поэтому
реклама скидки не может разойтись с составом. `applyRestoredPurchases` обязана мапить bundle
product id обратно на содержимое — иначе переустановка теряет покупку целиком.

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

- **Интерстишл — только на выходе из завершённого дела** («следующее дело» / «на стол»),
  никогда внутри расследования и никогда при уходе без вердикта. Темп: первый показ не
  раньше 2 закрытых дел и 7 минут активной игры, дальше — не чаще раза в 6 минут активного
  времени **и** не чаще раза в два дела; отсчёт идёт от фактически показанной рекламы.
  Купившим No Ads и внутри купленного архивного пака forced-рекламы нет. Логика —
  `evaluateInterstitial` (`engine/adPolicyEngine.ts`), тайминги крутятся удалённой
  конфигурацией — см. [06-yandex-platform.md](06-yandex-platform.md).
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
`src/data/cases/packs/<pack-id>/<pack-id>-NN.json` (`type: "archive"`, outside the 50 campaign
slots) — and, for the retired expert packs, from `src/data/cases/archives/<archive-id>/case-*.json`.
Per-case availability/completion state is matched by those case ids from `caseUnlockEngine`.
## Campaign 1–50 deduction flow

Canonical order is the integer `campaignOrder` stored in every standard case. Stable case IDs are
not renumbered. `requiredLevel` is still a complexity tier (maximum 16), while strict completion of
the previous campaign position is the primary gate.

The claim contains 2–4 atomic `claimStatements`. `claim_main` preserves the full original text and
is never stampable. A contradiction stamp is legal only after the evidence is viewed, its
`statementLink.relation` is `contradicts`, the target statement is stampable, and an interactive
analysis (when present) has completed. `supports` and `contextualizes` evidence cannot be stamped.
Reward/mastery scoring compares the exact statement/evidence pair.

Evidence may be `core`, `supporting`, `bonus` or `arc`. Optional
`unlocksAfterEvidenceIds`/`revealsEvidenceIds` describe a graph; prerequisites keep a card hidden.
Arc evidence is hidden from the ordinary investigation and never consumes `investigationBudget`.
All 50 cases have a numeric budget, validated against the accessible non-arc evidence.

The first three cases are one onboarding chain. Until a correct case-3 verdict sets `metaUnlocked`,
the mobile desk menu and the "back to desk" affordance are suppressed and the result sheet advances
to the next case (the desktop side columns stay visible throughout — see
[docs/05](05-design.md#layout)). Case 1
teaches thermal analysis and a precise false-statement stamp; case 2 teaches that suspicion is not
proof; case 3 introduces document comparison.

After the correct verdict in campaign case 50, `EvidenceLinkBoard` opens the configured arc evidence
for free. It requires the JSON-defined links, stores attempts/links/completion, reveals the conclusion
only on success and permits skip after the configured number of failed attempts.
