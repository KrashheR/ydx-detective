# Change set: дело 24 / case-026

## Данные

- campaignOrder: 24
- requiredLevel: 12
- title.ru: Часы после кражи
- groundTruth: fraud
- correctDecision: reject
- evidenceCount: 5
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-police — document; contradiction=false
- 2. ev-photo — photo; contradiction=true
- 3. ev-auction — document_scan; contradiction=true
- 4. ev-bank — bank_statement; contradiction=false
- 5. ev-appraisal — document; contradiction=false

## Интерактивные изменения

- ev-auction: document → document_scan; contradicts claim_theft_timing.

## Ассеты

- Всего новых/условно новых файлов: 4.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-026. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
