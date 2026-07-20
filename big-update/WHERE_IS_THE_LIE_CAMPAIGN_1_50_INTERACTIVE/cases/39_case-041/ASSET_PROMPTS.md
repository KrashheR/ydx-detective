# Ассеты для дела 39. Перехватчик в ледяном каньоне

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/elian-kord-grounded.webp

- Назначение: generate_if_needed
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing insurance detective game: male experimental rescue pilot, 27 years old, athletic but tired, practical civilian flight jacket, minor healed facial scrape, guarded expression, neutral document-photo background, no space uniform, no military insignia, no famous likeness, no logos, no text, no watermark.

## 2. evidence/case-041-ev-crash.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Documentary rescue evidence photograph of a crashed experimental high-speed rescue aircraft in an icy mountain canyon, broken composite fuselage and snow debris, several suspicious small holes added over existing fracture lines, realistic aviation scale, no spacecraft, no military insignia, no logos, no text, no watermark.

## 3. assets/interactive/ev-manifest-base.webp

- Назначение: Базовая версия документа в normal-режиме
- Разрешение: 1600×1100
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Удалить случайный читаемый текст; выровнять документ; оставить поля для UI-слоёв.

### Prompt

Create a realistic fictional administrative document for an insurance detective game. Фиктивная грузовая ведомость экспериментального самолёта, крупные поля массы и маршрута, лёгкие следы копоти. Full document visible from above, utilitarian layout, paper texture, large blank structured fields. No real organization, logo, brand, personal data or watermark. Do not render critical readable text; dates, names, codes and signatures will be added in HTML/SVG. The hidden anomaly must not be obvious in the normal version.

## 4. assets/interactive/ev-manifest-scan-overlay.svg

- Назначение: Совмещённый слой УФ/просвета/бокового света
- Разрешение: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: После финального base.webp откалибровать hotspot и режим проявления.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.
