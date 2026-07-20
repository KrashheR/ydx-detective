# Change set: дело 2 / case-009

## Данные

- campaignOrder: 2
- requiredLevel: 1
- title.ru: Пожар без виновного
- groundTruth: valid
- correctDecision: approve
- evidenceCount: 3
- interactiveEvidenceCount: 0
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-policy — document; contradiction=false
- 2. ev-fire-report — document; contradiction=false
- 3. ev-entry-camera — camera_recording; contradiction=false

## Интерактивные изменения

- Новые интерактивные улики в это дело не добавляются.

## Ассеты

- Всего новых/условно новых файлов: 0.
- Интерактивные требования: отсутствуют.

## Миграция

Не менять стабильный ID case-009. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
