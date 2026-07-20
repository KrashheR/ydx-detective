# Change set: дело 44 / case-046

## Данные

- campaignOrder: 44
- requiredLevel: 24
- title.ru: Падение, которого не было
- groundTruth: fraud
- correctDecision: reject
- evidenceCount: 6
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. photo-46 — seal_match; contradiction=true
- 2. document-46 — xray; contradiction=true
- 3. camera-46 — camera_recording; contradiction=true
- 4. log-46 — usage_log; contradiction=true
- 5. bank-46 — bank_statement; contradiction=false
- 6. witness-46 — witness_statement; contradiction=true

## Интерактивные изменения

- photo-46: photo → seal_match; contradicts claim_gc17_sabotage.

## Ассеты

- Всего новых/условно новых файлов: 5.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-046. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
