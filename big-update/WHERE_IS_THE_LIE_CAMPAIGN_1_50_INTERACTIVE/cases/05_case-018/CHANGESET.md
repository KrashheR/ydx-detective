# Change set: дело 5 / case-018

## Данные

- campaignOrder: 5
- requiredLevel: 3
- title.ru: Кольцо на высоте
- groundTruth: valid
- correctDecision: approve
- evidenceCount: 4
- interactiveEvidenceCount: 0
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-camera — camera_recording; contradiction=false
- 2. ev-flight-log — gps_track; contradiction=false
- 3. ev-witness — witness_statement; contradiction=false
- 4. ev-search — document; contradiction=false

## Интерактивные изменения

- Новые интерактивные улики в это дело не добавляются.

## Ассеты

- Всего новых/условно новых файлов: 1.
- Интерактивные требования: отсутствуют.

## Миграция

Не менять стабильный ID case-018. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
