# Change set: дело 18 / case-016

## Данные

- campaignOrder: 18
- requiredLevel: 9
- title.ru: Четыре дня без магазина
- groundTruth: valid
- correctDecision: approve
- evidenceCount: 4
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-municipal — document; contradiction=false
- 2. ev-photos — surface_reveal; contradiction=false
- 3. ev-stock — document; contradiction=false
- 4. ev-ledger — document; contradiction=false

## Интерактивные изменения

- ev-photos: photo → surface_reveal; supports claim_damage_scope.

## Ассеты

- Всего новых/условно новых файлов: 2.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-016. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
