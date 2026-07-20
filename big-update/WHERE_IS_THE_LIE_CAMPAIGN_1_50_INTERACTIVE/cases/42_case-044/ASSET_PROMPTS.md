# Ассеты для дела 42. Слишком удобная серая лента

## Глобальные правила

- Документальный страховой стиль, реалистичные материалы и физика.
- Нет реальных брендов, логотипов, знаменитостей, водяных знаков и чужой франшизной атрибутики.
- Важный текст, время, номера, подписи и температуры создаются программно.
- Любой AI-ассет проходит ручную сверку ракурса с hotspot/overlay.

## 1. people/evelina-morn-grounded.webp

- Назначение: generate_if_needed
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Illustrated archival claimant ID portrait matching the existing insurance detective game: female medicinal greenhouse owner, 49 years old, practical horticultural jacket, carefully composed appearance, tense defensive expression, neutral document-photo background, original face, no magical plants or fantasy costume, no logos, no text, no watermark.

## 2. evidence/case-044-photo-44.webp

- Назначение: generate
- Разрешение: сохранить размер существующей карточки
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: проверить соответствие тексту и удалить случайный текст

### Prompt

Forensic greenhouse fire evidence photograph: localized burn origin on a metal mixing table with a scorched bowl and heater, surrounding medicinal root beds only smoke-damaged, a short piece of plain gray tape visibly lying on top of settled ash, realistic restrained scene, no magical plants, no logos, no text, no watermark.

## 3. assets/interactive/photo-44-scene.webp

- Назначение: Обычная фотография места для процедурной тепловой карты
- Разрешение: 1600×1000
- Формат: WebP
- Прозрачность: нет
- Создаёт: image_model
- Ручная постобработка: Проверить, что ключевые объекты не перекрыты и совпадают с координатами heatZones.

### Prompt

Теплица после небольшого локального пожара, металлическая чаша на рабочем столе, грядки и климатический блок хорошо видны. The thermal anomaly will be added programmatically. Do not add thermal colors, hot spots, infrared HUD or temperature labels. Photorealistic insurance-investigation evidence photograph, documentary look, shot on a phone or compact camera by a non-professional, natural available light, neutral muted colors, realistic textures, high detail. No captions, no watermark, no logos, no readable real-world branding, no famous people, no recognizable copyrighted characters, no visible faces unless explicitly required. Evidence photo, not illustration or cinematic poster.

## 4. assets/interactive/photo-44-heat-zones.json

- Назначение: Процедурные маски, температуры и подписи
- Разрешение: normalized percent coordinates
- Формат: JSON
- Прозрачность: да
- Создаёт: frontend
- Ручная постобработка: Откалибровать зоны после утверждения изображения.

### Prompt

Промпт не требуется: файл создаётся программно из JSON/SVG/Canvas.
