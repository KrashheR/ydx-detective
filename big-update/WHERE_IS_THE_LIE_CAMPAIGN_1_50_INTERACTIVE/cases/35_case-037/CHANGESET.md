# Change set: дело 35 / case-037

## Данные

- campaignOrder: 35
- requiredLevel: 18
- title.ru: Три силуэта в контейнере
- groundTruth: fraud
- correctDecision: reject
- evidenceCount: 6
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-backup — shadow_time_check; contradiction=true
- 2. ev-xray — xray; contradiction=true
- 3. ev-sale — bank_statement; contradiction=false
- 4. ev-cameras — usage_log; contradiction=true
- 5. ev-shipping — document; contradiction=false
- 6. ev-wash — witness_statement; contradiction=false

## Интерактивные изменения

- ev-backup: camera_recording → shadow_time_check; contradicts claim_theft_time.

## Ассеты

- Всего новых/условно новых файлов: 4.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-037. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
