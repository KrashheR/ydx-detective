# Change set: дело 38 / case-040

## Данные

- campaignOrder: 38
- requiredLevel: 19
- title.ru: Пожар на «Лунном склоне»
- groundTruth: valid
- correctDecision: approve
- evidenceCount: 6
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-photo — seal_match; contradiction=false
- 2. ev-camera — camera_recording; contradiction=false
- 3. ev-access — usage_log; contradiction=false
- 4. ev-alibi — phone_records; contradiction=false
- 5. ev-inventory — document; contradiction=false
- 6. ev-route — gps; contradiction=false

## Интерактивные изменения

- ev-photo: photo → seal_match; supports claim_external_arson.

## Ассеты

- Всего новых/условно новых файлов: 5.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-040. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
