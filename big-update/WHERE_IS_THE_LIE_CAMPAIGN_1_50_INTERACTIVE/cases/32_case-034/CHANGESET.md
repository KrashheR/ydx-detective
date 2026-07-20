# Change set: дело 32 / case-034

## Данные

- campaignOrder: 32
- requiredLevel: 16
- title.ru: Серийные номера в пепле
- groundTruth: fraud
- correctDecision: reject
- evidenceCount: 6
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-cam — camera_recording; contradiction=true
- 2. ev-serials — surface_reveal; contradiction=true
- 3. ev-panel — usage_log; contradiction=false
- 4. ev-fire — document; contradiction=true
- 5. ev-route — gps; contradiction=false
- 6. ev-debt — bank_statement; contradiction=false

## Интерактивные изменения

- ev-serials: document → surface_reveal; contradicts claim_new_goods_destroyed.

## Ассеты

- Всего новых/условно новых файлов: 3.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-034. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
