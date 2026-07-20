# Change set: дело 8 / case-019

## Данные

- campaignOrder: 8
- requiredLevel: 4
- title.ru: Ночной водитель
- groundTruth: valid
- correctDecision: approve
- evidenceCount: 4
- interactiveEvidenceCount: 0
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-neighbor — document; contradiction=false
- 2. ev-mower-log — usage_log; contradiction=false
- 3. ev-remote-photo — photo; contradiction=false
- 4. ev-camera — camera_recording; contradiction=false

## Интерактивные изменения

- Новые интерактивные улики в это дело не добавляются.

## Ассеты

- Всего новых/условно новых файлов: 1.
- Интерактивные требования: отсутствуют.

## Миграция

Не менять стабильный ID case-019. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
