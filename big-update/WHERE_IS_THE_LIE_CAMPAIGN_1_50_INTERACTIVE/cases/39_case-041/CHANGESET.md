# Change set: дело 39 / case-041

## Данные

- campaignOrder: 39
- requiredLevel: 20
- title.ru: Перехватчик в ледяном каньоне
- groundTruth: fraud
- correctDecision: reject
- evidenceCount: 6
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-crash — photo; contradiction=true
- 2. ev-manifest — document_scan; contradiction=true
- 3. ev-nav — gps; contradiction=false
- 4. ev-flight — usage_log; contradiction=true
- 5. ev-broker — bank_statement; contradiction=false
- 6. ev-rescue — camera_recording; contradiction=false

## Интерактивные изменения

- ev-manifest: document → document_scan; contradicts claim_declared_cargo.

## Ассеты

- Всего новых/условно новых файлов: 4.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-041. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
