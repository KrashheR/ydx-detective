# Change set: дело 34 / case-036

## Данные

- campaignOrder: 34
- requiredLevel: 17
- title.ru: Невозможная скорость
- groundTruth: valid
- correctDecision: approve
- evidenceCount: 6
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-weather — document; contradiction=false
- 2. ev-camera — camera_recording; contradiction=false
- 3. ev-log — usage_log; contradiction=false
- 4. ev-gps — gps; contradiction=false
- 5. ev-melt — thermal_scan; contradiction=false
- 6. ev-station — document; contradiction=false

## Интерактивные изменения

- ev-melt: document → thermal_scan; supports claim_lightning.

## Ассеты

- Всего новых/условно новых файлов: 4.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-036. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
