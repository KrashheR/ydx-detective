# Change set: дело 20 / case-022

## Данные

- campaignOrder: 20
- requiredLevel: 10
- title.ru: Погром в «Компасе»
- groundTruth: valid
- correctDecision: approve
- evidenceCount: 4
- interactiveEvidenceCount: 1
- Добавить claimStatements с устойчивыми statementId.
- Обновить narrative.preBrief, postVerdictNote, nextCaseTeaser и seasonClue.

## Порядок улик

- 1. ev-forensic — document; contradiction=false
- 2. ev-cctv — camera_recording; contradiction=false
- 3. ev-inventory — document; contradiction=false
- 4. ev-fragment — document_scan; contradiction=false

## Интерактивные изменения

- ev-fragment: photo → document_scan; reveals_season_clue claim_main.

## Ассеты

- Всего новых/условно новых файлов: 5.
- Интерактивные требования: см. ASSETS_REQUIRED.md и prompts/..

## Миграция

Не менять стабильный ID case-022. Завершённость и награды старых пользователей продолжают определяться по ID, а не по campaignOrder.
