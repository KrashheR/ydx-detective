# Ассеты для дела 38. Пожар на «Лунном склоне»

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/miron-veil-grounded.webp

- Назначение: generate_if_needed
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing insurance detective game: male remote mountain farm owner, 52 years old, weathered face, practical insulated work jacket, calm resilient expression, neutral document-photo background, original appearance, no space suit, no futuristic armor, no logos, no text, no watermark.

## 2. evidence/case-040-ev-farm.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Remote high-altitude agricultural complex at night after an arson attack: a modest cargo hangar burning near the service door, terraced fields and irrigation structures under moonlight, realistic mountain environment, no lunar surface, no spacecraft, no sci-fi uniforms, documentary insurance evidence style, no logos, no text, no watermark.

## 3. evidence/case-040-ev-camera.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Grainy mountain road security camera frame at night showing an unmarked gray cargo truck leaving a remote farm, several compact irrigation modules visible in the open rear container, realistic road and scale, no readable plate, no logos, no text, no watermark.

## 4. assets/interactive/ev-photo-master-a.webp

- Назначение: Цельный мастер пломбы или контрольного фрагмента A
- Разрешение: 1400×500
- Формат: WebP
- Прозрачность: да
- Создаёт: image_model
- Ручная постобработка: Убрать случайный текст; сохранить альфа-канал; разрезать процедурно по sourceSeed.

### Prompt

Create a realistic intact security seal or evidence control label for a fictional insurance investigation. Два фрагмента серой промышленной фитильной ленты, один частично обгоревший, абстрактная сетка без маркировки. Front view, full object, transparent background, detailed fibers, adhesive or polymer texture, abstract protection pattern, no real logo or brand, no watermark, no critical readable text, restrained utilitarian evidence style. Keep edges suitable for procedural tearing.

## 5. assets/interactive/ev-photo-fragments.json

- Назначение: Seed разрыва, трансформации и допуски
- Разрешение: normalized component space
- Формат: JSON
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Сгенерировать fragment-a.webp и fragment-b.webp из master-файлов; проверить drag/rotate/snap.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.
