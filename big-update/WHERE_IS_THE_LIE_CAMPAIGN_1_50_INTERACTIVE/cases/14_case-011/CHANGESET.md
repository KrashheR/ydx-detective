# Change set: дело 14 / case-011

## Данные

- campaignOrder: 14
- requiredLevel: 7
- title.ru: Дом без взломщика
- groundTruth: fraud
- correctDecision: reject
- evidenceCount: 4
- interactiveEvidenceCount: 0
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-alarm — usage_log; contradiction=true
- 2. ev-forensic — document; contradiction=false
- 3. ev-vault — document; contradiction=true
- 4. ev-appraisal — document; contradiction=false

## Интерактивные изменения

- Новые интерактивные улики в это дело не добавляются.

## Ассеты

- Всего новых/условно новых файлов: 0.
- Интерактивные требования: отсутствуют.

## Миграция

Не менять стабильный ID case-011. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
