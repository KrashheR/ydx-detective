# Change set: дело 4 / case-003

## Данные

- campaignOrder: 4
- requiredLevel: 2
- title.ru: Часы в желудке
- groundTruth: fraud
- correctDecision: reject
- evidenceCount: 4
- interactiveEvidenceCount: 0
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-xray — photo; contradiction=false
- 2. ev-vet-act — document; contradiction=true
- 3. ev-watch-policy — document; contradiction=false
- 4. ev-listing — document; contradiction=true

## Интерактивные изменения

- Новые интерактивные улики в это дело не добавляются.

## Ассеты

- Всего новых/условно новых файлов: 1.
- Интерактивные требования: отсутствуют.

## Миграция

Не менять стабильный ID case-003. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
