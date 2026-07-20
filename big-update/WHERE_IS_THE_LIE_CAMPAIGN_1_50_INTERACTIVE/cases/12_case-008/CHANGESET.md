# Change set: дело 12 / case-008

## Данные

- campaignOrder: 12
- requiredLevel: 6
- title.ru: Три месяца в постели
- groundTruth: fraud
- correctDecision: reject
- evidenceCount: 4
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-ernote — document; contradiction=false
- 2. ev-sickleave — document_scan; contradiction=true
- 3. ev-work-app — usage_log; contradiction=true
- 4. ev-payment — bank_statement; contradiction=true

## Интерактивные изменения

- ev-sickleave: document → document_scan; contradicts claim_disability_duration.

## Ассеты

- Всего новых/условно новых файлов: 2.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-008. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
