# Change set: дело 21 / case-023

## Данные

- campaignOrder: 21
- requiredLevel: 11
- title.ru: Карта, оставшаяся дома
- groundTruth: fraud
- correctDecision: reject
- evidenceCount: 4
- interactiveEvidenceCount: 0
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-travel — document; contradiction=false
- 2. ev-bank — bank_statement; contradiction=true
- 3. ev-doorcam — camera_recording; contradiction=true
- 4. ev-transfer — bank_statement; contradiction=true

## Интерактивные изменения

- Новые интерактивные улики в это дело не добавляются.

## Ассеты

- Всего новых/условно новых файлов: 2.
- Интерактивные требования: отсутствуют.

## Миграция

Не менять стабильный ID case-023. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
