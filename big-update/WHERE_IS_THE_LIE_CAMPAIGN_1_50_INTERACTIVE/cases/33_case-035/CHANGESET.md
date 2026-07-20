# Change set: дело 33 / case-035

## Данные

- campaignOrder: 33
- requiredLevel: 17
- title.ru: Следы шин в «Янтаре»
- groundTruth: fraud
- correctDecision: reject
- evidenceCount: 6
- interactiveEvidenceCount: 0
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-camera — camera_recording; contradiction=false
- 2. ev-tyres — photo; contradiction=true
- 3. ev-sprayers — document; contradiction=true
- 4. ev-gps — gps; contradiction=true
- 5. ev-admin — witness_statement; contradiction=false
- 6. ev-deposit — bank_statement; contradiction=false

## Интерактивные изменения

- Новые интерактивные улики в это дело не добавляются.

## Ассеты

- Всего новых/условно новых файлов: 2.
- Интерактивные требования: отсутствуют.

## Миграция

Не менять стабильный ID case-035. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
