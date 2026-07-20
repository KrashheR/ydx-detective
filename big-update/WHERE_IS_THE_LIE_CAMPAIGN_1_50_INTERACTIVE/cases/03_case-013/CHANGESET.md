# Change set: дело 3 / case-013

## Данные

- campaignOrder: 3
- requiredLevel: 2
- title.ru: Телефон со дна озера
- groundTruth: fraud
- correctDecision: reject
- evidenceCount: 3
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-service-photo — photo; contradiction=false
- 2. ev-service-act — document_scan; contradiction=true
- 3. ev-operator-log — usage_log; contradiction=true

## Интерактивные изменения

- ev-service-act: document → document_scan; contradicts claim_recovered_phone_is_insured.

## Ассеты

- Всего новых/условно новых файлов: 2.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-013. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
