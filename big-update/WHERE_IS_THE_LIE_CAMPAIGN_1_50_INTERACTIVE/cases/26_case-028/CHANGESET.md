# Change set: дело 26 / case-028

## Данные

- campaignOrder: 26
- requiredLevel: 13
- title.ru: Склад без товара
- groundTruth: fraud
- correctDecision: reject
- evidenceCount: 5
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-cam — seal_match; contradiction=true
- 2. ev-alarm — usage_log; contradiction=true
- 3. ev-fire — document; contradiction=true
- 4. ev-route — gps; contradiction=false
- 5. ev-debt — bank_statement; contradiction=false

## Интерактивные изменения

- ev-cam: camera_recording → seal_match; contradicts claim_goods_destroyed.

## Ассеты

- Всего новых/условно новых файлов: 3.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-028. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
