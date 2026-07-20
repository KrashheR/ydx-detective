# Change set: дело 9 / case-021

## Данные

- campaignOrder: 9
- requiredLevel: 5
- title.ru: Прорыв под «Маяком»
- groundTruth: fraud
- correctDecision: reject
- evidenceCount: 4
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-utility — document; contradiction=false
- 2. ev-pipe-photo — surface_reveal; contradiction=true
- 3. ev-club-chat — document; contradiction=true
- 4. ev-voice — document; contradiction=false

## Интерактивные изменения

- ev-pipe-photo: photo → surface_reveal; contradicts claim_cause.

## Ассеты

- Всего новых/условно новых файлов: 4.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-021. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
