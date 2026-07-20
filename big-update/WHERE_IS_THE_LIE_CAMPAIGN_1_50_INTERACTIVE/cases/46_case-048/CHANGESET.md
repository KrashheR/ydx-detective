# Change set: дело 46 / case-048

## Данные

- campaignOrder: 46
- requiredLevel: 26
- title.ru: Разгром после закрытия
- groundTruth: fraud
- correctDecision: reject
- evidenceCount: 6
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. photo-48 — photo; contradiction=true
- 2. document-48 — document_scan; contradiction=true
- 3. camera-48 — camera_recording; contradiction=true
- 4. log-48 — usage_log; contradiction=true
- 5. bank-48 — bank_statement; contradiction=false
- 6. witness-48 — witness_statement; contradiction=false

## Интерактивные изменения

- document-48: document → document_scan; contradicts claim_new_equipment_destroyed.

## Ассеты

- Всего новых/условно новых файлов: 4.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-048. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
