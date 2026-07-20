# Change set: дело 41 / case-043

## Данные

- campaignOrder: 41
- requiredLevel: 21
- title.ru: Стажёр, который ушёл сам
- groundTruth: fraud
- correctDecision: reject
- evidenceCount: 6
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. corridor-cam — camera_recording; contradiction=false
- 2. exit-pass — usage_log; contradiction=true
- 3. cache-photo — photo; contradiction=true
- 4. letter — document; contradiction=false
- 5. protocol — document_scan; contradiction=false
- 6. phone-detail — phone_records; contradiction=true

## Интерактивные изменения

- protocol: document → document_scan; contextualizes claim_documents_lost.

## Ассеты

- Всего новых/условно новых файлов: 4.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-043. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
