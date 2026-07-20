# Change set: дело 15 / case-012

## Данные

- campaignOrder: 15
- requiredLevel: 8
- title.ru: Право на время
- groundTruth: valid
- correctDecision: approve
- evidenceCount: 4
- interactiveEvidenceCount: 0
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-diagnosis — document; contradiction=false
- 2. ev-oncologist — document; contradiction=false
- 3. ev-pharmacy — usage_log; contradiction=false
- 4. ev-policy — document; contradiction=false

## Интерактивные изменения

- Новые интерактивные улики в это дело не добавляются.

## Ассеты

- Всего новых/условно новых файлов: 0.
- Интерактивные требования: отсутствуют.

## Миграция

Не менять стабильный ID case-012. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
