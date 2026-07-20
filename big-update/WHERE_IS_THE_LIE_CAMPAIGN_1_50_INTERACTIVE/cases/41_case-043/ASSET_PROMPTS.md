# Ассеты для дела 41. Стажёр, который ушёл сам

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/ilar-roun-grounded.webp

- Назначение: generate_if_needed
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing insurance detective game: male navigation academy mentor, 61 years old, austere intelligent face, gray hair, plain modern academic jacket, controlled authoritative expression, neutral document-photo background, no robes, no mystical symbols, no space-opera costume, no logos, no text, no watermark.

## 2. evidence/case-043-cache-photo.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Documentary evidence photo of a small prepared travel cache hidden behind a bench at a quiet railway platform: compact food pack, folded warm jacket, plain envelope of cash and a printed timetable with no readable text, realistic early-morning light, no sci-fi props, no logos, no watermark.

## 3. assets/interactive/protocol-base.webp

- Назначение: Базовая версия документа в normal-режиме
- Разрешение: 1600×1100
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Удалить случайный читаемый текст; выровнять документ; оставить поля для UI-слоёв.

### Prompt

Create a realistic fictional administrative document for an insurance detective game. Фиктивный учебный протокол академии без логотипа, таблица оценок с крупной зоной исправлений, текст программный. Full document visible from above, utilitarian layout, paper texture, large blank structured fields. No real organization, logo, brand, personal data or watermark. Do not render critical readable text; dates, names, codes and signatures will be added in HTML/SVG. The hidden anomaly must not be obvious in the normal version.

## 4. assets/interactive/protocol-scan-overlay.svg

- Назначение: Совмещённый слой УФ/просвета/бокового света
- Разрешение: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: После финального base.webp откалибровать hotspot и режим проявления.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.
