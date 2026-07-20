# Change set: дело 1 / case-001

## Данные

- campaignOrder: 1
- requiredLevel: 1
- title.ru: Телевизор, переживший потоп
- groundTruth: fraud
- correctDecision: reject
- evidenceCount: 2
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-scene — thermal_scan; contradiction=true
- 2. ev-listing — document; contradiction=true

## Интерактивные изменения

- ev-scene: photo → thermal_scan; contradicts claim_tv_never_restarted.

## Ассеты

- Всего новых/условно новых файлов: 2.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-001. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
