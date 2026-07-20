# Change set: дело 6 / case-020

## Данные

- campaignOrder: 6
- requiredLevel: 3
- title.ru: Сорок пропавших пицц
- groundTruth: fraud
- correctDecision: reject
- evidenceCount: 4
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-camera — camera_recording; contradiction=false
- 2. ev-delivery-receipt — seal_match; contradiction=true
- 3. ev-van-log — usage_log; contradiction=true
- 4. ev-landlord-chat — document; contradiction=false

## Интерактивные изменения

- ev-delivery-receipt: document → seal_match; contradicts claim_intruder.

## Ассеты

- Всего новых/условно новых файлов: 4.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-020. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
