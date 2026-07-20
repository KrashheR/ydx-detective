# Ассеты для дела 24. Часы после кражи

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/eduard-kravets.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing insurance detective game: European male watch collector, 50 years old, carefully groomed hair, understated expensive jacket, composed self-assured expression, neutral document-photo background, original face distinct from Eduard Vinogradov, no real brands, no text, no watermark.

## 2. evidence/case-026-ev-photo.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Candid documentary event photograph of a middle-aged man at a private reception, only torso and wrist emphasized, wearing a distinctive unbranded mechanical wristwatch with a small diagonal scratch on the case, neutral upscale interior, no readable faces required, no logos, no watermark.

## 3. assets/interactive/ev-auction-base.webp

- Назначение: Базовая версия документа в normal-режиме
- Разрешение: 1600×1100
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Удалить случайный читаемый текст; выровнять документ; оставить поля для UI-слоёв.

### Prompt

Create a realistic fictional administrative document for an insurance detective game. Нейтральный акт приёма коллекционных часов, крупное поле даты и серийного номера, без логотипа аукциона. Full document visible from above, utilitarian layout, paper texture, large blank structured fields. No real organization, logo, brand, personal data or watermark. Do not render critical readable text; dates, names, codes and signatures will be added in HTML/SVG. The hidden anomaly must not be obvious in the normal version.

## 4. assets/interactive/ev-auction-scan-overlay.svg

- Назначение: Совмещённый слой УФ/просвета/бокового света
- Разрешение: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: После финального base.webp откалибровать hotspot и режим проявления.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.
