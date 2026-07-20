# Change set: дело 22 / case-024

## Данные

- campaignOrder: 22
- requiredLevel: 11
- title.ru: Звонок в 17:41
- groundTruth: valid
- correctDecision: approve
- evidenceCount: 4
- interactiveEvidenceCount: 0
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-phone — phone_records; contradiction=false
- 2. ev-police — document; contradiction=false
- 3. ev-photo — photo; contradiction=false
- 4. ev-estimate — document; contradiction=false

## Интерактивные изменения

- Новые интерактивные улики в это дело не добавляются.

## Ассеты

- Всего новых/условно новых файлов: 0.
- Интерактивные требования: отсутствуют.

## Миграция

Не менять стабильный ID case-024. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
