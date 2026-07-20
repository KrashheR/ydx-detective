# Change set: дело 11 / case-006

## Данные

- campaignOrder: 11
- requiredLevel: 6
- title.ru: Погреб, который не нагрелся
- groundTruth: fraud
- correctDecision: reject
- evidenceCount: 4
- interactiveEvidenceCount: 0
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-utility — document; contradiction=false
- 2. ev-temp — usage_log; contradiction=true
- 3. ev-generator — document; contradiction=true
- 4. ev-appraisal — document; contradiction=false

## Интерактивные изменения

- Новые интерактивные улики в это дело не добавляются.

## Ассеты

- Всего новых/условно новых файлов: 0.
- Интерактивные требования: отсутствуют.

## Миграция

Не менять стабильный ID case-006. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
