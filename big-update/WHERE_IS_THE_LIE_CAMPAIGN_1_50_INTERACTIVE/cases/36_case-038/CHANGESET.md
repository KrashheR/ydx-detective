# Change set: дело 36 / case-038

## Данные

- campaignOrder: 36
- requiredLevel: 18
- title.ru: Лаборатория №394
- groundTruth: valid
- correctDecision: approve
- evidenceCount: 6
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-camera — camera_recording; contradiction=false
- 2. ev-document — document; contradiction=false
- 3. ev-log — usage_log; contradiction=false
- 4. ev-analysis — document_scan; contradiction=false
- 5. ev-call — phone_records; contradiction=false
- 6. ev-supplier — document; contradiction=false

## Интерактивные изменения

- ev-analysis: document → document_scan; supports claim_supplier_error.

## Ассеты

- Всего новых/условно новых файлов: 4.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-038. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
