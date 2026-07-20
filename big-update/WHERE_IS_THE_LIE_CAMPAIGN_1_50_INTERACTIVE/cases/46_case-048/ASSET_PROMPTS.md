# Ассеты для дела 46. Разгром после закрытия

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/marko-lin-grounded.webp

- Назначение: generate_if_needed
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing insurance detective game: male pizzeria owner, 44 years old, plain dark polo and work jacket, brisk businesslike expression, neutral document-photo background, original face, no masks, no martial arts styling, no franchise color coding, no logos, no text, no watermark.

## 2. evidence/case-048-photo-48.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Close documentary restaurant equipment evidence photo of a heavily dented old tunnel warming cabinet, fresh bent outer panel revealing years of corrosion and an older weld beneath, realistic commercial kitchen, no people, no readable brands, no logos, no text, no watermark.

## 3. assets/interactive/document-48-base.webp

- Назначение: Базовая версия документа в normal-режиме
- Разрешение: 1600×1100
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Удалить случайный читаемый текст; выровнять документ; оставить поля для UI-слоёв.

### Prompt

Create a realistic fictional administrative document for an insurance detective game. Фиктивный счёт на промышленный тепловой шкаф, крупные поля покупателя и серийного номера, без брендов. Full document visible from above, utilitarian layout, paper texture, large blank structured fields. No real organization, logo, brand, personal data or watermark. Do not render critical readable text; dates, names, codes and signatures will be added in HTML/SVG. The hidden anomaly must not be obvious in the normal version.

## 4. assets/interactive/document-48-scan-overlay.svg

- Назначение: Совмещённый слой УФ/просвета/бокового света
- Разрешение: viewBox 0 0 100 100
- Формат: SVG
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: После финального base.webp откалибровать hotspot и режим проявления.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.
