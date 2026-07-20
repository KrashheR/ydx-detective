# Change set: дело 37 / case-039

## Данные

- campaignOrder: 37
- requiredLevel: 19
- title.ru: Робот, разобравший солнце
- groundTruth: fraud
- correctDecision: reject
- evidenceCount: 6
- interactiveEvidenceCount: 0
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-camera — camera_recording; contradiction=true
- 2. ev-log — usage_log; contradiction=true
- 3. ev-cuts — document; contradiction=true
- 4. ev-gps — gps; contradiction=false
- 5. ev-debt — bank_statement; contradiction=false
- 6. ev-neighbor — witness_statement; contradiction=false

## Интерактивные изменения

- Новые интерактивные улики в это дело не добавляются.

## Ассеты

- Всего новых/условно новых файлов: 2.
- Интерактивные требования: отсутствуют.

## Миграция

Не менять стабильный ID case-039. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
