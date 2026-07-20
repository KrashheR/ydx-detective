# Change set: дело 49 / case-051

## Данные

- campaignOrder: 49
- requiredLevel: 29
- title.ru: Последний фургон
- groundTruth: fraud
- correctDecision: reject
- evidenceCount: 7
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. photo-51 — photo; contradiction=false
- 2. document-51 — document; contradiction=false
- 3. camera-51 — camera_recording; contradiction=true
- 4. log-51 — usage_log; contradiction=true
- 5. bank-51 — bank_statement; contradiction=true
- 6. gps-51 — gps; contradiction=false
- 7. photo-staged-van — shadow_time_check; contradiction=true

## Интерактивные изменения

- photo-staged-van: new → shadow_time_check; contradicts claim_interception_time.

## Ассеты

- Всего новых/условно новых файлов: 5.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-051. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
