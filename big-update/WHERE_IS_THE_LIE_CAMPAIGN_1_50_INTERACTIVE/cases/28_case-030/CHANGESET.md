# Change set: дело 28 / case-030

## Данные

- campaignOrder: 28
- requiredLevel: 14
- title.ru: Столкновение ради пломбы
- groundTruth: fraud
- correctDecision: reject
- evidenceCount: 6
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-cam — camera_recording; contradiction=true
- 2. ev-phone — phone_records; contradiction=true
- 3. ev-sealcam — seal_match; contradiction=true
- 4. ev-bank — bank_statement; contradiction=false
- 5. ev-police — document; contradiction=false
- 6. ev-damage — photo; contradiction=false

## Интерактивные изменения

- ev-sealcam: camera_recording → seal_match; contradicts claim_seal_untouched.

## Ассеты

- Всего новых/условно новых файлов: 5.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-030. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
