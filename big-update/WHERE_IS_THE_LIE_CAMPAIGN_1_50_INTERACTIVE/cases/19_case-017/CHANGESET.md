# Change set: дело 19 / case-017

## Данные

- campaignOrder: 19
- requiredLevel: 10
- title.ru: Ботинок на 800 ватт
- groundTruth: valid
- correctDecision: approve
- evidenceCount: 4
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-vet — document; contradiction=false
- 2. ev-photo — thermal_scan; contradiction=false
- 3. ev-speaker — usage_log; contradiction=false
- 4. ev-yardcam — camera_recording; contradiction=false

## Интерактивные изменения

- ev-photo: photo → thermal_scan; supports claim_event.

## Ассеты

- Всего новых/условно новых файлов: 3.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-017. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
