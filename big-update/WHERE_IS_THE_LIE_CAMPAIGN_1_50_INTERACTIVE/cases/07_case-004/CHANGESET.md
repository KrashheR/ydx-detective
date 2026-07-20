# Change set: дело 7 / case-004

## Данные

- campaignOrder: 7
- requiredLevel: 4
- title.ru: Корова над помидорами
- groundTruth: valid
- correctDecision: approve
- evidenceCount: 4
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-flight-log — gps_track; contradiction=false
- 2. ev-tracks — shadow_time_check; contradiction=false
- 3. ev-vet — document; contradiction=false
- 4. ev-greenhouse — photo; contradiction=false

## Интерактивные изменения

- ev-tracks: photo → shadow_time_check; supports claim_event_time.

## Ассеты

- Всего новых/условно новых файлов: 3.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-004. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
