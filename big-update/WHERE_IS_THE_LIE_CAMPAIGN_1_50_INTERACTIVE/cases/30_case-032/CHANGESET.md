# Change set: дело 30 / case-032

## Данные

- campaignOrder: 30
- requiredLevel: 15
- title.ru: Внедорожник за воротами
- groundTruth: fraud
- correctDecision: reject
- evidenceCount: 6
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-keylog — usage_log; contradiction=true
- 2. ev-gps — gps; contradiction=false
- 3. ev-cam — camera_recording; contradiction=true
- 4. ev-parts — bank_statement; contradiction=true
- 5. ev-yardphoto — photo; contradiction=false
- 6. ev-police — document_scan; contradiction=true

## Интерактивные изменения

- ev-police: document → document_scan; contradicts claim_keys.

## Ассеты

- Всего новых/условно новых файлов: 4.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-032. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
