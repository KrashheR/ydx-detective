# Change set: дело 17 / case-015

## Данные

- campaignOrder: 17
- requiredLevel: 9
- title.ru: Не та яхта
- groundTruth: fraud
- correctDecision: reject
- evidenceCount: 4
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-weather — document; contradiction=false
- 2. ev-rescue — camera_recording; contradiction=false
- 3. ev-hull — seal_match; contradiction=true
- 4. ev-transport — gps; contradiction=true

## Интерактивные изменения

- ev-hull: photo → seal_match; contradicts claim_lost_vessel_identity.

## Ассеты

- Всего новых/условно новых файлов: 5.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-015. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
