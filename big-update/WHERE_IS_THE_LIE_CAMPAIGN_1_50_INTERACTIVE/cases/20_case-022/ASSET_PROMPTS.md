# Ассеты для дела 20. Погром в «Компасе»

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/mikhail-ternov.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching an established insurance detective game: Russian male restoration craftsman, 69 years old, thoughtful lined face, gray hair, simple dark cardigan and light work shirt, calm dignity, neutral document-photo background, original appearance, no martial arts clothing, no franchise imagery, no text or logo.

## 2. evidence/case-022-ev-workshop.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Documentary insurance evidence photograph inside a small navigation-instrument restoration workshop after a real burglary: broken glass display cases, overturned wooden cabinet, empty padded stand for a brass marine chronometer, scattered archival papers and precision tools, realistic restrained damage, no dojo, no weapons, no logos, no readable text, no watermark.

## 3. evidence/case-022-ev-cctv.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Night pharmacy exterior CCTV frame looking toward a service courtyard: two adult burglars in plain dark work clothes carrying a flat archive box and a small hard case toward an unmarked gray van, faces indistinct, realistic municipal lighting and CCTV compression, no masks with colors, no logos, no text, no watermark.

## 4. assets/interactive/ev-fragment-base.webp

- Назначение: Базовая версия документа в normal-режиме
- Разрешение: 1600×1100
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Удалить случайный читаемый текст; выровнять документ; оставить поля для UI-слоёв.

### Prompt

Create a realistic fictional administrative document for an insurance detective game. Старый лист страхового реестра с потёртой бумагой, пустой зоной резолюции и следами ластика; текст программный. Full document visible from above, utilitarian layout, paper texture, large blank structured fields. No real organization, logo, brand, personal data or watermark. Do not render critical readable text; dates, names, codes and signatures will be added in HTML/SVG. The hidden anomaly must not be obvious in the normal version.

## 5. assets/interactive/ev-fragment-scan-overlay.svg

- Назначение: Совмещённый слой УФ/просвета/бокового света
- Разрешение: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: После финального base.webp откалибровать hotspot и режим проявления.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.
