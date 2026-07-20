# Change set: дело 27 / case-029

## Данные

- campaignOrder: 27
- requiredLevel: 14
- title.ru: Разряд через весь дом
- groundTruth: valid
- correctDecision: approve
- evidenceCount: 6
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-meteo — document; contradiction=false
- 2. ev-meter — usage_log; contradiction=false
- 3. ev-photo — thermal_scan; contradiction=false
- 4. ev-electrician — document; contradiction=false
- 5. ev-receipts — document; contradiction=false
- 6. ev-neighbor — witness_statement; contradiction=false

## Интерактивные изменения

- ev-photo: photo → thermal_scan; supports claim_lightning.

## Ассеты

- Всего новых/условно новых файлов: 3.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-029. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
