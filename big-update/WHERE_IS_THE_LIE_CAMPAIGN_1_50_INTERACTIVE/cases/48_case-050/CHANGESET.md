# Change set: дело 48 / case-050

## Данные

- campaignOrder: 48
- requiredLevel: 28
- title.ru: Огонь в «Компасе»
- groundTruth: valid
- correctDecision: approve
- evidenceCount: 6
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. photo-50 — seal_match; contradiction=false
- 2. document-50 — document; contradiction=false
- 3. camera-50 — camera_recording; contradiction=false
- 4. log-50 — usage_log; contradiction=false
- 5. route-50 — gps; contradiction=false
- 6. witness-50 — witness_statement; contradiction=false

## Интерактивные изменения

- photo-50: photo → seal_match; supports claim_external_arson.

## Ассеты

- Всего новых/условно новых файлов: 4.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-050. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
